# State Management Deep-Dive

## Philosophy: Server by Default, Client When Needed

**Server State**: Data from Java backend (groups, expenses, user info) stays on server in server components.

**Client State**: Only UI state (form inputs, modal visibility, selected item) lives on client via React `useState`.

No global state library needed (Zustand, Redux removed for Next.js).

---

## Server State: Fetch in Server Components

Fetch data in server components. They have access to auth tokens and can call backend directly.

```typescript
// app/(dashboard)/groups/[id]/page.tsx (SERVER COMPONENT)
import { apiClient } from '@/lib/api-client';

async function getGroup(id: string) {
  const response = await apiClient.get(`/groups/${id}`, {
    headers: { Authorization: `Bearer ${process.env.AUTH_TOKEN}` },
  });
  return response.data;
}

export default async function GroupPage({ params }: { params: { id: string } }) {
  const group = await getGroup(params.id);
  return <GroupDetail group={group} />;
}
```

**No loading spinners, no waterfall.**

---

## Client State: React Hooks

Use `useState` and `useReducer` for UI state only. Keep it minimal and local.

```typescript
// components/AddExpenseForm.tsx ('use client')
'use client';

import { useState } from 'react';

export function AddExpenseForm({ groupId }: { groupId: string }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await addExpense(groupId, { description, amount: parseFloat(amount) });
      setDescription('');
      setAmount('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={description} onChange={(e) => setDescription(e.target.value)} required />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" required />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add'}</button>
    </form>
  );
}
```

**Scope:** Form inputs, toggle flags, selected items. Nothing global.

---

## Mutations: Server Actions

Form submissions and mutations use `'use server'` server actions. They're strongly typed and have no serialization overhead.

```typescript
// app/(dashboard)/groups/[id]/actions.ts ('use server')
'use server';

import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function addExpense(
  groupId: string,
  input: { description: string; amount: number; paidBy?: string }
) {
  try {
    const response = await apiClient.post(`/groups/${groupId}/expenses`, input);
    return handleResponseStructure(response.data);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add expense');
  }
}
```

Called from client components:

```typescript
// components/AddExpenseForm.tsx ('use client')
'use client';

import { addExpense } from '@/app/(dashboard)/groups/[id]/actions';

export function AddExpenseForm({ groupId }: { groupId: string }) {
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await addExpense(groupId, { description, amount: parseFloat(amount) });
    // Re-fetch or reset state
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Benefits:**
- Type-safe between client and server
- No runtime serialization (not JSON)
- Can use async/await directly
- Errors bubble up naturally

---

## Sharing State Between Components

Avoid prop drilling by fetching on the server and passing data down.

```typescript
// ✗ Wrong: Prop drilling
<Layout groupId={groupId}>
  <Sidebar groupId={groupId}>
    <GroupSelector groupId={groupId} onSelect={setGroupId} />
  </Sidebar>
  <Main groupId={groupId} />
</Layout>

// ✓ Correct: Fetch once on server, compose
export default async function DashboardLayout() {
  const groups = await getGroups();  // Fetch once

  return (
    <div>
      <Sidebar groups={groups} />
      <Main groups={groups} />
    </div>
  );
}
```

---

## Conditional Rendering

Use `useEffect` sparingly. For most cases, conditionally render server components.

```typescript
// app/(dashboard)/page.tsx (SERVER COMPONENT)
import { getCurrentUser } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const groups = await getGroups(user.id);
  return <GroupsList groups={groups} />;
}
```

**Server-side conditionals are fast; no loading states.**

---

## Local Storage Persistence

If you need to persist client state across page reloads, use browser storage in a client component:

```typescript
// components/UserPreferences.tsx ('use client')
'use client';

import { useState, useEffect } from 'react';

export function UserPreferences() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
  }, []);

  function handleThemeChange(newTheme: string) {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }

  return (
    <button onClick={() => handleThemeChange(theme === 'light' ? 'dark' : 'light')}>
      Toggle theme: {theme}
    </button>
  );
}
```

**Avoid in server components.** Load from localStorage only on client.

---

## Anti-Patterns

### ✗ Zustand or Redux
Global state libraries are unnecessary. Fetch on server, pass down. If you need sharing, use server components.

### ✗ Context API for App State
Context is overkill. Prop drilling is fine for a few levels. If it's truly global, it should be server state.

### ✗ useEffect for Data Fetching
Client-side data fetching causes waterfalls and loading spinners. Fetch on server instead.

```typescript
// ✗ Wrong
'use client';
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData);
}, []);

// ✓ Correct
async function Page() {
  const data = await fetch('/api/data').then(r => r.json());
  return <DataComponent data={data} />;
}
```

---

## See Also

- [`server-components.md`](server-components.md) — when server components are advantageous
- [`server-actions.md`](server-actions.md) — mutations and form handling
- [`data-fetching.md`](data-fetching.md) — strategies for fetching on server vs. client
