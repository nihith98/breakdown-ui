# Adding a TanStack Query Hook

TanStack Query (React Query) manages all server data fetching, caching, and synchronization in the Breakdown frontend. This guide covers how to create query and mutation hooks that integrate seamlessly with your components.

## Hook Naming Conventions

Query hooks follow consistent naming patterns:
- **List queries**: `useNounList` (e.g., `useTransactionList`, `useGroupList`)
- **Single-item queries**: `useNoun` (e.g., `useGroup`, `useTransaction`)
- **Mutation hooks**: `useInsertNoun`, `useUpdateNoun`, `useDeleteNoun` (e.g., `useInsertTransaction`, `useUpdateGroup`, `useDeleteTransaction`)

## QueryKey Strategy

QueryKeys are the foundation of cache invalidation. Follow this pattern:

```typescript
// Pattern: ['domain', id]
['transactions', groupId]      // All transactions for a group
['transactions', groupId, id]  // Specific transaction
['settlements', groupId]       // All settlements for a group
```

The structure enables precise invalidation—changing `groupId` automatically refetches the dependent queries.

## Common Patterns

### Caching and Stale Time

Control how long data remains fresh before refetching:

```typescript
staleTime: 30_000,        // 30 seconds (user interactions won't cause refetch)
cacheTime: 5 * 60_000,    // 5 minutes (data removed from cache if not queried)
```

### Dependent Queries

Pass dependencies as arrays to ensure correct refetch behavior:

```typescript
useQuery({
  queryKey: ['transactions', groupId],
  queryFn: () => fetchTransactions(groupId),
  enabled: !!groupId,  // Only run when groupId exists
})
```

### Optimistic Updates

Update UI immediately while mutation processes, with rollback on failure:

```typescript
onMutate: async (newTransaction) => {
  // Cancel in-flight queries
  await queryClient.cancelQueries({ queryKey: ['transactions', groupId] })
  
  // Snapshot current data
  const previousTransactions = queryClient.getQueryData(['transactions', groupId])
  
  // Optimistically update UI
  queryClient.setQueryData(['transactions', groupId], (old) => [
    ...old,
    newTransaction,
  ])
  
  return { previousTransactions }
},
onError: (err, newTransaction, context) => {
  // Rollback on failure
  queryClient.setQueryData(['transactions', groupId], context.previousTransactions)
},
```

## Cache Invalidation

After mutations, invalidate related queries to trigger refetches:

```typescript
// After inserting a transaction, invalidate:
// 1. The transaction list (so new transaction appears)
// 2. Settlements (because totals may have changed)
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['transactions', groupId] })
  queryClient.invalidateQueries({ queryKey: ['settlements', groupId] })
}
```

## Error Handling and Retry Logic

Configure sensible defaults for failed requests:

```typescript
retry: 2,                    // Retry failed requests twice
retryDelay: (attempt) => 
  Math.min(1000 * 2 ** attempt, 30_000),  // Exponential backoff
```

In components:
- **Silent failures**: Don't show toast for background refetches (stale data is often acceptable)
- **User actions**: Show toast for mutations and initial loads (user expects feedback)

## Complete Hook Example: useTransactions

Here's a production-ready hook showing all patterns:

```typescript
// queries/transactionQueries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TransactionService } from '@/services/transactionService'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'

// Query: Fetch all transactions for a group
export const useTransactionList = (groupId: string) => {
  const { accessToken } = useAuthStore()
  
  return useQuery({
    // Unique key structure: domain + identifier
    queryKey: ['transactions', groupId],
    
    // Fetch function with access token passed from store
    queryFn: () => 
      TransactionService.listTransactions(groupId, accessToken),
    
    // Cache for 30 seconds before marking as stale
    staleTime: 30_000,
    
    // Keep in memory for 5 minutes
    cacheTime: 5 * 60_000,
    
    // Retry twice with exponential backoff
    retry: 2,
    retryDelay: (attempt) => 
      Math.min(1000 * 2 ** attempt, 30_000),
    
    // Only run when we have a valid groupId
    enabled: !!groupId && !!accessToken,
  })
}

// Query: Fetch single transaction
export const useTransaction = (transactionId: string, groupId: string) => {
  const { accessToken } = useAuthStore()
  
  return useQuery({
    queryKey: ['transactions', groupId, transactionId],
    queryFn: () => 
      TransactionService.getTransaction(transactionId, accessToken),
    staleTime: 60_000,  // Single items stay fresh longer
    enabled: !!transactionId && !!accessToken,
  })
}

// Mutation: Insert new transaction
export const useInsertTransaction = () => {
  const qc = useQueryClient()
  const { accessToken } = useAuthStore()
  
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      TransactionService.createTransaction(payload, accessToken),
    
    onSuccess: (newTransaction) => {
      // Refetch transaction list and settlements
      qc.invalidateQueries({ 
        queryKey: ['transactions', newTransaction.groupId] 
      })
      qc.invalidateQueries({ 
        queryKey: ['settlements', newTransaction.groupId] 
      })
    },
  })
}

// Mutation: Update transaction
export const useUpdateTransaction = () => {
  const qc = useQueryClient()
  const { accessToken } = useAuthStore()
  
  return useMutation({
    mutationFn: (payload: UpdateTransactionPayload) =>
      TransactionService.updateTransaction(payload, accessToken),
    
    onSuccess: (updated) => {
      // Update both specific item and list
      qc.invalidateQueries({ 
        queryKey: ['transactions', updated.groupId] 
      })
      qc.invalidateQueries({ 
        queryKey: ['settlements', updated.groupId] 
      })
    },
  })
}

// Mutation: Delete transaction
export const useDeleteTransaction = () => {
  const qc = useQueryClient()
  const { accessToken } = useAuthStore()
  
  return useMutation({
    mutationFn: ({ transactionId, groupId }: DeletePayload) =>
      TransactionService.deleteTransaction(transactionId, accessToken),
    
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ 
        queryKey: ['transactions', variables.groupId] 
      })
      qc.invalidateQueries({ 
        queryKey: ['settlements', variables.groupId] 
      })
    },
  })
}
```

## Usage in Components

```typescript
const { data, isLoading, error } = useTransactionList(groupId)
const { mutate: insert } = useInsertTransaction()

// Call mutation and invalidation happens automatically
insert({ description: 'Lunch', amount: 25.50, groupId })
```

TanStack Query handles the rest: caching, refetching, background synchronization, and UI updates—all with minimal boilerplate.
