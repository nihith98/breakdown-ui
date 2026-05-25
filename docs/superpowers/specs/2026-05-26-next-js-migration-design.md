# Next.js Migration Design Spec

**Date:** 2026-05-26  
**Status:** Design Approved  
**Scope:** Migrate breakDown-ui from React Native + Expo to Next.js with complete documentation rewrite

---

## Executive Summary

Delete all Expo/React Native code from `breakDown-ui/`. Rewrite all `.md` files to reflect a Next.js-idiomatic architecture using server components, server actions, and API routes as middleware to the Java backend. Keep all information types from original documentation, reorganized for Next.js best practices.

**Key architectural shift:**
- From: Single codebase targeting web + iOS + Android
- To: Web-first PWA using Next.js server components and server actions
- Strategy: Option 2 (idiomatic Next.js) with Approach A (big bang rewrite)

---

## Architecture Overview

**Core Pattern: Server Components + Server Actions + API Routes**

```
User Browser
    ↓
Next.js App Router (Server Components render HTML)
    ↓
Server Actions (handle mutations, re-validate, trigger re-renders)
    ↓
Next.js API Routes (business logic, auth, error handling)
    ↓
Java Backend (localhost:8080)
```

### Key Principles

- **Server components by default** — render on server, ship HTML to browser, minimal client JavaScript
- **Server actions for mutations** — "use server" functions handle data updates and revalidation
- **API routes as middleware** — centralized layer for Java backend communication, error handling, authentication
- **Client components only when interactive** — form inputs, modals, real-time state using React `useState` only
- **No global state library** — React's built-in hooks handle UI state, server handles data state via revalidation

### Data Ownership

| State Type | Owner | Example |
|-----------|-------|---------|
| **Server data** | Server | Groups, expenses, user balances (fetched server-side, cached via ISR/revalidation) |
| **UI state** | Client | Form values, modal visibility, loading indicators (React hooks only) |
| **Authentication** | Server | Token stored in HTTP-only cookie, used in API routes |

---

## File Structure & App Organization

### Directory Layout

```
breakDown-ui/
├── app/
│   ├── layout.tsx                 # Root layout (fonts, metadata, providers)
│   ├── page.tsx                   # Home / welcome screen
│   ├── (auth)/
│   │   ├── layout.tsx             # Auth layout (no header)
│   │   ├── login/page.tsx         # Login page
│   │   └── register/page.tsx      # Register page
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Dashboard layout (header, sidebar)
│   │   ├── page.tsx               # Dashboard home
│   │   ├── groups/
│   │   │   ├── page.tsx           # Groups list
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Group details (expenses, balances)
│   │   │       └── actions.ts     # Server actions for this group
│   │   ├── expenses/
│   │   │   ├── page.tsx           # All expenses
│   │   │   └── actions.ts         # Expense mutations
│   │   └── settings/page.tsx      # User settings
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts           # POST /api/auth (login/logout)
│   │   ├── groups/
│   │   │   ├── route.ts           # GET/POST /api/groups
│   │   │   └── [id]/route.ts      # GET/PUT /api/groups/[id]
│   │   ├── expenses/
│   │   │   ├── route.ts           # GET/POST /api/expenses
│   │   │   └── [id]/route.ts      # GET/PUT /api/expenses/[id]
│   │   └── middleware.ts          # Auth, logging, error handling
│   └── error.tsx                  # Error boundary
├── components/
│   ├── ExpenseList.tsx            # Shared client components
│   ├── GroupCard.tsx
│   └── ...
├── lib/
│   ├── api-client.ts              # Axios instance for Java backend
│   ├── response-handler.ts        # Transform ResponseStructure<T>
│   ├── auth.ts                    # Token management, cookie handling
│   └── utils.ts                   # Helper functions
├── docs/
│   ├── CLAUDE.md                  # REWRITTEN: Next.js conventions
│   ├── architecture.md            # REWRITTEN: Server components + API routes
│   ├── deployment.md              # REWRITTEN: Vercel/AWS/GCP deployment
│   ├── architecture-deep-dives/
│   │   ├── server-components.md   # NEW
│   │   ├── server-actions.md      # NEW
│   │   ├── api-routes.md          # NEW
│   │   ├── state-management.md    # REWRITTEN
│   │   ├── data-fetching.md       # REWRITTEN
│   │   └── authentication.md      # REWRITTEN
│   ├── implementation-guides/
│   │   ├── adding-a-page.md       # REWRITTEN
│   │   ├── adding-a-server-action.md  # NEW
│   │   ├── adding-an-api-route.md # NEW
│   │   ├── adding-a-client-component.md  # REWRITTEN
│   │   ├── adding-form-validation.md # NEW
│   │   └── fetching-data-server-side.md # REWRITTEN
│   └── reference/
│       ├── api-contract.md        # UPDATED
│       ├── component-inventory.md # UPDATED
│       ├── design-tokens.md       # UNCHANGED
│       ├── endpoint-index.md      # UNCHANGED
│       ├── types-reference.md     # UPDATED
│       └── next-js-patterns.md    # NEW
├── __tests__/                     # Jest tests (mirroring app/ structure)
├── e2e/                           # Playwright E2E tests
├── types/
│   ├── ResponseStructure.ts       # Keep from old codebase
│   └── ...                        # Other domain types
├── assets/                        # Keep images, icons, fonts
├── package.json                   # New Next.js dependencies
├── tsconfig.json                  # Next.js TypeScript config
├── next.config.js                 # Next.js configuration
└── .env.local                     # Environment variables
```

