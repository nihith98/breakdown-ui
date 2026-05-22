# API Integration Deep-Dive

## Axios Instance Setup

```typescript
import axios from 'axios';
import { createAuthRefreshInterceptor } from 'axios-auth-refresh';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true, // Send HttpOnly cookies
  timeout: 10000,
});
```

**Key options:**
- `baseURL` — API server from environment
- `withCredentials: true` — browser auto-sends HttpOnly refresh cookies
- `timeout` — abort if no response in 10s

## 401 → Refresh → Retry Flow

```typescript
const onRefresh = async () => {
  const res = await api.post('/auth/refresh');
  useAppStore.setState({ accessToken: res.data.responseObject.accessToken });
};

createAuthRefreshInterceptor(api, onRefresh, {
  pauseInstanceWhileRefreshing: true,
  shouldRetry: (err) => err.response?.status === 401,
});
```

**Flow:**
1. Request fails with 401
2. Middleware pauses concurrent requests (prevents race condition)
3. Calls `/auth/refresh`
4. Updates access token in Zustand
5. Retries original request with new token
6. Resumes paused requests

`pauseInstanceWhileRefreshing: true` prevents multiple refresh calls simultaneously.

## Response Shape

All responses follow `ResponseStructure<T>`:

```typescript
// Success
{ "responseStatus": "SUCCESS", "responseMessage": "Data", "responseObject": {...} }

// Error (HTTP 200, FAILURE status)
{ "responseStatus": "FAILURE", "responseMessage": "Error", "responseObject": null }
```

HTTP status always 200. Outcome in `responseStatus` field.

## Platform-Specific Token Handling

**Web:**
- Refresh token in HttpOnly cookie (automatic)
- Browser sends on every request; JavaScript cannot read
- Access token in `Authorization: Bearer` header

**Native:**
```typescript
const token = await SecureStore.getItemAsync('refresh_token');
const res = await api.post('/auth/refresh', { refreshToken: token });
useAppStore.setState({ accessToken: res.data.responseObject.accessToken });
```

Both send access token in `Authorization: Bearer` header.

## Error Handling

```typescript
api.interceptors.response.use(
  (res) => res.data.responseObject,
  (err) => {
    if (err.response?.status === 401) return Promise.reject(err);
    console.error(err.response?.data?.responseMessage);
    Toast.show({ type: 'error' });
    return Promise.reject(err);
  },
);
```

401 handled automatically. Other errors logged + toasted.

## Adding Endpoints

1. **Types:**
```typescript
export interface CreateTransactionRequest {
  groupId: string;
  description: string;
  amount: number;
}
```

2. **Hook:**
```typescript
export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/transactions', data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['transactions', vars.groupId] });
    },
  });
}
```

3. **Usage:**
```typescript
const { mutate: create } = useCreateTransaction();
handleSubmit = (data) => create(data);
```

## Why Axios vs Fetch

Axios advantages:
- **Interceptor pattern** — centralized request/response handling
- **axios-auth-refresh** — automatic 401 recovery with race condition prevention
- **Custom fetch** — requires ~150 lines for pause + refresh logic
- **Cancellation** — built-in abort support
- **Timeouts** — configurable

Fetch requires manual queuing, double-refresh prevention, retry logic.

## Complete Setup

```typescript
import axios from 'axios';
import { createAuthRefreshInterceptor } from 'axios-auth-refresh';
import { useAppStore } from '@/stores/appStore';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAppStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data.responseObject,
  (err) => Promise.reject(err),
);

createAuthRefreshInterceptor(api, async () => {
  const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, {
    withCredentials: true,
  });
  useAppStore.setState({ accessToken: res.data.responseObject.accessToken });
}, { pauseInstanceWhileRefreshing: true });

export default api;
```

All requests use this instance; interceptors ensure token freshness and consistent error handling.
