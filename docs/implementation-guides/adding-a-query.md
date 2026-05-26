# Adding Server Data and Mutations

Breakdown uses Next.js server components and server actions for all data access. There is no client-side data fetching library. Data is fetched once on the server at render time; mutations are handled by `'use server'` functions called from client components.

## The Two Data Patterns

| Pattern | When to use | Where to write it |
|---------|-------------|-------------------|
| **Server component fetch** | Reading data to display | `lib/*-service.ts` + `page.tsx` |
| **Server action** | Writing, deleting, updating | `app/*/actions.ts` |

---

## Pattern 1: Reading Data in Server Components

Create a service function in `lib/` that calls the Java backend. Call it directly from a server component (a `page.tsx` or `layout.tsx`).

### Service Function

```typescript
// lib/transaction-service.ts

import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';
import type { Transaction } from '@/types';

export async function getTransactions(groupId: string): Promise<Transaction[]> {
  const token = cookies().get('auth-token')?.value;
  if (!token) throw new Error('Unauthorized');

  const response = await apiClient.get(`/group/${groupId}/transaction-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponseStructure<Transaction[]>(response.data);
}

export async function getTransaction(
  groupId: string,
  transactionId: string
): Promise<Transaction> {
  const token = cookies().get('auth-token')?.value;
  if (!token) throw new Error('Unauthorized');

  const response = await apiClient.get(
    `/group/${groupId}/transaction/${transactionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return handleResponseStructure<Transaction>(response.data);
}
```

### Using in a Page

```typescript
// app/(dashboard)/groups/[id]/transactions/page.tsx

import { getTransactions } from '@/lib/transaction-service';
import { TransactionList } from '@/components/TransactionList';

export default async function TransactionsPage({
  params,
}: {
  params: { id: string };
}) {
  // Data fetched once, server-side — no loading spinner, no waterfall
  const transactions = await getTransactions(params.id);

  return (
    <div>
      <h1>Transactions</h1>
      <TransactionList transactions={transactions} groupId={params.id} />
    </div>
  );
}
```

### Fetching Multiple Resources in Parallel

Use `Promise.all` to avoid sequential waterfalls:

```typescript
export default async function GroupPage({ params }: { params: { id: string } }) {
  // Both requests fire in parallel
  const [group, transactions, settlements] = await Promise.all([
    getGroup(params.id),
    getTransactions(params.id),
    getSettlements(params.id),
  ]);

  return (
    <div>
      <h1>{group.name}</h1>
      <TransactionList transactions={transactions} groupId={params.id} />
      <SettlementList settlements={settlements} groupId={params.id} />
    </div>
  );
}
```

---

## Pattern 2: Mutations via Server Actions

Server actions are `async` functions marked `'use server'`. They run on the server and can be called directly from client components.

### Creating a Server Action

```typescript
// app/(dashboard)/groups/[id]/actions.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';
import type { Transaction, TransactionCreateRequest } from '@/types';

export async function addTransaction(
  groupId: string,
  input: TransactionCreateRequest
): Promise<Transaction> {
  const token = cookies().get('auth-token')?.value;
  if (!token) throw new Error('Unauthorized');

  const response = await apiClient.post(
    `/group/${groupId}/insert-transaction`,
    input,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const transaction = handleResponseStructure<Transaction>(response.data);

  // Invalidate page cache so next render fetches fresh data
  revalidatePath(`/groups/${groupId}/transactions`);

  return transaction;
}

export async function deleteTransaction(
  groupId: string,
  transactionId: string
): Promise<void> {
  const token = cookies().get('auth-token')?.value;
  if (!token) throw new Error('Unauthorized');

  const response = await apiClient.delete(
    `/group/${groupId}/transaction/${transactionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  handleResponseStructure(response.data);
  revalidatePath(`/groups/${groupId}/transactions`);
}
```

### Calling Actions from Client Components

```typescript
// components/AddTransactionForm.tsx
'use client';

import { useState } from 'react';
import { addTransaction } from '@/app/(dashboard)/groups/[id]/actions';

export function AddTransactionForm({ groupId }: { groupId: string }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await addTransaction(groupId, {
        description,
        amount,
        payerId: 'current-user-id', // injected from session in real implementation
        category: 'other',
      });
      // Reset form on success
      setDescription('');
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        step="0.01"
        placeholder="0.00"
        required
      />
      {error && <p style={{ color: '#B05248' }}>{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
}
```

---

## Cache Invalidation with `revalidatePath`

After a mutation, call `revalidatePath` to tell Next.js to re-fetch that page on the next request:

```typescript
// Invalidate a specific page
revalidatePath(`/groups/${groupId}/transactions`);

// Invalidate all pages under a path
revalidatePath('/groups', 'layout');
```

This is the equivalent of cache invalidation in TanStack Query — but it happens server-side and is much simpler.

---

## Error Handling

Server actions throw errors that propagate to the calling client component. Always wrap action calls in `try/catch`:

```typescript
// In client component
try {
  await addTransaction(groupId, input);
  // success
} catch (err: any) {
  setError(err.message); // display to user
}
```

In the server action, `handleResponseStructure` automatically throws when `responseStatus === 'FAILURE'`, so you only need to handle network-level errors separately if needed.

---

## Naming Conventions

| Purpose | Function name | Location |
|---------|--------------|----------|
| Read a list | `getTransactions(groupId)` | `lib/transaction-service.ts` |
| Read one item | `getTransaction(groupId, id)` | `lib/transaction-service.ts` |
| Create | `addTransaction(groupId, input)` | `app/.../actions.ts` |
| Update | `updateTransaction(groupId, id, input)` | `app/.../actions.ts` |
| Delete | `deleteTransaction(groupId, id)` | `app/.../actions.ts` |

---

## Testing Service Functions

```typescript
// __tests__/lib/transaction-service.test.ts
import { getTransactions } from '@/lib/transaction-service';
import * as apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');
jest.mock('next/headers', () => ({
  cookies: () => ({ get: () => ({ value: 'test-token' }) }),
}));

describe('getTransactions_validGroupId_returnsTransactions', () => {
  it('should return transaction list', async () => {
    (apiClient.default.get as jest.Mock).mockResolvedValue({
      data: {
        responseStatus: 'SUCCESS' as const,
        responseMessage: 'OK',
        responseObject: [
          { id: 'txn-1', description: 'Dinner', amount: '50.00' },
        ],
      },
    });

    const result = await getTransactions('group-1');
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Dinner');
  });
});
```

## Testing Server Actions

```typescript
// __tests__/app/(dashboard)/groups/[id]/actions.test.ts
import { addTransaction } from '@/app/(dashboard)/groups/[id]/actions';
import * as apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');
jest.mock('next/headers', () => ({
  cookies: () => ({ get: () => ({ value: 'test-token' }) }),
}));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

describe('addTransaction_validInput_createsTransaction', () => {
  it('should call API and return created transaction', async () => {
    (apiClient.default.post as jest.Mock).mockResolvedValue({
      data: {
        responseStatus: 'SUCCESS' as const,
        responseMessage: 'Created',
        responseObject: { id: 'txn-1', description: 'Dinner', amount: '50.00' },
      },
    });

    const result = await addTransaction('group-1', {
      description: 'Dinner',
      amount: '50.00',
      payerId: 'user-1',
      category: 'food',
    });

    expect(result.id).toBe('txn-1');
  });
});

describe('addTransaction_apiFailure_throwsError', () => {
  it('should throw on API failure', async () => {
    (apiClient.default.post as jest.Mock).mockResolvedValue({
      data: {
        responseStatus: 'FAILURE' as const,
        responseMessage: 'Amount must be greater than 0',
        responseObject: null,
      },
    });

    await expect(
      addTransaction('group-1', {
        description: 'Dinner',
        amount: '0',
        payerId: 'user-1',
        category: 'food',
      })
    ).rejects.toThrow('Amount must be greater than 0');
  });
});
```