### Key Differences from Expo

- `app/` is Next.js App Router (file-based routing, same concept as Expo Router)
- `api/` routes are new middleware layer to Java backend
- `actions.ts` files contain server actions (new pattern)
- No `stores/` or `hooks/` for global state — React hooks inline in components
- `components/` now client-only (no platform-specific files like `.ios.tsx`)
- `lib/` replaces old `api/` folder for utilities and backend communication
- `types/` kept for reusable interfaces (ResponseStructure, domain models)

---

## Data Flow with Concrete Example

**Scenario: User viewing a group's expenses and adding a new expense**

### Step-by-step flow:

1. **User navigates to `/groups/123`**
   - Next.js routes to `app/groups/[id]/page.tsx`

2. **Server component executes (server-side)**
   ```typescript
   export default async function GroupPage({ params }) {
     const response = await fetch(`http://localhost:3000/api/groups/${params.id}/expenses`);
     const expenses = await response.json();
     return <GroupContent groupId={params.id} initialExpenses={expenses} />;
   }
   ```
   - Async server component fetches expenses from API route
   - Data is already loaded before HTML is sent to browser
   - No loading spinner needed

3. **HTML rendered and sent to browser**
   - Expenses list already visible
   - Zero waterfall delays

4. **User interaction: clicks "Add Expense" button**
   - Client component `<AddExpenseForm />` opens with React `useState`
   - Form state lives in component (modal open/close, form values)
   ```typescript
   'use client';
   const [isOpen, setIsOpen] = useState(false);
   const [formData, setFormData] = useState({...});
   ```

5. **User submits form**
   - Client calls server action: `await addExpense(formData)`
   - Server action executes on server with full Java backend access

6. **Server action calls API route**
   ```typescript
   'use server';
   export async function addExpense(input: CreateExpenseInput) {
     const response = await apiClient.post(`/api/expenses`, input);
     revalidatePath(`/groups/${groupId}`);
   }
   ```

7. **API route processes request**
   ```typescript
   // app/api/expenses/route.ts
   export async function POST(request: NextRequest) {
     const token = request.cookies.get('auth-token')?.value;
     const response = await apiClient.post(
       'http://localhost:8080/api/expenses',
       data,
       { headers: { Authorization: `Bearer ${token}` } }
     );
     return NextResponse.json(response.data);
   }
   ```
   - Validates request
   - Adds authentication headers
   - Calls Java backend
   - Returns response

8. **Server action triggers revalidation**
   - `revalidatePath('/groups/123')` tells Next.js to re-render the page
   - Server component re-fetches expenses
   - New HTML is generated

9. **Browser receives updated HTML**
   - Expenses list re-renders with new data
   - User sees update without page refresh (automatic via Next.js)

### Key advantages of this flow:

- ✅ Data ready on initial page load (no loading spinners for server data)
- ✅ Form state is local (simple React hooks)
- ✅ Backend URLs hidden from client (only API routes know Java backend location)
- ✅ Authentication centralized in API routes
- ✅ Revalidation automatic (similar to TanStack Query invalidation, but built-in)
- ✅ No need for TanStack Query (server handles caching via ISR/revalidation)

---

## State Management (React Hooks Only)

### Philosophy

No Zustand, no TanStack Query, no global state library. Use React's built-in capabilities:
- `useState` for component-level state
- `useContext` for truly global state (auth user, theme) — minimal use
- Server-side revalidation for data updates (replaces Query invalidation)

### State Location Rules

| State Type | Location | Example | Pattern |
|-----------|----------|---------|---------|
| **Server data** | Server component props | `expenses` fetched in page.tsx | Async component |
| **UI state** | Client component `useState` | Modal open/close | `useState(false)` |
| **Form state** | Client component `useState` | Form inputs | `useState({...})` |
| **Auth user** | `useContext` (global) | Current user, permissions | Minimal context |
| **Loading state** | Client component `useState` | Show spinner during submission | `useState(false)` |
| **Form errors** | Client component `useState` | Validation errors | `useState('')` |

### Pattern for an interactive page with form:

```typescript
// app/groups/[id]/page.tsx (SERVER COMPONENT)
export default async function GroupPage({ params }) {
  const expenses = await fetch(`/api/groups/${params.id}/expenses`).then(r => r.json());
  return <GroupContent groupId={params.id} initialExpenses={expenses} />;
}

