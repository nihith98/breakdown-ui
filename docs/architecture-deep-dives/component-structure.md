# Component Structure Deep-Dive

## Next.js App Router: File-Based Routing

Next.js App Router automatically maps file paths to routes. File `app/(dashboard)/groups/[id]/page.tsx` becomes:
- Web route: `/groups/123`
- URL structure: `/groups/[id]` where `[id]` is dynamic

Access route params via component props:

```typescript
export default function GroupPage({ params }: { params: { id: string } }) {
  // params.id contains the route parameter
}
```

---

## Server vs. Client Components

### Server Components (Default)

Files in `app/` are server components by default. They run on the server, fetch data, and send HTML to browser.

```typescript
// app/(dashboard)/groups/[id]/page.tsx (SERVER COMPONENT)
import { getGroup, getExpenses } from '@/lib/group-service';

export default async function GroupPage({ params }: { params: { id: string } }) {
  const group = await getGroup(params.id);
  const expenses = await getExpenses(params.id);

  return (
    <div>
      <h1>{group.name}</h1>
      <ExpenseList expenses={expenses} />  {/* Client component */}
    </div>
  );
}
```

**Benefits:**
- No waterfall data fetching (no loading spinners)
- Sensitive logic stays on server
- Smaller bundle size

### Client Components

Use `'use client'` directive for interactivity. Client components run in the browser.

```typescript
// components/ExpenseList.tsx (CLIENT COMPONENT)
'use client';

import { useState } from 'react';
import { Expense } from '@/types';

interface ExpenseListProps {
  expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <ul>
      {expenses.map((expense) => (
        <li
          key={expense.id}
          onClick={() => setSelectedId(expense.id)}
          style={{ fontWeight: selectedId === expense.id ? 'bold' : 'normal' }}
        >
          {expense.description} - ${expense.amount}
        </li>
      ))}
    </ul>
  );
}
```

**Rule:** Keep client components small. Pass data down; fetch on server.

---

## Directory Structure

```
breakdown-ui/
├── app/                          # Next.js routes
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── error.tsx                # Global error boundary
│   ├── (auth)/                  # Auth route group
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/             # Dashboard route group
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── groups/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           ├── page.tsx
│   │           └── actions.ts   # Server actions
│   └── api/                     # API routes
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── register/route.ts
│       └── groups/
│           ├── route.ts
│           └── [id]/route.ts
├── components/                   # Reusable client components
│   ├── ExpenseList.tsx
│   ├── GroupCard.tsx
│   └── AddExpenseForm.tsx
├── lib/                         # Utilities and services
│   ├── api-client.ts            # Axios instance
│   ├── response-handler.ts      # ResponseStructure handling
│   ├── auth.ts                  # Auth helpers
│   ├── utils.ts                 # Utility functions
│   └── group-service.ts         # Data fetching for server components
├── types/                       # TypeScript types
│   └── index.ts
├── __tests__/                   # Test files (mirror structure)
│   ├── app/
│   ├── components/
│   └── ...
└── public/                      # Static assets
    ├── favicon.ico
    └── manifest.json            # PWA manifest
```

---

## Route Groups (Parentheses)

Route groups organize routes without affecting URL. `(auth)` and `(dashboard)` are route groups:

- `app/(auth)/login/page.tsx` → `/login` (URL doesn't include `auth`)
- `app/(dashboard)/groups/page.tsx` → `/groups` (URL doesn't include `dashboard`)

Each route group can have its own layout for different UI structures (auth layout vs. dashboard layout).

---

## Layout Nesting

Layouts wrap pages. Each file defines structure for its route tree:

```
app/
├── layout.tsx                   (wraps all routes)
├── (auth)/
│   └── layout.tsx              (wraps /login, /register)
│       ├── login/page.tsx
│       └── register/page.tsx
└── (dashboard)/
    ├── layout.tsx              (wraps /groups, /settings, etc.)
    ├── page.tsx                (/dashboard home)
    ├── groups/
    │   └── page.tsx            (/groups)
    └── settings/page.tsx
```

Auth layout shows minimal UI; dashboard layout shows sidebar.

```typescript
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      {children}
    </div>
  );
}

// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <nav>Sidebar</nav>
      <main>{children}</main>
    </div>
  );
}
```

---

## Page Anatomy

Server component pages fetch data and compose UI:

```typescript
// app/(dashboard)/groups/[id]/page.tsx
import { getGroup } from '@/lib/group-service';
import { ExpenseList } from '@/components/ExpenseList';
import { AddExpenseForm } from '@/components/AddExpenseForm';

export default async function GroupPage({ params }: { params: { id: string } }) {
  // Fetch on server
  const group = await getGroup(params.id);

  return (
    <div>
      <h1>{group.name}</h1>
      {group.description && <p>{group.description}</p>}

      {/* Client components for interactivity */}
      <ExpenseList expenses={group.expenses} />
      <AddExpenseForm groupId={params.id} />
    </div>
  );
}
```

---

## Common Client Components

Build small, reusable client components in `components/`:

```typescript
// components/ExpenseList.tsx ('use client')
'use client';

import { Expense } from '@/types';

interface ExpenseListProps {
  expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return <p>No expenses yet</p>;
  }

  return (
    <ul style={{ listStyle: 'none' }}>
      {expenses.map((expense) => (
        <li key={expense.id} style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
          <strong>{expense.description}</strong> - ${expense.amount.toFixed(2)}
          <br />
          <small>Paid by: {expense.paidBy}</small>
        </li>
      ))}
    </ul>
  );
}
```

Pass data as props; no data fetching in client components.

---

## Server Actions (Form Submissions)

Server actions handle form submissions without client-side API calls:

```typescript
// app/(dashboard)/groups/[id]/actions.ts ('use server')
'use server';

import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function addExpense(
  groupId: string,
  input: { description: string; amount: number; paidBy: string; splitBetween: string[] }
) {
  const response = await apiClient.post(`/groups/${groupId}/expenses`, input);
  return handleResponseStructure(response.data);
}
```

Called from client components:

```typescript
// components/AddExpenseForm.tsx ('use client')
'use client';

import { useState } from 'react';
import { addExpense } from '@/app/(dashboard)/groups/[id]/actions';

export function AddExpenseForm({ groupId }: { groupId: string }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await addExpense(groupId, { description, amount: parseFloat(amount), paidBy: 'user1', splitBetween: [] });
    setDescription('');
    setAmount('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount" required />
      <button type="submit">Add Expense</button>
    </form>
  );
}
```

---

## Error Handling

Global error boundary in `app/error.tsx` catches client-side errors:

```typescript
// app/error.tsx ('use client')
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: '2rem', color: 'red' }}>
      <h1>Something went wrong!</h1>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

## See Also

- [`server-components.md`](server-components.md) — detailed server component patterns
- [`server-actions.md`](server-actions.md) — form submissions and mutations
- [`api-routes.md`](api-routes.md) — API route design
