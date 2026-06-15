export async function loginUser(username: string, password: string): Promise<void> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error ?? 'Login failed');
  }

  // Store token expiry hint in localStorage for the client-side refresh interceptor.
  // Browser JS cannot read Set-Cookie headers, so we derive expiry from current time.
  // The access token lifetime is 15 minutes (900s), matching the server cookie maxAge.
  const expiryTime = Math.floor(Date.now() / 1000) + 900;
  if (typeof window !== 'undefined') {
    localStorage.setItem('token_expiry', expiryTime.toString());
  }
}

export async function registerUser(username: string, password: string, displayName?: string): Promise<void> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, displayName }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error ?? 'Registration failed');
  }
}

export async function logoutUser(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error ?? 'Logout failed');
  }
}

export async function refreshToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Platform': 'web',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      console.warn('Token refresh failed:', data.error);
      // Clear token expiry on failure
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token_expiry');
      }
      return null;
    }

    const data = await response.json();
    const accessToken = data.accessToken;

    if (accessToken) {
      // Update token expiry time in localStorage
      // New token is valid for 15 minutes (900 seconds)
      const expiryTime = Math.floor(Date.now() / 1000) + 900;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token_expiry', expiryTime.toString());
      }
    }

    return accessToken;
  } catch (error) {
    console.error('Token refresh error:', error);
    // Clear token expiry on error
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token_expiry');
    }
    return null;
  }
}

function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Convert URL-safe base64 to standard base64
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }

    const decoded = JSON.parse(Buffer.from(base64, 'base64').toString());
    return decoded;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;

    if (!token) return null;

    const decoded = decodeToken(token);
    if (!decoded) return null;

    const displayName = (decoded.displayName as string) || (decoded.username as string) || 'User';
    const username = (decoded.sub as string) || (decoded.username as string);

    return {
      displayName,
      username,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
