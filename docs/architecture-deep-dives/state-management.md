# State Management Deep-Dive

## Zustand vs TanStack Query

**Zustand** (UI state + volatile credentials):
- `currentGroupId`, `currentUserId` — selections
- `isModalOpen`, `activeTab` — UI visibility
- `accessToken` — bearer token
- Never persisted; cleared on logout

**TanStack Query** (cached server data):
- `groups`, `transactions`, `settlements` — queryKeys
- Auto-refetch on stale, invalidated after mutations
- Persisted to MMKV (native) or localStorage (web)

## Cache Invalidation

After mutations, invalidate relevant keys:

```typescript
const addTransaction = useMutation({
  mutationFn: (data) => api.post('/transactions', data),
  onSuccess: (response, vars) => {
    qc.invalidateQueries({ queryKey: ['transactions', vars.groupId] });
    qc.invalidateQueries({ queryKey: ['settlements', vars.groupId] });
  },
});
```

**Patterns:** Create/delete transaction → invalidate `['transactions', groupId]` + `['settlements', groupId]`. Create group → invalidate `['groups']`.

## Offline Persistence

**MMKV for native** (C++ store, ~100x faster than AsyncStorage):
```typescript
import { MMKV } from 'react-native-mmkv';
const persistor = createAsyncStoragePersister({
  storage: {
    getItem: (k) => new MMKV().getString(k),
    setItem: (k, v) => new MMKV().setString(k, v),
  },
});
```

Cold-start reads cached data (~10ms), displays stale content, refetches fresh in background. Web uses `window.localStorage`.

## Refresh Token

**Web (HttpOnly cookie):**
- Server stores in `Set-Cookie:...;HttpOnly;Secure`
- Browser auto-sends; JavaScript cannot read
- On 401: axios calls `/auth/refresh`, server responds with new token

**Native (expo-secure-store):**
```typescript
SecureStore.setItemAsync('refresh_token', response.refreshToken);

// On 401
const token = await SecureStore.getItemAsync('refresh_token');
const res = await api.post('/auth/refresh', { refreshToken: token });
useAppStore.setState({ accessToken: res.accessToken });
```

Access token: in Zustand, sent in `Authorization: Bearer`, valid 15 minutes.

## Adding Server-State Domain

Example: User settings.

**Hook:**
```typescript
export function useUserSettings(userId: string) {
  return useQuery({
    queryKey: ['userSettings', userId],
    queryFn: () => api.get(`/users/${userId}/settings`),
  });
}

export function useUpdateUserSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.put('/users/me/settings', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['userSettings'] }),
  });
}
```

**Usage:**
```typescript
export default function SettingsScreen() {
  const { data: settings, isLoading } = useUserSettings(userId);
  const { mutate: update } = useUpdateUserSettings();

  return (
    <SafeAreaView>
      <ScreenHeader title="Settings" />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <SettingsForm initialValues={settings} onSubmit={update} />
      )}
    </SafeAreaView>
  );
}
```

## Zustand Store

```typescript
export const useAppStore = create((set) => ({
  currentGroupId: null,
  setCurrentGroupId: (id) => set({ currentGroupId: id }),

  isCreateModalOpen: false,
  setIsCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),

  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),

  logout: () => set({
    currentGroupId: null,
    isCreateModalOpen: false,
    accessToken: null,
  }),
}));
```

In-memory only, cleared on logout.

## Integration

Query fetches data, store manages UI state:

```typescript
const groupId = useAppStore((s) => s.currentGroupId);
const { data: txns } = useTransactions(groupId);
<TransactionList txns={txns} />
```

Store updates immediately; query reruns with new key; TanStack Query refetches fresh data.