// components/GroupContent.tsx (CLIENT COMPONENT)
'use client';
import { useState } from 'react';
import { addExpense } from '@/app/groups/[id]/actions';

export function GroupContent({ groupId, initialExpenses }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAddExpense(formData: CreateExpenseInput) {
    setIsLoading(true);
    setError('');
    try {
      const result = await addExpense(groupId, formData);
      setExpenses([...expenses, result]);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <ExpenseList expenses={expenses} />
      {isModalOpen && (
        <AddExpenseForm
          onSubmit={handleAddExpense}
          onClose={() => setIsModalOpen(false)}
          isLoading={isLoading}
          error={error}
        />
      )}
      <button onClick={() => setIsModalOpen(true)}>Add Expense</button>
    </>
  );
}
```

### Why no global state library:

- ✅ Simpler mental model — state lives where it's used
- ✅ Smaller bundle — no extra library code
- ✅ Server handles data — no need for client-side caching
- ✅ Fewer dependencies — less to learn, maintain, test
- ✅ Easier testing — mock server actions, not stores

---

## API Routes & Server Actions

### API Routes: Middleware to Java Backend

API routes are Next.js functions that run on the server and act as the bridge between the client and Java backend.

**Purpose:**
- Centralized authentication (add `Authorization` header)
- Error handling and response transformation
- Request validation
- Logging and monitoring
- ResponseStructure<T> transformation

**Example API route:**

```typescript
// app/api/groups/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call Java backend with auth header
    const response = await apiClient.get(`/groups/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Transform ResponseStructure<T> to clean JSON
    const { result, data } = handleResponseStructure(response);

    if (result.status === 'FAILURE') {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Failed to fetch group ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Server Actions: Handle Mutations from Client

Server actions are async functions that run on the server and can be called from client components.

**Purpose:**
- Accept form data from client
- Call API routes or Java backend directly
- Update database state
- Trigger page revalidation
- Return updated data to client

**Example server action:**

```typescript
// app/groups/[id]/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api-client';

interface CreateExpenseInput {
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
}

export async function addExpense(
  groupId: string,
  input: CreateExpenseInput
) {
  try {
    // Call API route (or directly call Java backend if preferred)
    const response = await apiClient.post(
      `/groups/${groupId}/expenses`,
      input
    );

    if (response.result.status === 'FAILURE') {
      throw new Error(response.result.message);
    }

    // Trigger page re-render with fresh data
    revalidatePath(`/groups/${groupId}`);

    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to add expense');
  }
}
```

**Calling from client component:**

```typescript
'use client';
import { addExpense } from '@/app/groups/[id]/actions';

export function AddExpenseForm({ groupId }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await addExpense(groupId, {
        description: formData.get('description'),
        amount: parseFloat(formData.get('amount')),
        paidBy: formData.get('paidBy'),
        splitBetween: formData.getAll('splitBetween'),
      });
      console.log('Expense added:', result);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Key Differences from Old Patterns

| Old Pattern (Expo) | New Pattern (Next.js) | Why |
|-------------------|----------------------|-----|
| Axios call from client | API route calls Java, client calls API route | Hide backend URLs, centralize auth |
| TanStack Query caching | `revalidatePath()` re-renders server component | Built-in, simpler, no library needed |
| Zustand mutation | Server action with `revalidatePath()` | Server-side updates, automatic client sync |
| Loading state in component | `useTransition()` hook | Standard Next.js pattern |

---

## Documentation Reorganization

### Current Structure (Expo/React Native)
- `architecture.md` — single codebase for 3 platforms
- `CLAUDE.md` — React Native + Expo conventions
- `deployment.md` — EAS, expo export, mobile app stores
- Architecture deep-dives focused on Expo Router, React Native patterns
- Implementation guides for screens, stores, queries in React Native

### New Structure (Next.js)

#### Core Documentation

**CLAUDE.md** (REWRITTEN)
- Next.js conventions (server vs client, file-based routing)
- Server component patterns and when to use
- Server action patterns for mutations
- Dependency injection (import hooks directly, no Context API)
- Logging, error handling, testing
- Code organization and naming conventions

**architecture.md** (REWRITTEN)
- System overview: server components → server actions → API routes → Java backend
- Data ownership (server data vs client state)
- Revalidation strategy (ISR vs on-demand)
- State management philosophy (React hooks only)
- Data flow diagrams
- No more mention of iOS/Android or React Native

**deployment.md** (REWRITTEN)
- Vercel deployment (1-click, recommended)
- AWS S3 + CloudFront deployment
- GCP Cloud Run deployment
- Environment variables for API endpoint
- Authentication setup
- Monitoring and logging

#### Architecture Deep-Dives

**server-components.md** (NEW)
- What are server components?
- When to use server components vs client components
- Async server component patterns
- Data fetching in server components
- Rendering HTML on the server
- Common patterns and gotchas

**server-actions.md** (NEW)
- What are server actions?
- How to define and call server actions
- Form submission with server actions
- Revalidation strategies (`revalidatePath`, `revalidateTag`)
- Error handling in server actions
- Type safety with server actions

**api-routes.md** (NEW)
- Purpose of API routes (middleware to Java backend)
- Structuring API routes
- Request/response handling
- Authentication in API routes
- Error handling and logging
- Testing API routes

**state-management.md** (REWRITTEN)
- Philosophy: React hooks only, no global libraries
- Where state lives (server vs client)
- Using `useState` for component state
- Using `useContext` for global state (minimal)
- Form state management
- Loading and error states
- Comparison to old Zustand + TanStack Query patterns

**data-fetching.md** (REWRITTEN)
- Server-side fetching in async server components
- Incremental Static Regeneration (ISR)
- On-demand revalidation with `revalidatePath()`
- Response caching strategies
- Error handling in data fetching
- Performance optimization
- Comparison to old TanStack Query patterns

**authentication.md** (REWRITTEN)
- Authentication flow (login, token management, logout)
- HTTP-only cookies for token storage
- Auth middleware in API routes
- Protected routes and redirects
- Token refresh strategy
- Session management

#### Implementation Guides

**adding-a-page.md** (REWRITTEN from "adding-a-screen")
- Create new routes using app/ directory
- Route groups and layouts
- Dynamic routes `[id]`
- Creating server components for pages
- Passing data to client components
- Handling errors with error.tsx

**adding-a-server-action.md** (NEW)
- Define server actions with "use server"
- Accept form data or parameters
- Call API routes or Java backend
- Error handling in server actions
- Revalidation strategies
- Testing server actions

**adding-an-api-route.md** (NEW)
- Create API routes in app/api/
- Handle GET/POST/PUT/DELETE
- Add authentication
- Transform ResponseStructure<T>
- Error handling and validation
- Testing API routes

**adding-a-client-component.md** (REWRITTEN from component guidelines)
- Create interactive components with "use client"
- Using React hooks for state
- Form handling and validation
- Loading and error states
- Calling server actions
- Styling with CSS modules or Tailwind

**adding-form-validation.md** (NEW)
- Client-side validation with React
- Server-side validation in API routes
- Error display patterns
- Form state management
- Accessibility considerations
- Testing forms

**fetching-data-server-side.md** (REWRITTEN from query patterns)
- Async server components
- Caching strategies (ISR, dynamic rendering)
- Revalidation on mutation
- Error boundaries
- Performance optimization
- Testing data fetching

#### Reference Documentation

**api-contract.md** (UPDATED)
- ResponseStructure<T> interface
- Java backend endpoints
- Error response format
- Authentication headers
- Rate limiting
- Versioning strategy

**component-inventory.md** (UPDATED)
- All interactive components (no platform-specific variants)
- Component API (props, callbacks)
- Usage examples
- Variants and states
- Accessibility notes

**design-tokens.md** (UNCHANGED)
- Colors, spacing, typography
- Shadows, border radius, durations
- Accessible contrast ratios

**endpoint-index.md** (UNCHANGED)
- All Java backend endpoints
- Request/response schemas
- Error codes
- Authentication requirements

**types-reference.md** (UPDATED)
- TypeScript interfaces for all domain models
- API response types
- Form input types
- Error types
- Utility types

**next-js-patterns.md** (NEW)
- Common Next.js patterns
- Server component gotchas
- Performance optimization tips
- Debugging strategies
- Common mistakes and how to avoid them

### Information Preservation Map

| Old Doc | New Home | Information Preserved |
|---------|----------|----------------------|
| CLAUDE.md conventions | CLAUDE.md | Coding style, naming, DI patterns, testing |
| Expo Router structure | architecture.md + server-components.md | File-based routing concept |
| Zustand patterns | state-management.md | State ownership, state location rules |
| TanStack Query patterns | data-fetching.md + state-management.md | Caching, revalidation, invalidation |
| Component structure | adding-a-client-component.md | Component organization, reusability |
| Testing strategy | CLAUDE.md | Testing framework, patterns, naming |
| Deployment | deployment.md | Build process, environment setup |
| API contract | api-contract.md | ResponseStructure, endpoints |
| Types | types-reference.md | Domain models, interfaces |

---

## Testing Strategy

### Layer-by-layer testing with Jest, React Testing Library, and Playwright

#### 1. Server Actions (Jest + mocking API)

Test server action logic in isolation by mocking the API client.

```typescript
// __tests__/app/groups/[id]/actions.test.ts
import { addExpense } from '@/app/groups/[id]/actions';
import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api-client';

jest.mock('next/cache');
jest.mock('@/lib/api-client');

describe('addExpense_validInput_createsExpense', () => {
  it('should call API and revalidate page', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({
      result: { status: 'SUCCESS' },
      data: { id: 'exp-1', description: 'Dinner', amount: 50 },
    });

    const result = await addExpense('group-123', {
      description: 'Dinner',
      amount: 50,
      paidBy: 'user1',
      splitBetween: ['user1', 'user2'],
    });

    expect(result).toEqual({ id: 'exp-1', description: 'Dinner', amount: 50 });
    expect(revalidatePath).toHaveBeenCalledWith('/groups/group-123');
  });
});
```

#### 2. API Routes (Jest + mocking Java backend)

Test API route logic by mocking the Java backend calls.

```typescript
// __tests__/app/api/groups/[id]/route.test.ts
import { GET } from '@/app/api/groups/[id]/route';
import { NextRequest } from 'next/server';
import { apiClient } from '@/lib/api-client';

jest.mock('@/lib/api-client');

describe('getGroup_validId_returnsGroup', () => {
  it('should fetch group from Java backend', async () => {
    const mockRequest = {
      cookies: { get: (name: string) => ({ value: 'auth-token-123' }) },
    } as any as NextRequest;

    (apiClient.get as jest.Mock).mockResolvedValue({
      result: { status: 'SUCCESS' },
      data: { id: '123', name: 'Trip to Rome', members: ['user1', 'user2'] },
    });

    const response = await GET(mockRequest, { params: { id: '123' } });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe('123');
  });
});
```

#### 3. Client Components (React Testing Library)

Test interactive components by mocking server actions.

```typescript
// components/__tests__/GroupContent.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GroupContent } from '@/components/GroupContent';
import * as actions from '@/app/groups/[id]/actions';

jest.mock('@/app/groups/[id]/actions');

describe('GroupContent_addExpenseClick_opensModal', () => {
  it('should open modal when add button clicked', () => {
    const expenses = [{ id: '1', description: 'Dinner', amount: 50 }];
    render(<GroupContent groupId="123" initialExpenses={expenses} />);

    fireEvent.click(screen.getByText('Add Expense'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should submit form and call server action', async () => {
    (actions.addExpense as jest.Mock).mockResolvedValue({
      id: '2',
      description: 'Lunch',
      amount: 30,
    });

    render(<GroupContent groupId="123" initialExpenses={[]} />);

    fireEvent.click(screen.getByText('Add Expense'));
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Lunch' },
    });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(actions.addExpense).toHaveBeenCalledWith('123', expect.any(Object));
    });
  });
});
```

#### 4. End-to-End (Playwright)

Test complete user flows with a real or stubbed backend.

```typescript
// e2e/add-expense.spec.ts
import { test, expect } from '@playwright/test';

test('add_expense_flow_submitFormAndRefreshesPage', async ({ page }) => {
  await page.goto('http://localhost:3000/groups/123');

  // Check initial expenses are loaded
  await expect(page.locator('text=Dinner')).toBeVisible();

  // Click add button and open modal
  await page.click('button:has-text("Add Expense")');
  await expect(page.locator('role=dialog')).toBeVisible();

  // Fill form
  await page.fill('input[name="description"]', 'Lunch');
  await page.fill('input[name="amount"]', '30');
  await page.click('label:has-text("user1")');

  // Submit
  await page.click('button:has-text("Submit")');

  // Verify new expense appears
  await expect(page.locator('text=Lunch')).toBeVisible();
  await expect(page.locator('text=30')).toBeVisible();
});
```

### Test File Structure

```
app/
├── groups/
│   ├── [id]/
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   └── __tests__/
│   │       ├── actions.test.ts      # Test server action
│   │       └── page.test.tsx        # Test page rendering
api/
├── groups/
│   ├── [id]/
│   │   ├── route.ts
│   │   └── __tests__/
│   │       └── route.test.ts        # Test API route
components/
├── GroupContent.tsx
└── __tests__/
    └── GroupContent.test.tsx        # Test client component
e2e/
├── add-expense.spec.ts              # E2E user flow
└── login-flow.spec.ts               # E2E login flow
```

### Test Naming Convention

Use pattern: `methodName_condition_expectedOutcome`

Examples:
- `addExpense_validInput_createsExpense`
- `getGroup_invalidId_returns404`
- `GroupContent_addExpenseClick_opensModal`

---

## Deletion Scope

### What Gets Deleted

All React Native + Expo code from `breakDown-ui/`:

```
app/                      # All Expo/React Native code
components/               # Will be recreated for Next.js
hooks/                    # No longer needed
stores/                   # Replaced by useState/useContext
queries/                  # Replaced by server-side fetching
api/                      # Replaced by Next.js /api routes
theme/                    # Will recreate with CSS modules
babel.config.js           # Expo Babel config
metro.config.js           # Metro bundler config
app.json                  # Expo config
expo-env.d.ts            # Expo types
.expo/                    # Expo dev server folder
node_modules/             # Will reinstall for Next.js
```

### What Gets Kept

```
docs/                     # Folder structure kept, .md files REWRITTEN
assets/                   # Images, icons, fonts reused
types/                    # ResponseStructure, domain interfaces reused
CLAUDE.md                 # Rewritten for Next.js
```

### Reusable Code from Old Codebase

| Code | Status | Reason |
|------|--------|--------|
| `ResponseStructure<T>` interface | Keep | Backend contract unchanged |
| Domain type interfaces (Expense, Group, User) | Keep | Same data model |
| Design tokens (colors, spacing) | Keep/Recreate | Can reuse or migrate to CSS variables |
| Asset files (images, icons) | Keep | No framework dependency |
| API endpoint URLs | Keep | Same Java backend |
| Authentication logic | Adapt | Keep concept, implement as server actions + API routes |

---

## Deletion Strategy

### Step 1: Preserve

Create `.md` files containing code snippets that will be referenced during implementation:
- Original component structure for reference
- Original API contract definitions
- Original types and interfaces

### Step 2: Delete

Delete all code directories:
```bash
rm -rf app/ components/ hooks/ stores/ queries/ api/ theme/
rm babel.config.js metro.config.js app.json expo-env.d.ts
rm -rf .expo/ node_modules/
```

### Step 3: Reorganize .md files

```bash
# Keep only docs/ folder, delete everything else except assets/ and types/
find . -type f -name "*.md" -not -path "./docs/*" -delete
```

### Step 4: Rewrite .md files

Follow the documentation reorganization plan above. Rewrite all `.md` files to reflect Next.js architecture and patterns.

---

## Success Criteria

✅ All React Native + Expo code deleted  
✅ All `.md` files rewritten for Next.js  
✅ All information types from original docs preserved  
✅ Documentation complete and self-consistent  
✅ No TODO or TBD placeholders in docs  
✅ Examples follow Next.js best practices  
✅ Testing strategy clearly defined  
✅ API contract documented  
✅ Deployment process documented  

---

## Next Steps

1. **User review** — Review this spec and request changes if needed
2. **Implementation plan** — Invoke writing-plans skill to create detailed implementation roadmap
3. **Execution** — Follow plan: delete code, rewrite docs, build Next.js project
