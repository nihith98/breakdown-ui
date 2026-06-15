import { loginUser, refreshToken } from '@/lib/auth';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  localStorageMock.clear();
  mockFetch.mockReset();
});

describe('loginUser_successResponse_storesTokenExpiry', () => {
  it('should store token_expiry in localStorage after successful login', async () => {
    const before = Math.floor(Date.now() / 1000);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await loginUser('testuser', 'password123');

    const stored = localStorageMock.getItem('token_expiry');
    expect(stored).not.toBeNull();

    const expiry = parseInt(stored!, 10);
    const after = Math.floor(Date.now() / 1000);

    // Expiry should be approximately now + 900 (15 minutes)
    expect(expiry).toBeGreaterThanOrEqual(before + 899);
    expect(expiry).toBeLessThanOrEqual(after + 901);
  });
});

describe('loginUser_successResponse_fetchesCorrectEndpoint', () => {
  it('should POST to /api/auth/login with credentials', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await loginUser('testuser', 'pass');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', password: 'pass' }),
      }),
    );
  });
});

describe('loginUser_failureResponse_throwsAndDoesNotStoreExpiry', () => {
  it('should throw error and not write token_expiry on failed login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    await expect(loginUser('testuser', 'wrongpass')).rejects.toThrow('Invalid credentials');
    expect(localStorageMock.getItem('token_expiry')).toBeNull();
  });
});

describe('loginUser_failureResponseNoErrorField_throwsDefaultMessage', () => {
  it('should throw "Login failed" when response has no error field', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    await expect(loginUser('user', 'pass')).rejects.toThrow('Login failed');
  });
});

describe('refreshToken_successResponse_updatesTokenExpiry', () => {
  it('should update token_expiry in localStorage on successful refresh', async () => {
    const before = Math.floor(Date.now() / 1000);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'new-jwt-token' }),
    });

    const result = await refreshToken();

    expect(result).toBe('new-jwt-token');

    const stored = localStorageMock.getItem('token_expiry');
    expect(stored).not.toBeNull();
    expect(parseInt(stored!, 10)).toBeGreaterThanOrEqual(before + 899);
  });
});

describe('refreshToken_failureResponse_clearsTokenExpiryAndReturnsNull', () => {
  it('should clear token_expiry and return null on failed refresh', async () => {
    localStorageMock.setItem('token_expiry', '9999999999');

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Refresh token expired' }),
    });

    const result = await refreshToken();

    expect(result).toBeNull();
    expect(localStorageMock.getItem('token_expiry')).toBeNull();
  });
});
