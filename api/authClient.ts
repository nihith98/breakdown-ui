import axios, { AxiosInstance } from 'axios';
import { LoginRequest, LoginResponse, ApiResponse } from '@/types/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

// Create the API client with base configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Log in with email and password
 * @param credentials - User login credentials (email and password)
 * @param clientPlatform - Optional platform identifier (ios, android, web)
 * @returns Promise with login response containing access token and user info
 */
export async function loginApi(
  credentials: LoginRequest,
  clientPlatform?: 'ios' | 'android' | 'web'
): Promise<ApiResponse<LoginResponse>> {
  const headers: Record<string, string> = {};

  if (clientPlatform) {
    headers['X-Client-Platform'] = clientPlatform;
  }

  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    credentials,
    { headers }
  );

  return response.data;
}

export default apiClient;
