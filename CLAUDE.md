# breakDown-ui — Frontend Coding Conventions (Next.js)

## See Also

- [`architecture.md`](architecture.md) — system architecture, server/client components, data flow
- [`unit-tests.md`](unit-tests.md) — testing strategy, Jest + React Testing Library patterns
- [`deployment.md`](deployment.md) — deployment to Vercel, AWS, GCP
- [`docs/implementation-guides/`](docs/implementation-guides/) — step-by-step guides for adding features
- [`docs/architecture-deep-dives/`](docs/architecture-deep-dives/) — deep dives on server components, server actions, API routes

---

## Platform

**Web + PWA only.** Built with Next.js 15, React 19, TypeScript.

---

## Hard Rules — Never Violate

- **Server components by default** — use `'use client'` directive only when client-side interactivity is needed
- **Server actions for mutations** — use `'use server'` for form submissions, POST/PUT/DELETE operations
- **API routes as middleware** — all data fetching goes through `app/api/` routes to the Java backend
- **Strict TypeScript: true** — all code must be fully typed. No `any` without explicit `@ts-ignore` comment
- **All responses typed via `ResponseStructure<T>`** — Java backend contract must be respected
- **No Context API or custom state management** — use `useState` + server actions for forms, server components for data
- **No feature flags in frontend** — configuration comes from environment variables only

---

## File Structure & Naming

### Pages (Server Components)
```typescript
// ✓ Correct — app/(dashboard)/groups/[id]/page.tsx
import { getGroup } from '@/lib/group-service';

export default async function GroupPage({ params }: { params: { id: string } }) {
  const group = await getGroup(params.id);
  return <div>{group.name}</div>;
}

// ✗ Wrong — client component for data fetching
'use client';
import { useEffect, useState } from 'react';
export default function GroupPage({ params }) {
  const [group, setGroup] = useState(null);
  useEffect(() => { /* fetch */ }, []);
}
```

### Client Components
All interactive UI uses client components:

```typescript
// ✓ Correct — app/components/AddExpenseForm.tsx
'use client';

import { useState } from 'react';
import { addExpense } from '@/app/(dashboard)/groups/[id]/actions';

export function AddExpenseForm({ groupId }: { groupId: string }) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addExpense(groupId, { description });
    } finally {
      setIsSubmitting(false);
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Server Actions
Form submissions and mutations use server actions:

```typescript
// ✓ Correct — app/(dashboard)/groups/[id]/actions.ts
'use server';

import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function addExpense(
  groupId: string,
  input: { description: string }
) {
  const response = await apiClient.post(`/groups/${groupId}/expenses`, input);
  return handleResponseStructure(response).data;
}
```

### API Routes
Middleware to Java backend:

```typescript
// ✓ Correct — app/api/groups/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const response = await apiClient.get('/groups', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return NextResponse.json(response.data);
}
```

---

## TypeScript

### Strict Mode Enabled
All files must pass `tsconfig.json` with `"strict": true`. No implicit `any`.

### Response Typing

The backend always returns HTTP 200. Check `responseStatus` to determine success or failure. The `responseObject` field contains the actual payload on success (null on failure).

```typescript
import { ResponseStructure, handleResponseStructure } from '@/lib/response-handler';

interface Group {
  id: string;
  name: string;
}

// In API routes: parse response.data (the JSON body from Axios)
async function getGroup(id: string): Promise<Group> {
  const axiosResponse = await apiClient.get(`/groups/${id}`);
  return handleResponseStructure<Group>(axiosResponse.data);
}

// In server components: call API route, then parse
async function getGroupFromRoute(id: string): Promise<Group> {
  const response = await fetch(`/api/groups/${id}`);
  const data: Group = await response.json(); // API route already unwraps responseObject
  return data;
}
```

---

## Testing Strategy

### Framework: Jest + React Testing Library

All tests use Jest and React Testing Library (NOT React Native Testing Library).

### Server Action Tests
```typescript
// __tests__/app/groups/[id]/actions.test.ts
import { addExpense } from '@/app/(dashboard)/groups/[id]/actions';
import * as apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');

