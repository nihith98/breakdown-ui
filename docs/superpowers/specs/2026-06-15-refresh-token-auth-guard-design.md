# Refresh Token Fix & Auth Guard — Design Spec

**Date**: 2026-06-15  
**Scope**: `breakdown-ui` only  
**Status**: Approved

---

## Problem

Two bugs + one missing feature prevent session persistence in the UI:

1. **`token_expiry` never stored**: `loginUser()` in `lib/auth.ts` guards the localStorage write behind `if (cookies)`, but browsers block JavaScript from reading `Set-Cookie` response headers. The guard is always false → `token_expiry` is never written → the axios interceptor short-circuits immediately and refresh never fires.

2. **Axios interceptor is server-side only**: `api-client.ts` is imported by Next.js API routes (Node.js process). Its `refreshTokenIfNeeded()` bails with `if (typeof window === 'undefined')`. Client components call Next.js routes via `fetch()`, not via this axios client, so there is no client-side refresh path at all.

3. **No 401 auth guard**: When a protected Next.js API route returns 401, client components show a generic error with no redirect to the login page.

---

## Architecture

```
Browser (client component)
  └─ fetch('/api/groups')          ← client-side, uses window/cookies
       └─ Next.js API route         ← server-side Node.js
            └─ validates access-token cookie (jwt-validator)
            └─ calls Java backend via axios (api-client.ts)
```

Token storage: `access-token` and `refresh-token` are **httpOnly cookies** — invisible to JavaScript. Token expiry hint is stored in `localStorage` as `token_expiry` (unix seconds) so client-side code can pre-emptively refresh.

---

## Changes

### 1. Fix `lib/auth.ts` — always store `token_expiry` on login

**File**: `breakdown-ui/lib/auth.ts`

Remove the `if (cookies)` guard in `loginUser()`. After a successful login response (`response.ok`), unconditionally write `token_expiry = now + 900` to localStorage. The response is only ok when the backend returned a valid access token (15-min lifetime), so the expiry is always safe to compute from current time.

```ts
// Before (broken):
const cookies = response.headers.get('set-cookie');
if (cookies) {
  localStorage.setItem('token_expiry', ...);
}

// After:
const expiryTime = Math.floor(Date.now() / 1000) + 900;
if (typeof window !== 'undefined') {
  localStorage.setItem('token_expiry', expiryTime.toString());
}
```

### 2. Add `middleware.ts` — server-side proactive token refresh

**File**: `breakdown-ui/middleware.ts` (new)

Next.js middleware runs before every request in the Edge runtime. Responsibilities:

- **Skip** public paths: `/login`, `/register`, `/api/auth/*`
- **Read** the `access-token` cookie; decode its `exp` claim without full signature verification (Edge has no Node crypto)
- If token is missing or expires within 60 seconds **and** a `refresh-token` cookie exists: make an internal `fetch` to `/api/auth/refresh`, extract the new `access-token` from the JSON response, rewrite the cookie on the outgoing response, and continue
- If token is missing/expired and refresh also fails (or no refresh token): redirect to `/login`
- If token is valid (exp > now + 60): continue normally

Token decoding in Edge: decode the base64url payload of the JWT (no signature check — that happens inside API routes via `jwt-validator.ts`). This is safe because middleware only decides whether to refresh/redirect, not whether to trust the token for data access.

**Matcher config**: apply to all routes except `/_next/*` and `/favicon.ico`.

### 3. Add `lib/client-fetch.ts` — client-side 401 guard

**File**: `breakdown-ui/lib/client-fetch.ts` (new)

A thin drop-in wrapper around `fetch()` for use in `'use client'` components:

```ts
export async function clientFetch(input: RequestInfo, init?: RequestInit): Promise<Response>
```

Behaviour:
1. Call `fetch(input, init)` normally
2. If response status is 401 **and** the URL is not an auth route (`/api/auth/`):
   a. POST to `/api/auth/refresh` 
   b. If refresh succeeds (200): retry the original request once
   c. If retry still 401, or refresh failed: `window.location.replace('/login')`
3. Return the response (original or retried)

Auth routes (`/api/auth/login`, `/api/auth/refresh`, etc.) are excluded to prevent infinite loops.

### 4. Update `groups/page.tsx` — use `clientFetch`

**File**: `breakdown-ui/app/(dashboard)/groups/page.tsx`

Replace the three `fetch('/api/groups')` and `fetch('/api/groups/join')` calls with `clientFetch(...)`. No other logic changes.

---

## What is NOT changed

- `lib/api-client.ts` — the axios clients for server-side API routes are correct as-is; their refresh interceptor is vestigial for client-side use but harmless
- `app/api/auth/refresh/route.ts` — the refresh endpoint is correct
- `lib/auth-middleware.ts` / `lib/jwt-validator.ts` — unchanged
- All Java backend code — the API works as expected

---

## Error States

| Situation | Result |
|---|---|
| Valid token | Normal request proceeds |
| Token expired, valid refresh token | Middleware refreshes → request continues |
| Token expired, no/invalid refresh token | Middleware redirects to `/login` |
| Client fetch gets 401, refresh succeeds | Request retried, succeeds |
| Client fetch gets 401, refresh fails | Redirect to `/login` |
| Client fetch gets non-401 error | Error propagated as-is (existing behaviour) |

---

## Files Changed

| File | Action |
|---|---|
| `breakdown-ui/lib/auth.ts` | Modify — fix `loginUser()` token_expiry storage |
| `breakdown-ui/middleware.ts` | Create — server-side token refresh + redirect |
| `breakdown-ui/lib/client-fetch.ts` | Create — client-side 401 guard |
| `breakdown-ui/app/(dashboard)/groups/page.tsx` | Modify — use `clientFetch` |
