'use client';

const AUTH_PREFIX = '/api/auth/';

async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.replace('/login');
  }
}

/**
 * Drop-in replacement for fetch() in client components.
 *
 * On 401 from a protected route:
 *   1. Attempts token refresh via /api/auth/refresh
 *   2. If successful, retries the original request once
 *   3. If retry still 401 or refresh failed, redirects to /login
 *
 * Auth routes (/api/auth/*) are passed through without the 401 guard
 * to prevent redirect loops.
 */
export async function clientFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const isAuthRoute = url.includes(AUTH_PREFIX);

  const response = await fetch(input, init);

  if (response.status !== 401 || isAuthRoute) {
    return response;
  }

  // 401 on a protected route — attempt refresh
  const refreshed = await attemptTokenRefresh();

  if (!refreshed) {
    redirectToLogin();
    return response;
  }

  // Retry the original request with refreshed cookie
  const retryResponse = await fetch(input, init);

  if (retryResponse.status === 401) {
    redirectToLogin();
  }

  return retryResponse;
}
