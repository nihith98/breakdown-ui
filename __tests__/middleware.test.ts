import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

const mockFetch = jest.fn();
global.fetch = mockFetch;

// Build a valid-looking JWT with a given exp claim (no real signature needed for unit tests)
function buildFakeJwt(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: 'user-1', username: 'testuser', exp }));
  return `${header}.${payload}.fakesig`;
}

function makeRequest(
  pathname: string,
  cookies: Record<string, string> = {},
): NextRequest {
  const url = `http://localhost:3000${pathname}`;
  const req = new NextRequest(url);
  Object.entries(cookies).forEach(([name, value]) => {
    req.cookies.set(name, value);
  });
  return req;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('middleware_publicPath_passesThrough', () => {
  it('should not redirect requests to /login', async () => {
    const req = makeRequest('/login');
    const res = await middleware(req);
    expect(res.status).not.toBe(307);
    expect(res.headers.get('location')).toBeNull();
  });

  it('should not redirect requests to /register', async () => {
    const req = makeRequest('/register');
    const res = await middleware(req);
    expect(res.status).not.toBe(307);
  });
});

describe('middleware_apiPath_passesThrough', () => {
  it('should not redirect API routes even without a token', async () => {
    const req = makeRequest('/api/groups');
    const res = await middleware(req);
    expect(res.status).not.toBe(307);
    expect(res.headers.get('location')).toBeNull();
  });

  it('should not redirect /api/auth/refresh', async () => {
    const req = makeRequest('/api/auth/refresh');
    const res = await middleware(req);
    expect(res.status).not.toBe(307);
  });
});

describe('middleware_validToken_passesThrough', () => {
  it('should allow request when access-token is valid and not near expiry', async () => {
    const exp = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
    const req = makeRequest('/dashboard', { 'access-token': buildFakeJwt(exp) });

    const res = await middleware(req);

    expect(res.status).not.toBe(307);
    expect(res.headers.get('location')).toBeNull();
  });
});

describe('middleware_expiredToken_withRefreshToken_refreshesAndContinues', () => {
  it('should call /api/auth/refresh and set new access-token cookie', async () => {
    const expiredExp = Math.floor(Date.now() / 1000) - 60;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'refreshed-jwt-token' }),
    });

    const req = makeRequest('/', {
      'access-token': buildFakeJwt(expiredExp),
      'refresh-token': 'valid-refresh-token',
    });

    const res = await middleware(req);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/refresh'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(res.status).not.toBe(307);
    // New access-token cookie should be set on the response
    expect(res.cookies.get('access-token')?.value).toBe('refreshed-jwt-token');
  });
});

describe('middleware_expiredToken_refreshFails_redirectsToLogin', () => {
  it('should redirect to /login when refresh endpoint returns non-ok', async () => {
    const expiredExp = Math.floor(Date.now() / 1000) - 60;
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Refresh token expired' }),
    });

    const req = makeRequest('/groups', {
      'access-token': buildFakeJwt(expiredExp),
      'refresh-token': 'expired-refresh-token',
    });

    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });
});

describe('middleware_noToken_noRefreshToken_redirectsToLogin', () => {
  it('should redirect to /login when no cookies present', async () => {
    const req = makeRequest('/groups');

    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });
});

describe('middleware_tokenExpiringSoon_withRefreshToken_refreshesProactively', () => {
  it('should refresh when token expires within 60 seconds', async () => {
    const soonExp = Math.floor(Date.now() / 1000) + 30; // 30s left — within the 60s threshold
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'proactive-refreshed-token' }),
    });

    const req = makeRequest('/', {
      'access-token': buildFakeJwt(soonExp),
      'refresh-token': 'valid-refresh-token',
    });

    const res = await middleware(req);

    expect(mockFetch).toHaveBeenCalled();
    expect(res.cookies.get('access-token')?.value).toBe('proactive-refreshed-token');
  });
});
