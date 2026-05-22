# Adding a Screen

Screens are the primary UI containers in Breakdown. Each screen corresponds to a route file in the `app/` directory and integrates queries, stores, components, and error handling. This guide covers the scaffolding checklist and shows a complete, production-ready example.

## Screen Scaffolding Checklist

### 1. Create Route File

Create a new file in the appropriate directory under `app/(app)/` following this structure:

```
app/(app)/group/[groupId]/transactions.tsx
                          ^^^^^^^^^^^^^^
                          file name matches route
```

The filename becomes the route path. Use `[bracketed]` names for dynamic parameters.

### 2. Import Queries and Stores

Place all data dependencies at the top of the file:

```typescript
import { useTransactionList, useInsertTransaction } from '@/queries/transactionQueries'
import { useAuthStore } from '@/stores/authStore'
```

### 3. Define Screen Component with Hooks at Top Level

Hooks must be called at the top level of the component—never inside callbacks, conditionals, or nested functions:

```typescript
export default function TransactionListScreen() {
  // Hooks at top level
  const { groupId } = useLocalSearchParams()
  const { data: transactions, isLoading, error } = useTransactionList(groupId)
  const { accessToken } = useAuthStore()
  
  // Component logic below...
}
```

### 4. Handle Loading and Error States

Provide visual feedback for both states:

```typescript
if (isLoading && !transactions) {
  return <LoadingPlaceholder />
}

if (error) {
  return (
    <ErrorState
      title="Failed to load transactions"
      onRetry={() => refetch()}
    />
  )
}
```

### 5. Render UI with Design System Components

Use components from `@/components/ui/`:

```typescript
return (
  <Container>
    <Header title="Transactions" />
    <TransactionList transactions={transactions} />
  </Container>
)
```

### 6. Wrap in Error Boundary

Protect against unexpected errors:

```typescript
<ErrorBoundary>
  <TransactionListScreen />
</ErrorBoundary>
```

## Connecting Mutations

Form submissions trigger mutations, which invalidate cache and show feedback:

```typescript
const { mutate: insertTransaction, isPending } = useInsertTransaction()

const handleAddTransaction = async (formData) => {
  insertTransaction(formData, {
    onSuccess: () => {
      showToast('Transaction added', 'success')
      resetForm()
    },
    onError: (error) => {
      showToast(error.message, 'error')
    },
  })
}
```

## Deep Linking and Route Parameters

Use `useLocalSearchParams()` to access route parameters:

```typescript
const { groupId } = useLocalSearchParams<{ groupId: string }>()

// Pass to queries
const { data } = useTransactionList(groupId)
```

Parameters from the URL are automatically available and type-safe.

## Complete Production Example: TransactionListScreen

This is a realistic, fully-functional screen showing all patterns:

