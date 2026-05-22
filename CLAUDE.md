# breakDown-ui — Frontend Coding Conventions

## See Also

- [`architecture.md`](architecture.md) — system architecture, state management layers, platform differences
- [`unit-tests.md`](unit-tests.md) — testing strategy, Jest + React Native Testing Library patterns
- [`deployment.md`](deployment.md) — build pipelines, platform-specific deployment steps
- [`docs/implementation-guides/`](docs/implementation-guides/) — step-by-step guides for adding features
- [`docs/architecture-deep-dives/`](docs/architecture-deep-dives/) — deep dives on component structure, state management, API integration

---

## Hard Rules — Never Violate

- **No Lombok, Redux, or custom state management beyond Zustand + TanStack Query** — Period.
- **No Context API** — import hooks directly from Zustand stores or custom hook files.
- **Strict TypeScript: true** — all code must be fully typed. No `any` without explicit `@ts-ignore` comment.
- **All responses typed via `ResponseStructure<T>`** — Java backend contract must be respected in all HTTP responses.
- **No feature flags unless backend supports them** — configuration comes from environment variables only.

---

## Component Naming & File Structure

### PascalCase for Components
```typescript
// ✓ Correct
export const LoginScreen = () => { ... }
export const UserAvatar = () => { ... }
export const GroupModal = () => { ... }

// ✗ Wrong
export const loginScreen = () => { ... }
export const userAvatar = () => { ... }
```

### camelCase for Hooks
```typescript
// ✓ Correct
export const useGroupStore = () => { ... }
export const useExpensesQuery = () => { ... }
export const useDateFormatter = () => { ... }

// ✗ Wrong
export const UseGroupStore = () => { ... }
export const GetExpenses = () => { ... }
```

### Mirror Production Structure in Tests
```
app/
├── screens/
│   ├── LoginScreen.tsx
│   └── GroupScreen.tsx
├── components/
│   ├── ExpenseList.tsx
│   └── UserAvatar.tsx
└── hooks/
    ├── useGroupStore.ts
    └── useExpensesQuery.ts

tests/
├── screens/
│   ├── LoginScreen.test.tsx
│   └── GroupScreen.test.tsx
├── components/
│   ├── ExpenseList.test.tsx
│   └── UserAvatar.test.tsx
└── hooks/
    ├── useGroupStore.test.ts
    └── useExpensesQuery.test.ts
```

---

## Dependency Injection: Import Hooks Directly

Do NOT use React Context API. Import custom hooks and Zustand stores directly.

```typescript
// ✓ Correct: Direct import
import { useGroupStore } from '@/hooks/useGroupStore';
import { useExpensesQuery } from '@/hooks/useExpensesQuery';

export const GroupScreen = () => {
  const groupId = useGroupStore((state) => state.currentGroupId);
  const { data } = useExpensesQuery(groupId);
  return <View>...</View>;
};

// ✗ Wrong: Context API
const GroupContext = React.createContext(null);
export const GroupProvider = ({ children }) => <GroupContext.Provider>...</GroupContext.Provider>;
export const useGroup = () => useContext(GroupContext);
```

---

## Styling

### Tokens via react-native-unistyles
All semantic colors, fonts, spacing use unistyles tokens:

```typescript
import { StyleSheet, useStyles } from 'react-native-unistyles';

const stylesheet = createStyleSheet((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  text: {
    fontSize: theme.fonts.sizes.body,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.regular,
  },
}));

export const MyComponent = () => {
  const { styles } = useStyles(stylesheet);
  return <View style={styles.container}><Text style={styles.text}>Hello</Text></View>;
};
```

### Inline Styles for Overrides Only
Component-specific overrides go inline as a last resort:

```typescript
<View style={[styles.container, { paddingHorizontal: 8 }]} />
```

---

## TypeScript

### Strict Mode Enabled
All files must pass `tsconfig.json` with `"strict": true`. No implicit `any`.

### Response Typing
```typescript
import { ResponseStructure } from '@/types/ResponseStructure';

interface ExpenseListResponse {
  id: string;
  amount: number;
  description: string;
}

const { data, isLoading, error } = useExpensesQuery<ResponseStructure<ExpenseListResponse[]>>(groupId);

if (error) {
  const status = error.data?.result?.status; // "SUCCESS" | "FAILURE"
  const message = error.data?.result?.message;
}
```

---

## Testing Strategy

### Framework: Jest + React Native Testing Library

All tests use Jest and React Native Testing Library. No snapshots unless the component layout is immutable (e.g., a static header).

