# Managing Client State

Breakdown does not use a global state library (no Zustand, no Redux, no Context API). All state management follows two simple rules:

- **Server data** (groups, transactions, user info) → fetched in server components, passed as props
- **UI state** (form inputs, modal visibility, selected item) → `useState` in client components

This is the [React philosophy for server-heavy apps](https://react.dev/learn/sharing-state-between-components): keep state as local and close to where it's used as possible.

---

## When to Use `useState`

Use `useState` for ephemeral, local UI state that:
- Does not need to be shared across multiple unrelated components
- Does not need to persist across page reloads
- Does not come from the server

**Good candidates:**

| State | Hook |
|-------|------|
| Form field values | `useState('')` |
| Is form submitting? | `useState(false)` |
| Error message from failed action | `useState('')` |
| Is modal/dialog open? | `useState(false)` |
| Which list item is selected | `useState<string \| null>(null)` |
| Active tab in a tabbed UI | `useState('transactions')` |

**Not good candidates (use server state instead):**

| State | Correct approach |
|-------|-----------------|
| List of transactions | Fetch in server component, pass as props |
| Current user info | Fetch in server component, pass to children |
| Group details | Fetch in server component |

---

## Form State Pattern

The most common use of `useState` is managing form fields:

```typescript
// components/AddTransactionForm.tsx
'use client';

import { useState } from 'react';
import { addTransaction } from '@/app/(dashboard)/groups/[id]/actions';

interface AddTransactionFormProps {
  groupId: string;
}

export function AddTransactionForm({ groupId }: AddTransactionFormProps) {
  // Form field state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'food' | 'transport' | 'other'>('other');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await addTransaction(groupId, { description, amount, category, payerId: '' });
      // Reset form on success
      setDescription('');
      setAmount('');
      setCategory('other');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What was this for?"
        required
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        required
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as typeof category)}
      >
        <option value="food">Food</option>
        <option value="transport">Transport</option>
        <option value="other">Other</option>
      </select>

      {error && <p style={{ color: '#B05248' }}>{error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
}
```

---

## Modal/Dialog State Pattern

```typescript
// components/TransactionList.tsx
'use client';

import { useState } from 'react';
import { deleteTransaction } from '@/app/(dashboard)/groups/[id]/actions';
import type { Transaction } from '@/types';

interface TransactionListProps {
  transactions: Transaction[];
  groupId: string;
}

export function TransactionList({ transactions, groupId }: TransactionListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(transactionId: string) {
    setIsDeleting(true);
    try {
      await deleteTransaction(groupId, transactionId);
      setSelectedId(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ul>
      {transactions.map((t) => (
        <li key={t.id}>
          <span>{t.description}</span>
          <span>${t.amount}</span>
          <button
            onClick={() => setSelectedId(t.id)}
            aria-expanded={selectedId === t.id}
          >
            Options
          </button>

          {/* Inline expansion — no separate modal component needed for simple cases */}
          {selectedId === t.id && (
            <div>
              <button
                onClick={() => handleDelete(t.id)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button onClick={() => setSelectedId(null)}>Cancel</button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
```

---

## Sharing State Between Components

If two sibling components need to share UI state, **lift the state up** to their common parent — which is usually a server component passing data down:

```typescript
// app/(dashboard)/groups/[id]/page.tsx  (SERVER COMPONENT)
import { getGroup, getTransactions } from '@/lib/group-service';
import { GroupDetail } from '@/components/GroupDetail';

export default async function GroupPage({ params }: { params: { id: string } }) {
  // Fetch once on server, pass to both children as props
  const [group, transactions] = await Promise.all([
    getGroup(params.id),
    getTransactions(params.id),
  ]);

  return (
    <GroupDetail
      group={group}
      transactions={transactions}
      groupId={params.id}
    />
  );
}

// components/GroupDetail.tsx  ('use client' — manages tab/view state)
'use client';

import { useState } from 'react';
import type { Group, Transaction } from '@/types';

interface GroupDetailProps {
  group: Group;
  transactions: Transaction[];
  groupId: string;
}

export function GroupDetail({ group, transactions, groupId }: GroupDetailProps) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'settlements'>(
    'transactions'
  );

  return (
    <div>
      <h1>{group.name}</h1>
      <nav>
        <button onClick={() => setActiveTab('transactions')}>Transactions</button>
        <button onClick={() => setActiveTab('settlements')}>Settlements</button>
      </nav>

      {activeTab === 'transactions' && (
        <TransactionList transactions={transactions} groupId={groupId} />
      )}
      {activeTab === 'settlements' && (
        <SettlementList groupId={groupId} />
      )}
    </div>
  );
}
```

---

## What NOT to Do

### ❌ Global state store for server data

```typescript
// Wrong — don't create a global store for server data
const useTransactionStore = create((set) => ({
  transactions: [],
  setTransactions: (t) => set({ transactions: t }),
}));
```

Fetch in server components instead. The data is already "global" in the sense that the page fetches it once and passes it everywhere.

### ❌ Client-side fetching in useEffect

```typescript
// Wrong — don't fetch in useEffect
'use client';
const [transactions, setTransactions] = useState([]);
useEffect(() => {
  fetch('/api/transactions').then(r => r.json()).then(setTransactions);
}, []);
```

This creates a waterfall and requires loading spinners. Fetch in server components instead.

### ❌ Context for app-wide state

```typescript
// Wrong — Context adds complexity without benefit
const AuthContext = createContext(null);
export function AuthProvider({ children }) { ... }
```

Auth state (the token) lives in an HTTP-only cookie — not in JavaScript at all. It's sent automatically with every request. There's nothing to store client-side.

---

## Testing Client State

Test state behavior by rendering the component and simulating user interactions:

```typescript
// __tests__/components/AddTransactionForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddTransactionForm } from '@/components/AddTransactionForm';
import * as actions from '@/app/(dashboard)/groups/[id]/actions';

jest.mock('@/app/(dashboard)/groups/[id]/actions');

describe('AddTransactionForm_validInput_submitsForm', () => {
  it('should call addTransaction on submit', async () => {
    (actions.addTransaction as jest.Mock).mockResolvedValue({ id: 'txn-1' });

    render(<AddTransactionForm groupId="group-1" />);

    // Arrange — fill in the form
    fireEvent.change(screen.getByPlaceholderText('What was this for?'), {
      target: { value: 'Dinner' },
    });
    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '50.00' },
    });

    // Act — submit
    fireEvent.click(screen.getByText('Add Transaction'));

    // Assert
    await waitFor(() => {
      expect(actions.addTransaction).toHaveBeenCalledWith(
        'group-1',
        expect.objectContaining({ description: 'Dinner', amount: '50.00' })
      );
    });
  });
});

describe('AddTransactionForm_apiError_showsErrorMessage', () => {
  it('should display error message on failure', async () => {
    (actions.addTransaction as jest.Mock).mockRejectedValue(
      new Error('Amount must be greater than 0')
    );

    render(<AddTransactionForm groupId="group-1" />);

    fireEvent.change(screen.getByPlaceholderText('What was this for?'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByText('Add Transaction'));

    await waitFor(() => {
      expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    });
  });
});
```
