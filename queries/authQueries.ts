/**
 * TanStack Query hooks for authentication operations
 * Manages login, logout, and token refresh mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginApi } from '@/api/authClient';
import { useAuthStore } from '@/stores/authStore';
import { LoginRequest, mapBackendErrorToMessage } from '@/types/auth';
import * as SecureStore from 'expo-secure-store';

/**
 * Custom hook for login mutation
 * Handles credentials validation, API call, token storage, and state management
 *
 * @returns useMutation hook with login mutation function
 *
 * @example
 * const { mutate, isLoading, error } = useLoginMutation();
 *
 * mutate({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const { setAccessToken, setUsername, setIsAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await loginApi(credentials);

      // Check for API errors in response
      if (!response.success) {
        const userMessage = mapBackendErrorToMessage(response.message || '');
        throw new Error(userMessage);
      }

      return {
        ...response.data,
        username: credentials.email,
      };
    },

    onSuccess: async (data) => {
      try {
        // Store tokens in secure storage
        await SecureStore.setItemAsync('accessToken', data.accessToken);

        if (data.refreshToken) {
          await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        }
      } catch (error) {
        console.error('Failed to store tokens:', error);
        throw new Error('Failed to save authentication credentials');
      }

      // Update auth store
      setAccessToken(data.accessToken);
      setUsername(data.username);
      setIsAuthenticated(true);

      // Clear query cache for fresh data after login
      queryClient.clear();
    },

    onError: (error) => {
      console.error('Login failed:', error.message);
    },

    retry: 1,
    retryDelay: 500,
  });
};

/**
 * Retrieves the stored access token from secure storage
 *
 * @returns Promise<string | null> - The access token or null if not found/error
 *
 * @example
 * const token = await getStoredAccessToken();
 * if (token) {
 *   // Use token for API requests
 * }
 */
export async function getStoredAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('accessToken');
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return null;
  }
}

/**
 * Retrieves the stored refresh token from secure storage
 *
 * @returns Promise<string | null> - The refresh token or null if not found/error
 *
 * @example
 * const refreshToken = await getStoredRefreshToken();
 */
export async function getStoredRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('refreshToken');
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
}

/**
 * Clears both access and refresh tokens from secure storage
 * Called during logout to ensure clean state
 *
 * @example
 * await clearStoredTokens();
 * useAuthStore.getState().logout();
 */
export async function clearStoredTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
}
