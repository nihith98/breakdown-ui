# breakDown-ui — System Architecture

**React Native 0.79 + Expo SDK 55 compiles one TypeScript codebase to web PWA (Vercel/AWS/GCP), iOS App Store, and Android Play Store.**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           Expo Router (app/ directory)                  │
│  Routes rendered as web pages AND native stack screens  │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│  Zustand Stores (UI state) + TanStack Query (async)    │
│  currentGroupId, modal visibility, cached server data  │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│           Axios HTTP Client (api/)                      │
│  Calls Java backend, typed via ResponseStructure<T>    │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│         Java Backend (breakdown-dashboard-svc)          │
│  Manages groups, expenses, calculations, persistence   │
└─────────────────────────────────────────────────────────┘
```

---

## State Ownership

### Zustand — UI State Only
Zustand stores own transient UI state:
- `currentGroupId` — which group is selected in the UI
- `isModalOpen` — which modal (create expense, add friend) is visible
- `accessToken` — authentication token for HTTP headers
- `selectedExpenseId` — which expense is being edited

**Pattern:**
```typescript
import create from 'zustand';

interface GroupStore {
  currentGroupId: string | null;
  setCurrentGroupId: (id: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
  currentGroupId: null,
  setCurrentGroupId: (id) => set({ currentGroupId: id }),
  isModalOpen: false,
  setIsModalOpen: (open) => set({ isModalOpen: open }),
}));
```

### TanStack Query — Server State
TanStack Query manages data fetched from Java backend:
- Expense lists, group details, user balances
- Caching, background refetch, stale-while-revalidate
- Error boundaries and loading states

**Pattern:**
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { getExpenses, createExpense } from '@/api/expenseClient';

export const useExpensesQuery = (groupId: string) => {
  return useQuery({
    queryKey: ['expenses', groupId],
    queryFn: () => getExpenses(groupId),
    enabled: !!groupId,
  });
};

export const useCreateExpenseMutation = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expense: Expense) => createExpense(groupId, expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
    },
  });
};
```

---

## Single Codebase = Three Platforms

### Web (PWA)
Expo Router generates routes in `app/` → deployed to Vercel/AWS as static bundle
- `app/index.tsx` → `https://app.domain.com/`
- `app/groups/[id].tsx` → `https://app.domain.com/groups/[id]`

### iOS
Same routes, compiled to native iOS app for App Store
- Navigation uses native stack (Expo Router links to native navigation)
- Platform-specific code via `.ios.tsx` files

### Android
Same routes, compiled to native Android app for Play Store
- Navigation uses native stack
- Platform-specific code via `.android.tsx` files

**Platform-specific files:**
```
app/
├── index.tsx           (shared web + native)
├── groups/
│   ├── [id].tsx       (shared)
│   └── [id].ios.tsx   (iOS-only overrides)
│   └── [id].android.tsx (Android-only overrides)
```

Expo Router automatically selects the correct file for each platform.

---

## Data Flow Example: Loading Expenses

1. **User navigates to group** → Expo Router renders `app/groups/[id].tsx`
2. **Component mounts** → calls `useExpensesQuery(groupId)` hook
3. **TanStack Query** → checks cache, fetches if needed
4. **Axios HTTP call** → POST to `GET /api/groups/{id}/expenses`
5. **Java backend** → returns `ResponseStructure<Expense[]>`
6. **Query hook** → caches result in TanStack Query
7. **Component re-renders** with `data` from hook
8. **User selects expense** → updates Zustand `selectedExpenseId`
9. **Modal opens** → shows editing UI (also Zustand state)
10. **User saves** → `useCreateExpenseMutation()` fires, invalidates query cache
11. **Expenses list refetches** and re-renders

---

## HTTP Contract with Backend

All responses follow Java backend `ResponseStructure<T>`:

```typescript
interface ResponseStructure<T> {
  result: {
    status: 'SUCCESS' | 'FAILURE';
    message: string;
  };
  data: T;
}
```

Axios client always returns this shape:

```typescript
// api/expenseClient.ts
export const getExpenses = async (groupId: string): Promise<ResponseStructure<Expense[]>> => {
  const response = await axios.get(`/api/groups/${groupId}/expenses`);
  return response.data; // Already ResponseStructure<Expense[]>
};
```

---

## Import Hooks Directly (No Context API)

Components do NOT use Context API for dependency injection. They import hooks directly:

```typescript
// ✓ Correct
import { useGroupStore } from '@/hooks/useGroupStore';
import { useExpensesQuery } from '@/hooks/useExpensesQuery';

export const ExpenseScreen = ({ groupId }) => {
  const selectedId = useGroupStore((state) => state.selectedExpenseId);
  const { data } = useExpensesQuery(groupId);
  return <FlatList data={data} />;
};
```

This avoids provider hell and makes testing easier (mock hooks directly).

---

## See Also

- [`docs/architecture-deep-dives/component-structure.md`](docs/architecture-deep-dives/component-structure.md) — where components live, how app/ directory maps to routes
- [`docs/architecture-deep-dives/state-management.md`](docs/architecture-deep-dives/state-management.md) — Zustand + TanStack Query patterns, anti-patterns
- [`docs/architecture-deep-dives/api-integration.md`](docs/architecture-deep-dives/api-integration.md) — HTTP client, error handling, typing ResponseStructure<T>
