# Adding a Zustand Store

Zustand manages client-side UI state in Breakdown. Unlike TanStack Query, which handles server data, Zustand stores are for ephemeral UI state that doesn't require persistence or server synchronization.

## When to Use Zustand vs TanStack Query

**Use Zustand for:**
- Access token and authentication status
- Modal/dialog visibility state
- Selected filter preferences (not the results—those come from queries)
- Currently selected group or section
- Temporary UI state like expanded accordion panels

**Use TanStack Query for:**
- Transaction lists and details
- User profiles
- Group settings
- Settlement calculations
- Anything that came from the server

**Counter-examples:**
- ❌ Storing transaction list in Zustand (use `useTransactionList` query instead)
- ❌ Storing user profile in Zustand (use `useUser` query instead)
- ✅ Storing current groupId while navigating (Zustand)
- ✅ Storing modal open/close state (Zustand)

## Store Location

All Zustand stores belong in the `stores/` directory. One file per store:

```
stores/
├── authStore.ts
├── modalStore.ts
├── filterStore.ts
└── navigationStore.ts
```

## Store Template: TypeScript + Zustand

Use this pattern for all stores:

```typescript
// stores/authStore.ts

import { create } from 'zustand'

// 1. Define state interface
interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  expiresAt: number | null
  
  // 2. Define actions
  setAccessToken: (token: string, expiresIn: number) => void
  setRefreshToken: (token: string) => void
  clearSession: () => void
}

// 3. Create store with typed actions
export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  expiresAt: null,
  
  // Actions
  setAccessToken: (token, expiresIn) =>
    set({
      accessToken: token,
      isAuthenticated: true,
      expiresAt: Date.now() + expiresIn * 1000,
    }),
  
  setRefreshToken: (token) =>
    set({ refreshToken: token }),
  
  clearSession: () =>
    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      expiresAt: null,
    }),
}))
```

## Zustand Store Structure

Every store follows this shape:

1. **State interface** – Defines all state fields with proper types
2. **Actions** – Functions that modify state
3. **Store creation** – `create()` call with initial state + action implementations

Key principles:
- All state is immutable—assign new objects, don't mutate
- Actions use `set()` to replace state
- No side effects in actions (keep them pure functions)
- TypeScript ensures type safety throughout

## Complete Example: AuthStore

```typescript
// stores/authStore.ts

import { create } from 'zustand'

interface AuthState {
  // State fields
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  userId: string | null
  expiresAt: number | null
  
  // Action signatures
  setAccessToken: (token: string, expiresIn: number) => void
  setRefreshToken: (token: string) => void
  setUserId: (id: string) => void
  clearSession: () => void
  isTokenExpired: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  userId: null,
  expiresAt: null,
  
  // Set access token with expiration time
  setAccessToken: (token, expiresIn) =>
    set({
      accessToken: token,
      isAuthenticated: true,
      expiresAt: Date.now() + expiresIn * 1000,
    }),
  
  // Store refresh token (persisted separately by authService)
  setRefreshToken: (token) =>
    set({ refreshToken: token }),
  
  // Store user ID from token payload
  setUserId: (id) =>
    set({ userId: id }),
  
  // Clear all auth state on logout
  clearSession: () =>
    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      userId: null,
      expiresAt: null,
    }),
  
  // Utility: check if token is expired
  isTokenExpired: () => {
    const { expiresAt } = get()
    if (!expiresAt) return true
    return Date.now() > expiresAt - 60_000 // 1 minute buffer
  },
}))
```

## Testing Pattern

Test stores by creating them, calling actions, and asserting state changes:

```typescript
// stores/authStore.test.ts

import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from './authStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      userId: null,
      expiresAt: null,
    })
  })

  it('should set access token and mark as authenticated', () => {
    const { result } = renderHook(() => useAuthStore())
    
    act(() => {
      result.current.setAccessToken('token123', 3600)
    })
    
    expect(result.current.accessToken).toBe('token123')
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.expiresAt).toBeGreaterThan(Date.now())
  })

  it('should clear session on logout', () => {
    const { result } = renderHook(() => useAuthStore())
    
    act(() => {
      result.current.setAccessToken('token123', 3600)
      result.current.clearSession()
    })
    
    expect(result.current.accessToken).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should detect expired tokens', () => {
    const { result } = renderHook(() => useAuthStore())
    
    act(() => {
      // Set expiration to 10 seconds ago
      useAuthStore.setState({
        expiresAt: Date.now() - 10_000,
      })
    })
    
    expect(result.current.isTokenExpired()).toBe(true)
  })
})
```

## Persistence Rules

**DO NOT persist Zustand stores to disk.** The exception:
- **Refresh token**: Persisted by `authService` using `expo-secure-store` directly—not through Zustand

Access tokens are memory-only by design. When the app closes, users re-authenticate with the refresh token.

## Usage in Components

```typescript
// components/LoginButton.tsx

import { useAuthStore } from '@/stores/authStore'

export function LoginButton() {
  const { isAuthenticated, clearSession } = useAuthStore()
  
  const handleLogout = () => {
    clearSession()
    // Navigate to login...
  }
  
  return isAuthenticated ? (
    <button onPress={handleLogout}>Logout</button>
  ) : (
    <button onPress={() => navigate('login')}>Login</button>
  )
}
```

Zustand stores are lightweight, type-safe, and perfect for UI state that doesn't need server synchronization.
