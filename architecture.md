# breakDown-ui — System Architecture

**Next.js 15 web + PWA frontend for privacy-first expense splitting. Server components by default; client interactivity via `'use client'` directives. API routes middleware to Java backend.**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│        Next.js App Router (app/ directory)              │
│  Server components (default) fetch data server-side     │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│     'use client' Components (components/ directory)     │
│  React hooks (useState, useEffect) for UI state only    │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│   'use server' Server Actions (app/*/actions.ts)        │
│  Form submissions and mutations, typed via types/       │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│   API Routes (app/api/ directory) + Axios Client        │
│  Middleware: Next.js → Java backend (ResponseStructure) │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│    Java Backend (breakdown-dashboard-svc, auth-svc)     │
│  Groups, expenses, calculations, persistence, auth      │
└─────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Server Components (Default)
Fetch data server-side, render once on request:

```typescript
// app/(dashboard)/groups/[id]/page.tsx (server component)
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
- No client-side data fetching waterfall
- Sensitive logic (token validation) stays server-side
- Smaller bundle size

### Client Components
Handle interactivity only. Keep logic minimal:

```typescript
// components/ExpenseList.tsx ('use client' component)
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
        <li key={expense.id} onClick={() => setSelectedId(expense.id)}>
          {expense.description} - ${expense.amount}
        </li>
      ))}
    </ul>
  );
}
```

---

## State Management

### Server-Side State
Data fetched in server components stays on server until explicitly sent:

```typescript
// app/(dashboard)/groups/[id]/page.tsx
async function GroupPage({ params }: { params: { id: string } }) {
  const group = await getGroup(params.id);  // Server-side, never exposed to client
  return <GroupDetail group={group} />;
}
```

### Client-Side State
Use React `useState` for UI state only (modal visibility, selected item, form input):

```typescript
// components/ExpenseForm.tsx ('use client')
'use client';

export function ExpenseForm({ groupId }: { groupId: string }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await addExpense(groupId, { description, amount });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={description} onChange={(e) => setDescription(e.target.value)} />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button type="submit">Add Expense</button>
    </form>
  );
}
```

---

## Server Actions & Mutations

Server actions handle form submissions and mutations. Typed by TypeScript, no runtime serialization:

```typescript
// app/(dashboard)/groups/[id]/actions.ts ('use server')
'use server';

import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function addExpense(
  groupId: string,
  input: { description: string; amount: number }
) {
  const response = await apiClient.post(`/groups/${groupId}/expenses`, input);
  return handleResponseStructure(response.data);
}
```

Called from client components:

```typescript
// components/ExpenseForm.tsx ('use client')
'use client';

import { addExpense } from '@/app/(dashboard)/groups/[id]/actions';

export function ExpenseForm({ groupId }: { groupId: string }) {
  async function handleSubmit(e: React.FormEvent) {
    await addExpense(groupId, { description, amount });
  }
  // ...
}
```

---

## API Routes (Middleware to Backend)

API routes handle authentication, logging, and proxy calls to Java backend:

```typescript
// app/api/groups/route.ts (GET /api/groups)
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await apiClient.get('/groups', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

Token is stored in HTTP-only cookie (set by `/api/auth/login`), read by API routes.

---

## Data Flow Example: Loading Group with Expenses

1. User navigates to `/groups/123`
2. Next.js routes to `app/(dashboard)/groups/[id]/page.tsx` (server component)
3. Server component calls `getGroup('123')` and `getExpenses('123')`
4. Both functions use `apiClient` + auth token from server-side cookies
5. Java backend returns `ResponseStructure<Group>` and `ResponseStructure<Expense[]>`
6. Server component renders with fetched data + `<ExpenseList expenses={...} />`
7. `<ExpenseList>` is a client component with `useState` for interaction
8. User clicks "Add Expense" → client component calls server action
9. Server action (`addExpense`) validates input, calls Java backend via API route
10. API route forwards request with auth token, returns result
11. Server action returns result; client re-fetches if needed (or uses form reset)

---

## HTTP Contract with Backend

All responses follow Java backend `ResponseStructure<T>`. HTTP status is always 200 — check `responseStatus` to determine success or failure:

```typescript
interface ResponseStructure<T> {
  responseStatus: 'SUCCESS' | 'FAILURE';
  responseMessage: string;
  responseObject: T | null;
}
```

Helper for extracting data or throwing errors. Pass `response.data` (the Axios JSON body), not the raw Axios response:

```typescript
// lib/response-handler.ts
export function handleResponseStructure<T>(response: ResponseStructure<T>): T {
  if (response.responseStatus === 'FAILURE') {
    throw new Error(response.responseMessage);
  }
  return response.responseObject as T;
}
```

---

## Authentication Flow

1. User submits login form (client component calls server action)
2. Server action sends credentials to `/api/auth/login`
3. API route calls Java backend, receives `ResponseStructure<LoginResponse>`
4. API route sets HTTP-only cookie: `res.cookies.set('auth-token', token, { httpOnly: true })`
5. Server actions and API routes access token via `request.cookies.get('auth-token')`
6. Token never exposed to client JavaScript

---

## See Also

- [`docs/architecture-deep-dives/server-components.md`](docs/architecture-deep-dives/server-components.md) — when to use server components
- [`docs/architecture-deep-dives/server-actions.md`](docs/architecture-deep-dives/server-actions.md) — form submissions and mutations
- [`docs/architecture-deep-dives/api-routes.md`](docs/architecture-deep-dives/api-routes.md) — API route patterns and middleware
- [`docs/architecture-deep-dives/state-management.md`](docs/architecture-deep-dives/state-management.md) — client-side state with React hooks
- [`docs/architecture-deep-dives/data-fetching.md`](docs/architecture-deep-dives/data-fetching.md) — server vs. client fetching strategies
- [`docs/architecture-deep-dives/authentication.md`](docs/architecture-deep-dives/authentication.md) — auth with HTTP-only cookies
