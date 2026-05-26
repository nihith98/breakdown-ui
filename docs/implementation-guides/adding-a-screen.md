# Adding a Page (Next.js App Router)

Pages in Breakdown are server components by default. They fetch data on the server and render HTML — no client-side loading spinners, no waterfall requests. This guide covers the scaffolding checklist and shows a complete production-ready example.

## Page Scaffolding Checklist

### 1. Create the Route File

Create a `page.tsx` in the appropriate directory under `app/`:

```
app/(dashboard)/groups/[id]/transactions/page.tsx
                             ^^^^^^^^^^^
                             dynamic segment
```

The directory path maps to the URL. Route groups in parentheses (e.g. `(dashboard)`) do not appear in the URL.

### 2. Make It a Server Component (Default)

No directive needed — all files in `app/` are server components unless you add `'use client'`. Fetch data directly in the component using `async/await`:

```typescript
// app/(dashboard)/groups/[id]/transactions/page.tsx

import { getTransactions } from '@/lib/transaction-service';
import { TransactionList } from '@/components/TransactionList';
import { AddTransactionForm } from '@/components/AddTransactionForm';

export default async function TransactionsPage({
  params,
}: {
  params: { id: string };
}) {
  const transactions = await getTransactions(params.id);

  return (
    <div>
      <h1>Transactions</h1>
      <TransactionList transactions={transactions} />
      <AddTransactionForm groupId={params.id} />
    </div>
  );
}
```

### 3. Add a Loading State

Create `loading.tsx` in the same directory — Next.js shows it automatically while the page is streaming:

```typescript
// app/(dashboard)/groups/[id]/transactions/loading.tsx

export default function Loading() {
  return (
    <div>
      <p>Loading transactions...</p>
    </div>
  );
}
```

### 4. Add an Error Boundary

Create `error.tsx` in the same directory — must be a `'use client'` component:

```typescript
// app/(dashboard)/groups/[id]/transactions/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <p>Failed to load transactions: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
```

### 5. Extract Interactivity into Client Components

Forms, buttons, and anything using hooks go in `components/` with `'use client'`:

```typescript
// components/AddTransactionForm.tsx
'use client';

import { useState } from 'react';
import { addTransaction } from '@/app/(dashboard)/groups/[id]/actions';

export function AddTransactionForm({ groupId }: { groupId: string }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addTransaction(groupId, { description, amount });
      setDescription('');
      setAmount('');
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
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
}
```

### 6. Create Server Actions for Mutations

Put mutations in `actions.ts` in the same route directory:

```typescript
// app/(dashboard)/groups/[id]/actions.ts
'use server';

import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';
import { revalidatePath } from 'next/cache';

export async function addTransaction(
  groupId: string,
  input: { description: string; amount: string }
) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) throw new Error('Unauthorized');

  const response = await apiClient.post(
    `/group/${groupId}/insert-transaction`,
    { ...input, payerId: 'current-user-id', category: 'other' },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  handleResponseStructure(response.data);
  revalidatePath(`/groups/${groupId}/transactions`);
}
```

`revalidatePath` causes Next.js to re-fetch the page data on the next visit, keeping the list fresh after mutations.

### 7. Write Tests

```typescript
// __tests__/app/(dashboard)/groups/[id]/transactions/page.test.tsx
import { render, screen } from '@testing-library/react';
import TransactionsPage from '@/app/(dashboard)/groups/[id]/transactions/page';
import * as transactionService from '@/lib/transaction-service';

jest.mock('@/lib/transaction-service');

describe('TransactionsPage_withTransactions_rendersList', () => {
  it('should render transactions', async () => {
    (transactionService.getTransactions as jest.Mock).mockResolvedValue([
      { id: 'txn-1', description: 'Dinner', amount: '50.00', payerId: 'user-1' },
    ]);

    const component = await TransactionsPage({ params: { id: 'group-1' } });
    render(component);

    expect(screen.getByText('Dinner')).toBeInTheDocument();
  });
});
```

---

## Complete Production Example: TransactionsPage

```typescript
// app/(dashboard)/groups/[id]/transactions/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';
import { TransactionList } from '@/components/TransactionList';
import { AddTransactionForm } from '@/components/AddTransactionForm';
import type { Transaction } from '@/types';

async function getTransactions(groupId: string): Promise<Transaction[]> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect('/login');
  }

  const response = await apiClient.get(`/group/${groupId}/transaction-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponseStructure<Transaction[]>(response.data);
}

export default async function TransactionsPage({
  params,
}: {
  params: { id: string };
}) {
  const transactions = await getTransactions(params.id);

  return (
    <div>
      <h1>Transactions</h1>

      {transactions.length === 0 ? (
        <p>No transactions yet. Add the first one below.</p>
      ) : (
        <TransactionList transactions={transactions} />
      )}

      <AddTransactionForm groupId={params.id} />
    </div>
  );
}
```

---

## Key Patterns Explained

**1. Server component = async function.** You can `await` data directly in the component body. No `useEffect`, no `useState` for data.

**2. Redirect on missing auth.** Call `redirect('/login')` from the server — before any rendering happens.

**3. `loading.tsx` for streaming.** Next.js automatically uses this as a Suspense fallback while your async component resolves.

**4. `error.tsx` must be `'use client'`.** It receives an `error` object and a `reset` callback. Keep it simple.

**5. `revalidatePath` after mutations.** Calling this in a server action tells Next.js to invalidate the cached page, so the next request gets fresh data.

**6. Client components receive data as props.** Server components fetch, client components display and interact. Never fetch in client components.

This pattern scales to any page — replace `getTransactions` with the appropriate service function and `TransactionList` with the right display component.