describe('addExpense_validInput_createsExpense', () => {
  it('should create expense via API', async () => {
    (apiClient.default.post as jest.Mock).mockResolvedValue({
      data: {
        responseStatus: 'SUCCESS' as const,
        responseMessage: 'Created',
        responseObject: { id: 'exp-1' },
      },
    });

    const result = await addExpense('group-123', { description: 'Dinner' });
    expect(result).toEqual({ id: 'exp-1' }); // handleResponseStructure returns responseObject
  });
});
```

### Component Tests
```typescript
// __tests__/components/ExpenseList.test.tsx
import { render, screen } from '@testing-library/react';
import { ExpenseList } from '@/components/ExpenseList';

describe('ExpenseList_withExpenses_rendersExpenses', () => {
  it('should render list items', () => {
    const expenses = [{ id: '1', amount: 100, description: 'Dinner' }];
    render(<ExpenseList expenses={expenses} />);
    expect(screen.getByText('Dinner')).toBeInTheDocument();
  });
});
```

### API Route Tests
```typescript
// __tests__/app/api/groups/route.test.ts
import { GET } from '@/app/api/groups/route';
import { NextRequest } from 'next/server';

describe('GET_/api/groups_returnsGroupList', () => {
  it('should return groups from backend', async () => {
    const request = new NextRequest('http://localhost:3000/api/groups');
    const response = await GET(request);
    expect(response.status).toBe(200);
  });
});
```

### Test Naming Convention
Use the pattern: **routeOrFunction_condition_expectedOutcome**

```typescript
// ✓ Correct
describe('addExpense_validInput_createsExpense', () => { ... });
describe('ExpenseList_noItems_showsEmptyState', () => { ... });
describe('GET_/api/groups_returnsGroupList', () => { ... });

// ✗ Wrong
describe('addExpense', () => { ... });
describe('test expense creation', () => { ... });
```

---

## Quick Start Reference

### New Developer Onboarding
1. Read [`architecture.md`](architecture.md) (5 min) — understand Next.js server/client component model
2. Read [`docs/architecture-deep-dives/server-components.md`](docs/architecture-deep-dives/server-components.md) — when to use server vs. client
3. Review [`CLAUDE.md`](CLAUDE.md) (this file) — conventions and hard rules

### Building a New Page
1. Read [`docs/implementation-guides/adding-a-page.md`](docs/implementation-guides/adding-a-page.md) — step-by-step checklist
2. Create server component in `app/` directory for data fetching
3. Extract interactive UI into `'use client'` components in `components/`
4. Use `'use server'` actions in `app/*/actions.ts` for mutations
5. Write tests using Jest + React Testing Library

### Adding API Integration
1. Read [`docs/architecture-deep-dives/api-routes.md`](docs/architecture-deep-dives/api-routes.md) — API route patterns
2. Create API route in `app/api/` that calls Java backend via `apiClient`
3. Use `handleResponseStructure()` to parse backend response
4. Call API route from server components or server actions
5. Write API route tests mocking `apiClient`

---

## Styling

### CSS Modules (Recommended)
```typescript
// components/Button.module.css
.button {
  padding: 0.75rem 1.5rem;
  background-color: #fbbf24;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.button:hover {
  background-color: #f59e0b;
}

// components/Button.tsx
import styles from './Button.module.css';

export function Button({ children }: { children: React.ReactNode }) {
  return <button className={styles.button}>{children}</button>;
}
```

### Inline Styles (as fallback)
```typescript
<div style={{ padding: '1rem', backgroundColor: '#efe9da' }} />
```

---

## Environment Variables

Access via `process.env.NEXT_PUBLIC_*` for client-side or `process.env.*` for server-side:

```typescript
// Client-side (from .env.local)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Server-side only
const SECRET_KEY = process.env.INTERNAL_SECRET;
```

---

## No Feature Flags in Frontend Code

All feature control comes from backend via configuration endpoints or API contracts. Frontend must respect backend response shape only.
