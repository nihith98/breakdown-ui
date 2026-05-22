import { useAuthStore } from '@/stores/authStore';

describe('useAuthStore_setAccessToken_updatesState', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      username: null,
      isAuthenticated: false,
    });
  });

  it('should set access token and mark as authenticated', () => {
    useAuthStore.getState().setAccessToken('token123');

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('token123');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should set username', () => {
    useAuthStore.getState().setUsername('testuser');

    const state = useAuthStore.getState();
    expect(state.username).toBe('testuser');
  });

  it('should logout and clear state', () => {
    useAuthStore.getState().setAccessToken('token123');
    useAuthStore.getState().setUsername('testuser');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.username).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
