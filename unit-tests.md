# breakDown-ui — Testing Strategy

All tests use **Jest + React Testing Library**. No snapshots unless the component layout is immutable.

---

## Test Framework Stack

| Layer | Framework | Pattern |
|-------|-----------|---------|
| Client Components | Jest + RTL | `render()`, assert user interactions, no snapshots unless immutable |
| Server Actions | Jest + Mock `apiClient` | Mock Axios client, assert action logic and error handling |
| API Routes | Jest + Mock `apiClient` | Mock backend calls, assert response formatting |
| Pages (SSR) | Playwright (E2E) | Integration tests for server components + interactivity |
| Utilities | Jest | Mock dependencies via `jest.mock()` |

---

## Client Component Testing

Test client components with `'use client'` directive. Use `@testing-library/react` (not react-native).

```typescript
// __tests__/components/ExpenseList.test.tsx
import { render, screen } from '@testing-library/react';
import { ExpenseList } from '@/components/ExpenseList';

describe('ExpenseList_withExpenses_displaysItems', () => {
  it('should render expense items', () => {
    const expenses = [
      { id: '1', amount: 100, description: 'Dinner', groupId: 'g1', paidBy: 'Alice', splitBetween: [], createdAt: '', updatedAt: '' },
    ];
    render(<ExpenseList expenses={expenses} />);

    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();
  });
});

describe('ExpenseList_noExpenses_showsEmptyState', () => {
  it('should render empty state message', () => {
    render(<ExpenseList expenses={[]} />);
    expect(screen.getByText('No expenses yet')).toBeInTheDocument();
  });
});
```

**Snapshots Only for Immutable Layouts:**
Use snapshots ONLY for static components. Avoid snapshots for content-heavy components.

```typescript
// __tests__/components/Header.test.tsx
describe('Header_rendering_matchesSnapshot', () => {
  it('should match snapshot', () => {
    const { container } = render(<Header appName="breakDown" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

---

## Server Action Testing

Mock the API client and verify server action logic.

```typescript
// __tests__/app/groups/[id]/actions.test.ts
import { addExpense } from '@/app/(dashboard)/groups/[id]/actions';
import * as apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');

describe('addExpense_validInput_createsExpense', () => {
  it('should call API and return data', async () => {
    // Arrange — mock the Axios response: apiClient.post resolves to { data: <backend JSON> }
    const mockResponse = {
      data: {
        responseStatus: 'SUCCESS' as const,
        responseMessage: 'Created',
        responseObject: { id: 'exp-1', groupId: 'g1', description: 'Dinner', amount: 50, paidBy: 'user1', splitBetween: [], createdAt: '', updatedAt: '' },
      },
    };
    (apiClient.default.post as jest.Mock).mockResolvedValue(mockResponse);

    // Act
    const result = await addExpense('group-123', {
      description: 'Dinner',
      amount: 50,
      paidBy: 'user1',
      splitBetween: ['user1'],
    });

    // Assert
    expect(result).toEqual(mockResponse.data.responseObject);
    expect(apiClient.default.post).toHaveBeenCalledWith(
      '/groups/group-123/expenses',
      expect.any(Object)
    );
  });
});

describe('addExpense_apiFailure_throwsError', () => {
  it('should throw error on API failure', async () => {
    // Arrange
    (apiClient.default.post as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    // Act & Assert
    await expect(
      addExpense('group-123', {
        description: 'Dinner',
        amount: 50,
        paidBy: 'user1',
        splitBetween: ['user1'],
      })
    ).rejects.toThrow();
  });
});
```

---

## API Route Testing

Mock the backend calls and verify route logic.

```typescript
// __tests__/app/api/groups/route.test.ts
import { GET } from '@/app/api/groups/route';
import { NextRequest } from 'next/server';
import * as apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');

describe('GET_/api/groups_returnsGroupList', () => {
  it('should fetch groups and return data', async () => {
    // Arrange — mock the Axios response: apiClient.get resolves to { data: <backend JSON> }
    const mockResponse = {
      data: {
        responseStatus: 'SUCCESS' as const,
        responseMessage: 'OK',
        responseObject: [{ id: 'g1', name: 'Trip to NYC', members: [], description: '', createdAt: '', updatedAt: '' }],
      },
    };
    (apiClient.default.get as jest.Mock).mockResolvedValue(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/groups', {
      headers: { cookie: 'auth-token=test-token' },
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual(mockResponse.data.responseObject);
  });
});

describe('GET_/api/groups_noAuth_returns401', () => {
  it('should return 401 when no auth token', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/groups');

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(401);
  });
});
```

---

## Test Naming Convention

Use the pattern: **routeOrAction_scenario_expectedOutcome**

```typescript
// ✓ Correct
describe('addExpense_validInput_createsExpense', () => { ... });
describe('ExpenseList_noItems_showsEmptyState', () => { ... });
describe('GET_/api/groups_returnsGroupList', () => { ... });
describe('POST_/api/auth/login_invalidCredentials_returns401', () => { ... });

// ✗ Wrong
describe('addExpense', () => { ... });
describe('test expense creation', () => { ... });
describe('it works', () => { ... });
```

---

## Test File Location

Mirror the production structure under `__tests__/`:

```
app/
├── (dashboard)/
│   ├── groups/
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── actions.ts
│   └── page.tsx
├── api/
│   └── groups/
│       └── route.ts
└── (auth)/
    └── login/
        └── page.tsx

__tests__/
├── app/
│   ├── (dashboard)/
│   │   ├── groups/
│   │   │   └── [id]/
│   │   │       ├── actions.test.ts
│   │   │       └── page.test.tsx
│   │   └── page.test.tsx
│   ├── api/
│   │   └── groups/
│   │       └── route.test.ts
│   └── (auth)/
│       └── login/
│           └── page.test.tsx
└── components/
    ├── ExpenseList.test.tsx
    └── AddExpenseForm.test.tsx
```

---

## AAA Structure in Tests

Use `// Arrange`, `// Act`, `// Assert` comments for clarity:

```typescript
describe('ExpenseList_withItems_rendersItems', () => {
  it('should render expense items', () => {
    // Arrange
    const expenses = [{ id: '1', amount: 100, description: 'Dinner', groupId: 'g1', paidBy: 'Alice', splitBetween: [], createdAt: '', updatedAt: '' }];
    render(<ExpenseList expenses={expenses} />);

    // Act
    const item = screen.getByText('Dinner');

    // Assert
    expect(item).toBeInTheDocument();
  });
});
```

---

## E2E Testing with Playwright

Integration tests for full user flows (page load → form submit → navigation):

```typescript
// e2e/login-flow.spec.ts
import { test, expect } from '@playwright/test';

test('login_validCredentials_redirectsToDashboard', async ({ page }) => {
  // Arrange
  await page.goto('http://localhost:3000/login');

  // Act
  await page.fill('input[type="text"]', 'testuser');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Log In")');

  // Assert
  await expect(page).toHaveURL('http://localhost:3000/groups');
});
```

---

## See Also

- [`docs/implementation-guides/adding-a-client-component.md`](docs/implementation-guides/adding-a-client-component.md) — checklist for creating client components with tests
- [`docs/implementation-guides/adding-a-server-action.md`](docs/implementation-guides/adding-a-server-action.md) — checklist for creating server actions with tests
- [`docs/implementation-guides/adding-an-api-route.md`](docs/implementation-guides/adding-an-api-route.md) — checklist for creating API routes with tests
