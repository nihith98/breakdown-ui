# breakDown-ui — Testing Strategy

All tests use **Jest + React Native Testing Library**. No snapshots unless the component layout is immutable.

---

## Test Framework Stack

| Layer | Framework | Pattern |
|-------|-----------|---------|
| Components | Jest + RNTL | `render()`, assert user interactions, no snapshots unless immutable |
| Query Hooks | Jest + TanStack Query | Mock API client, assert returned data shape and loading states |
| Zustand Stores | Jest + `renderHook` | Create store instance, call actions, assert state changed |
| Utilities | Jest | Mock dependencies via `jest.mock()` |

---

## Component Testing

Test that components render correctly and respond to user interactions.

```typescript
// components/ExpenseList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ExpenseList } from './ExpenseList';

describe('ExpenseList_withExpenses_displaysItems', () => {
  it('should render expense items in list', () => {
    const expenses = [
      { id: '1', amount: 100, description: 'Dinner' },
      { id: '2', amount: 50, description: 'Gas' },
    ];
    render(<ExpenseList expenses={expenses} onSelectExpense={jest.fn()} />);
    
    expect(screen.getByText('Dinner')).toBeTruthy();
    expect(screen.getByText('Gas')).toBeTruthy();
  });
});

describe('ExpenseList_userSelectsExpense_callsOnSelectExpense', () => {
  it('should call callback when expense is pressed', () => {
    const onSelect = jest.fn();
    const expenses = [{ id: '1', amount: 100, description: 'Dinner' }];
    
    render(<ExpenseList expenses={expenses} onSelectExpense={onSelect} />);
    fireEvent.press(screen.getByText('Dinner'));
    
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});

describe('ExpenseList_noExpenses_showsEmptyState', () => {
  it('should render empty state message', () => {
    render(<ExpenseList expenses={[]} onSelectExpense={jest.fn()} />);
    expect(screen.getByText('No expenses yet')).toBeTruthy();
  });
});
```

**Snapshots Only for Immutable Layouts:**
Use snapshots ONLY for static header/footer components that never change. Avoid snapshots for content-heavy components.

```typescript
// components/Header.test.tsx
describe('Header_rendering_matchesSnapshot', () => {
  it('should match snapshot', () => {
    const { toJSON } = render(<Header appName="breakDown" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
```

---

## Query Hook Testing

Mock the API client and verify the hook returns the correct data shape and loading states.

```typescript
// hooks/useExpensesQuery.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExpensesQuery } from './useExpensesQuery';

jest.mock('@/api/expenseClient');
import { getExpenses } from '@/api/expenseClient';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useExpensesQuery_validGroupId_returnsExpenses', () => {
  it('should fetch and return expenses on mount', async () => {
    (getExpenses as jest.Mock).mockResolvedValue({
      result: { status: 'SUCCESS', message: '' },
      data: [{ id: '1', amount: 100, description: 'Dinner' }],
    });

    const { result } = renderHook(
      () => useExpensesQuery('group-123'),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{ id: '1', amount: 100, description: 'Dinner' }]);
  });
});

describe('useExpensesQuery_apiError_setsError', () => {
  it('should handle API errors gracefully', async () => {
    const error = new Error('Network error');
    (getExpenses as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(
      () => useExpensesQuery('group-123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});

describe('useExpensesQuery_emptyGroupId_disablesQuery', () => {
  it('should not fetch when groupId is null', async () => {
    const { result } = renderHook(
      () => useExpensesQuery(null),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(getExpenses).not.toHaveBeenCalled();
  });
});
```

---

## Store Testing

Test Zustand store actions and state updates.

```typescript
// hooks/useGroupStore.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useGroupStore } from './useGroupStore';

describe('useGroupStore_setCurrentGroupId_updatesState', () => {
  it('should update current group ID', () => {
    const { result } = renderHook(() => useGroupStore());
    
    expect(result.current.currentGroupId).toBe(null);
    
    act(() => {
      result.current.setCurrentGroupId('group-123');
    });
    
    expect(result.current.currentGroupId).toBe('group-123');
  });
});

describe('useGroupStore_setIsModalOpen_togglesModalVisibility', () => {
  it('should toggle modal visibility', () => {
    const { result } = renderHook(() => useGroupStore());
    
    expect(result.current.isModalOpen).toBe(false);
    
    act(() => {
      result.current.setIsModalOpen(true);
    });
    
    expect(result.current.isModalOpen).toBe(true);
    
    act(() => {
      result.current.setIsModalOpen(false);
    });
    
    expect(result.current.isModalOpen).toBe(false);
  });
});
```

---

## Test Naming Convention

Use the pattern: **componentName_scenario_expectedOutcome**

```typescript
// ✓ Correct
describe('LoginScreen_emptyPassword_showsError', () => { ... });
describe('ExpenseList_noItems_showsEmptyState', () => { ... });
describe('useGroupStore_setCurrentGroupId_updatesState', () => { ... });
describe('useExpensesQuery_apiError_setsError', () => { ... });

// ✗ Wrong
describe('LoginScreen', () => { ... });
describe('Test password validation', () => { ... });
describe('it works', () => { ... });
```

---

## Test File Location

Mirror the production package structure under `tests/`:

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

## AAA Structure in Tests

Use `// Arrange`, `// Act`, `// Assert` comments for clarity:

```typescript
describe('ExpenseList_userSelectsExpense_callsCallback', () => {
  it('should call onSelectExpense with expense ID', () => {
    // Arrange
    const onSelect = jest.fn();
    const expenses = [{ id: '1', amount: 100, description: 'Dinner' }];
    render(<ExpenseList expenses={expenses} onSelectExpense={onSelect} />);

    // Act
    fireEvent.press(screen.getByText('Dinner'));

    // Assert
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

---

## See Also

- [`docs/implementation-guides/adding-a-component.md`](docs/implementation-guides/adding-a-component.md) — checklist for creating components with tests
- [`docs/implementation-guides/adding-a-query.md`](docs/implementation-guides/adding-a-query.md) — checklist for creating query hooks with mocked API tests
