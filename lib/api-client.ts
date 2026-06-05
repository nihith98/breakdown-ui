import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_HOST = process.env.API_HOST || 'http://localhost:8080';

// Store for tracking whether refresh is in progress (prevents multiple refresh calls)
let refreshPromise: Promise<string | null> | null = null;

async function refreshTokenIfNeeded() {
  try {
    // Get token expiry from localStorage
    const tokenExpiry = localStorage.getItem('token_expiry');
    if (!tokenExpiry) return; // No token or no expiry info

    const expiryTime = parseInt(tokenExpiry, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    // Refresh if less than 2 minutes remaining
    const timeUntilExpiry = expiryTime - currentTime;

    if (timeUntilExpiry > 120) {
      return; // Token still valid for more than 2 minutes
    }

    // Prevent multiple simultaneous refresh calls
    if (refreshPromise) {
      await refreshPromise;
      return;
    }

    // Dynamically import refreshToken to avoid circular dependency
    const { refreshToken } = await import('./auth');
    refreshPromise = refreshToken();

    const newToken = await refreshPromise;
    refreshPromise = null;

    if (newToken) {
      // Update expiry time (assume 15 minutes from now)
      const newExpiry = Math.floor(Date.now() / 1000) + 900;
      localStorage.setItem('token_expiry', newExpiry.toString());
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
    refreshPromise = null;
  }
}

function createClient(basePath: string) {
  const client = axios.create({
    baseURL: `${API_HOST}${basePath}`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: check and refresh token if needed
  client.interceptors.request.use(
    async (config) => {
      await refreshTokenIfNeeded();
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      console.error('API error:', error.response?.status, error.message);
      return Promise.reject(error);
    }
  );

  return client;
}

export const authApiClient = createClient(process.env.AUTH_BASE_URL || '/authentication-svc');
export const registrationApiClient = createClient(process.env.REGISTRATION_BASE_URL || '/authentication-svc');
export const groupAdminApiClient = createClient(process.env.GROUP_ADMIN_BASE_URL || '/group-admin-svc');
export const groupViewApiClient = createClient(process.env.GROUP_VIEW_BASE_URL || '/group-view-svc');

export default authApiClient;