```typescript
// app/(app)/group/[groupId]/transactions.tsx

import { useLocalSearchParams } from 'expo-router'
import { ScrollView, View } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Queries
import {
  useTransactionList,
  useDeleteTransaction,
} from '@/queries/transactionQueries'

// Stores
import { useAuthStore } from '@/stores/authStore'

// Components
import {
  Container,
  Header,
  Button,
  ActivityIndicator,
  Text,
  ErrorBox,
} from '@/components/ui'
import { TransactionCard } from '@/components/TransactionCard'
import { CreateTransactionModal } from '@/components/CreateTransactionModal'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Utilities
import { useToast } from '@/hooks/useToast'
import { createStyleSheet, useStyles } from '@/design/unistyles'

/**
 * TransactionListScreen displays all transactions for a group
 * - Fetches data from API via useTransactionList query
 * - Handles loading, error, and empty states
 * - Allows adding and deleting transactions
 * - Shows transaction details with amounts and dates
 */
export default function TransactionListScreen() {
  // Route parameters
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const insets = useSafeAreaInsets()

  // Stores
  const { accessToken } = useAuthStore()

  // Queries
  const {
    data: transactions,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useTransactionList(groupId)

  const {
    mutate: deleteTransaction,
    isPending: isDeleting,
  } = useDeleteTransaction()

  // Local state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { showToast } = useToast()
  const { styles } = useStyles(stylesheet)

  // Validate required parameters
  if (!groupId || !accessToken) {
    return (
      <ErrorBoundary>
        <Container>
          <ErrorBox
            title="Invalid session"
            message="Unable to load transactions. Please log in again."
          />
        </Container>
      </ErrorBoundary>
    )
  }

  // Loading state: show spinner while fetching initial data
  if (isLoading && !transactions) {
    return (
      <Container>
        <Header title="Transactions" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="body" style={styles.loadingText}>
            Loading transactions...
          </Text>
        </View>
      </Container>
    )
  }

  // Error state: show error with retry option
  if (error) {
    return (
      <ErrorBoundary>
        <Container>
          <Header title="Transactions" />
          <View style={styles.errorContainer}>
            <ErrorBox
              title="Failed to load transactions"
              message={error.message}
              actionLabel="Retry"
              onAction={() => refetch()}
            />
          </View>
        </Container>
      </ErrorBoundary>
    )
  }

  // Empty state: no transactions yet
  if (!transactions || transactions.length === 0) {
    return (
      <Container>
        <Header title="Transactions" />
        <View style={styles.emptyStateContainer}>
          <Text variant="heading3" style={styles.emptyStateTitle}>
            No transactions yet
          </Text>
          <Text variant="body" style={styles.emptyStateMessage}>
            Add your first transaction to get started tracking expenses
          </Text>
          <Button
            label="Add Transaction"
            onPress={() => setIsCreateModalOpen(true)}
            style={styles.emptyStateButton}
          />
        </View>
      </Container>
    )
  }

  // Handle delete action
  const handleDeleteTransaction = (transactionId: string) => {
    deleteTransaction(
      { transactionId, groupId },
      {
        onSuccess: () => {
          showToast('Transaction deleted', 'success')
        },
        onError: (error) => {
          showToast(error.message || 'Failed to delete transaction', 'error')
        },
      }
    )
  }

  // Successful render: transaction list with add button
  return (
    <ErrorBoundary>
      <Container paddingBottom={insets.bottom}>
        <Header
          title="Transactions"
          action={{
            label: 'Add',
            onPress: () => setIsCreateModalOpen(true),
          }}
        />

        {/* Refetch indicator for background updates */}
        {isFetching && !isLoading && (
          <View style={styles.refetchingIndicator}>
            <Text variant="caption">Updating...</Text>
          </View>
        )}

        {/* Transaction list */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.transactionList}>
            {transactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onDelete={() => handleDeleteTransaction(transaction.id)}
                isDeleting={isDeleting}
              />
            ))}
          </View>
        </ScrollView>

        {/* Create transaction modal */}
        <CreateTransactionModal
          groupId={groupId}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false)
            showToast('Transaction added', 'success')
          }}
        />
      </Container>
    </ErrorBoundary>
  )
}

// Styles using Unistyles
const stylesheet = createStyleSheet((theme) => ({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyStateTitle: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateMessage: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyStateButton: {
    width: '100%',
  },
  refetchingIndicator: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  transactionList: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
}))
```

## Key Patterns Explained

**1. Hook Placement**: All hooks (useLocalSearchParams, useQuery, useStore) are called at the top level, before any conditions or returns.

**2. Error Boundary**: Wraps the component to catch unexpected errors and show a fallback UI instead of crashing.

**3. Loading States**: Show spinner during initial fetch, don't show during background refetches.

**4. Empty State**: Clear message when no data, with action to create first item.

**5. Mutation Integration**: Delete mutation includes success/error toasts and disables UI during request.

**6. Route Parameters**: `useLocalSearchParams()` pulls `groupId` from URL, passed to queries for data fetching.

**7. Styling**: Uses `createStyleSheet` and `useStyles()` hook for theme-aware styling.

**8. Accessibility**: Proper button labels, loading states, and error messages for screen readers.

This pattern scales to any screen—replace `TransactionList` with `SettlementList`, `useTransactionList` with `useSettlements`, etc.