### Component Tests
```typescript
// components/ExpenseList.test.tsx
import { render, screen } from '@testing-library/react-native';
import { ExpenseList } from './ExpenseList';

describe('ExpenseList_rendering_showsExpenses', () => {
  it('should render list items', () => {
    const expenses = [{ id: '1', amount: 100, description: 'Dinner' }];
    render(<ExpenseList expenses={expenses} />);
    expect(screen.getByText('Dinner')).toBeTruthy();
  });
});
```

### Store Tests
```typescript
// hooks/useGroupStore.test.ts
import { useGroupStore } from './useGroupStore';
import { renderHook, act } from '@testing-library/react-native';

describe('useGroupStore_setCurrentGroup_updatesState', () => {
  it('should update current group ID', () => {
    const { result } = renderHook(() => useGroupStore());
    act(() => {
      result.current.setCurrentGroupId('group-123');
    });
    expect(result.current.currentGroupId).toBe('group-123');
  });
});
```

### Query Hook Tests (Mocking API)
```typescript
// hooks/useExpensesQuery.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useExpensesQuery } from './useExpensesQuery';

jest.mock('@/api/expenseClient');
import { getExpenses } from '@/api/expenseClient';

describe('useExpensesQuery_validGroupId_returnsExpenses', () => {
  it('should fetch and return expenses', async () => {
    (getExpenses as jest.Mock).mockResolvedValue({
      result: { status: 'SUCCESS' },
      data: [{ id: '1', amount: 100 }],
    });

    const { result } = renderHook(() => useExpensesQuery('group-123'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
  });
});
```

### Test Naming Convention
Use the pattern: **componentName_scenario_expectedOutcome**

```typescript
// ✓ Correct
describe('LoginScreen_emptyPassword_showsError', () => { ... });
describe('ExpenseList_noItems_showsEmptyState', () => { ... });
describe('useGroupStore_setCurrentGroup_updatesState', () => { ... });

// ✗ Wrong
describe('LoginScreen', () => { ... });
describe('test password validation', () => { ... });
```

---

## Quick Start Reference

### New Developer Onboarding
1. Read [`architecture.md`](architecture.md) (5 min) — understand the three-platform single-codebase model
2. Read [`docs/architecture-deep-dives/component-structure.md`](docs/architecture-deep-dives/component-structure.md) — where components live and how they're organized
3. Review [`CLAUDE.md`](CLAUDE.md) (this file) — conventions and hard rules

### Building a New Screen
1. Read [`docs/implementation-guides/adding-a-component.md`](docs/implementation-guides/adding-a-component.md) — step-by-step checklist
2. Use `useGroupStore()` for UI state (current modal, selected item, etc.)
3. Use custom query hooks for server state (Zustand + TanStack Query pattern)
4. Write component tests using Jest + React Native Testing Library
5. Verify TypeScript strict mode passes

### Adding API Integration
1. Read [`docs/architecture-deep-dives/api-integration.md`](docs/architecture-deep-dives/api-integration.md) — how to wire HTTP calls
2. Create API client function in `api/` directory that returns `ResponseStructure<T>`
3. Create custom query hook using TanStack Query (`useQuery`, `useMutation`)
4. Type response with Java backend contract in `types/ResponseStructure.ts`
5. Write query hook tests mocking the API client

### Using Code-Gen Tools
- Refer to [`docs/implementation-guides/codegen.md`](docs/implementation-guides/codegen.md) — how to regenerate types from Java backend endpoints

---

## Dependency Injection Pattern

**Always** import hooks and stores directly — never wrap with Context API or providers.

```typescript
// ✓ Correct
import { useGroupStore } from '@/hooks/useGroupStore';
import { useExpensesQuery } from '@/hooks/useExpensesQuery';

export const GroupExpenses = () => {
  const groupId = useGroupStore((state) => state.currentGroupId);
  const { data } = useExpensesQuery(groupId);
  return <View>{data?.map(...)}</View>;
};

// ✗ Wrong — Context API
import { useGroupContext } from '@/context/GroupContext';

export const GroupExpenses = () => {
  const { groupId } = useGroupContext();
  ...
};
```

---

## Logging

Use React Native's built-in `console` for debugging. For analytics, integrate with backend-provided endpoint only.

```typescript
console.log('Group selected::', groupId);
console.warn('Expense amount exceeded limit::', amount);
console.error('Failed to fetch expenses::', error);
```

---

## Environment Variables

Access via `process.env.EXPO_PUBLIC_*` (Expo prefix required for web/native builds):

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
const ENV = process.env.EXPO_PUBLIC_ENV || 'development';
```

---

## No Feature Flags in Frontend Code

All feature control comes from backend via configuration endpoints or API contracts. Frontend must respect backend response shape only.
