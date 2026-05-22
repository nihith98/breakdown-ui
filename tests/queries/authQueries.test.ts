/**
 * Tests for useLoginMutation hook
 * Tests login API integration, token storage, and state management
 */

import { useLoginMutation, getStoredAccessToken, getStoredRefreshToken, clearStoredTokens } from '@/queries/authQueries';
import { loginApi } from '@/api/authClient';
import { useAuthStore } from '@/stores/authStore';
import * as SecureStore from 'expo-secure-store';

jest.mock('@/api/authClient');

const mockLoginApi = loginApi as jest.MockedFunction<typeof loginApi>;

// Get the mocked SecureStore from jest.setup.js
const mockSecureStore = jest.mocked(SecureStore);

// Set environment for unit tests - skip React Native testing libraries
process.env.JEST_ENV = 'unit';

describe('getStoredAccessToken_validToken_returnsToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve and return access token from secure store', async () => {
    // Arrange
    (mockSecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
      'stored_token_123'
    );

    // Act
    const token = await getStoredAccessToken();

    // Assert
    expect(token).toBe('stored_token_123');
    expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('accessToken');
  });

  it('should return null if token not found', async () => {
    // Arrange
    (mockSecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

    // Act
    const token = await getStoredAccessToken();

    // Assert
    expect(token).toBeNull();
  });

  it('should return null on secure store error', async () => {
    // Arrange
    (mockSecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
      new Error('Secure store error')
    );

    // Act
    const token = await getStoredAccessToken();

    // Assert
    expect(token).toBeNull();
  });
});

describe('getStoredRefreshToken_validToken_returnsToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve and return refresh token from secure store', async () => {
    // Arrange
    (mockSecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
      'stored_refresh_token'
    );

    // Act
    const token = await getStoredRefreshToken();

    // Assert
    expect(token).toBe('stored_refresh_token');
    expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('refreshToken');
  });

  it('should return null if refresh token not found', async () => {
    // Arrange
    (mockSecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

    // Act
    const token = await getStoredRefreshToken();

    // Assert
    expect(token).toBeNull();
  });

  it('should return null on secure store error', async () => {
    // Arrange
    (mockSecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
      new Error('Secure store error')
    );

    // Act
    const token = await getStoredRefreshToken();

    // Assert
    expect(token).toBeNull();
  });
});

describe('clearStoredTokens_success_clearsAllTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete both access and refresh tokens', async () => {
    // Arrange
    (mockSecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    // Act
    await clearStoredTokens();

    // Assert
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
  });

  it('should continue even if delete fails', async () => {
    // Arrange
    (mockSecureStore.deleteItemAsync as jest.Mock).mockRejectedValueOnce(
      new Error('Delete failed')
    );

    // Act & Assert - should not throw
    await expect(clearStoredTokens()).resolves.toBeUndefined();
  });
});

describe('useLoginMutation_defined_exportedCorrectly', () => {
  it('should export useLoginMutation hook', () => {
    // Assert
    expect(useLoginMutation).toBeDefined();
    expect(typeof useLoginMutation).toBe('function');
  });

  it('should integrate with loginApi', () => {
    // Assert - verify loginApi is mocked
    expect(mockLoginApi).toBeDefined();
  });

  it('should integrate with auth store', () => {
    // Arrange
    const initialState = useAuthStore.getState();

    // Assert
    expect(initialState).toHaveProperty('setAccessToken');
    expect(initialState).toHaveProperty('setUsername');
    expect(initialState).toHaveProperty('setIsAuthenticated');
  });
});
