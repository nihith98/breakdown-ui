import { clientFetch } from '@/lib/client-fetch';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockLocationReplace = jest.fn();
Object.defineProperty(window, 'location', {
  value: { replace: mockLocationReplace },
  writable: true,
});

beforeEach(() => {
  mockFetch.mockReset();
  mockLocationReplace.mockReset();
});

describe('clientFetch_200Response_returnsResponseAsIs', () => {
  it('should return the response unchanged when status is 200', async () => {
    const mockResponse = { status: 200, ok: true, json: async () => ({ data: 'ok' }) };
    mockFetch.mockResolvedValueOnce(mockResponse);

    const result = await clientFetch('/api/groups');

    expect(result).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockLocationReplace).not.toHaveBeenCalled();
  });
});

describe('clientFetch_500Response_returnsResponseAsIs', () => {
  it('should return non-401 error responses without triggering refresh', async () => {
    const mockResponse = { status: 500, ok: false };
    mockFetch.mockResolvedValueOnce(mockResponse);

    const result = await clientFetch('/api/groups');

    expect(result).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockLocationReplace).not.toHaveBeenCalled();
  });
});

describe('clientFetch_authRoute401_doesNotAttemptRefresh', () => {
  it('should return 401 from auth routes without attempting refresh to avoid loops', async () => {
    const mockResponse = { status: 401, ok: false };
    mockFetch.mockResolvedValueOnce(mockResponse);

    const result = await clientFetch('/api/auth/refresh');

    expect(result).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockLocationReplace).not.toHaveBeenCalled();
  });
});

describe('clientFetch_401_refreshSucceeds_retrySucceeds_returnsRetryResponse', () => {
  it('should refresh token and retry the original request on 401', async () => {
    const initial401 = { status: 401, ok: false };
    const refreshOk = { status: 200, ok: true, json: async () => ({ accessToken: 'new-token' }) };
    const retryOk = { status: 200, ok: true, json: async () => ({ groups: [] }) };

    mockFetch
      .mockResolvedValueOnce(initial401)   // original request → 401
      .mockResolvedValueOnce(refreshOk)    // refresh → 200
      .mockResolvedValueOnce(retryOk);     // retry → 200

    const result = await clientFetch('/api/groups');

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/auth/refresh', expect.objectContaining({ method: 'POST' }));
    expect(mockFetch).toHaveBeenNthCalledWith(3, '/api/groups', undefined);
    expect(result).toBe(retryOk);
    expect(mockLocationReplace).not.toHaveBeenCalled();
  });
});

describe('clientFetch_401_refreshFails_redirectsToLogin', () => {
  it('should redirect to /login when refresh endpoint returns non-ok', async () => {
    const initial401 = { status: 401, ok: false };
    const refreshFailed = { status: 401, ok: false };

    mockFetch
      .mockResolvedValueOnce(initial401)
      .mockResolvedValueOnce(refreshFailed);

    await clientFetch('/api/groups');

    expect(mockLocationReplace).toHaveBeenCalledWith('/login');
  });
});

describe('clientFetch_401_refreshSucceeds_retryStill401_redirectsToLogin', () => {
  it('should redirect to /login when retry after refresh also returns 401', async () => {
    const initial401 = { status: 401, ok: false };
    const refreshOk = { status: 200, ok: true, json: async () => ({ accessToken: 'new-token' }) };
    const retryStill401 = { status: 401, ok: false };

    mockFetch
      .mockResolvedValueOnce(initial401)
      .mockResolvedValueOnce(refreshOk)
      .mockResolvedValueOnce(retryStill401);

    await clientFetch('/api/groups');

    expect(mockLocationReplace).toHaveBeenCalledWith('/login');
  });
});

describe('clientFetch_401_withPostInit_retryForwardsOriginalInit', () => {
  it('should forward the original request init when retrying after refresh', async () => {
    const init = { method: 'POST', body: JSON.stringify({ name: 'Test Group' }) };
    const initial401 = { status: 401, ok: false };
    const refreshOk = { status: 200, ok: true, json: async () => ({ accessToken: 'new-token' }) };
    const retryOk = { status: 200, ok: true };

    mockFetch
      .mockResolvedValueOnce(initial401)
      .mockResolvedValueOnce(refreshOk)
      .mockResolvedValueOnce(retryOk);

    await clientFetch('/api/groups', init);

    // Third call (retry) should use the same init as the original
    expect(mockFetch).toHaveBeenNthCalledWith(3, '/api/groups', init);
  });
});
