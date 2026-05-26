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

export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    return null;
  }
}
