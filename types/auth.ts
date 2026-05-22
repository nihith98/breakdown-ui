/**
 * Authentication Type Definitions
 * Core types for user authentication, registration, and session management
 */

/**
 * User profile information
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response payload
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

/**
 * Registration response payload
 */
export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Token refresh request payload
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Token refresh response payload
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication state in the application
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Password reset request payload
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation payload
 */
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

/**
 * Password reset response
 */
export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

/**
 * Validation error response from backend
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
  statusCode: number;
}

/**
 * Generic API response wrapper for successful responses
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Union type for API responses
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Error message mapping constants
 * Maps backend error messages to user-friendly display messages
 */
export const ERROR_MESSAGE_MAP: Record<string, string> = {
  'invalid_credentials': 'Invalid username or password',
  'account_disabled': 'Your account is currently disabled',
  'service_error': 'An error occurred during authentication. Please try again.',
  'network_error': 'Network error. Please check your connection and try again.',
  'unknown_error': 'An unexpected error occurred. Please try again.',
};

/**
 * Maps backend error messages to user-friendly messages
 * Attempts to match backend message against known patterns
 * Falls back to unknown_error if no match found
 *
 * @param backendMessage - The error message from backend
 * @returns User-friendly error message from ERROR_MESSAGE_MAP
 */
export function mapBackendErrorToMessage(backendMessage: string): string {
  const lowerMessage = backendMessage.toLowerCase();

  // Check for exact key match first
  for (const [code] of Object.entries(ERROR_MESSAGE_MAP)) {
    if (lowerMessage.includes(code)) {
      return ERROR_MESSAGE_MAP[code];
    }
  }

  // Check for pattern matches
  if (lowerMessage.includes('invalid') || lowerMessage.includes('incorrect')) {
    return ERROR_MESSAGE_MAP.invalid_credentials;
  }

  if (lowerMessage.includes('disabled') || lowerMessage.includes('suspended')) {
    return ERROR_MESSAGE_MAP.account_disabled;
  }

  if (lowerMessage.includes('service') || lowerMessage.includes('unavailable')) {
    return ERROR_MESSAGE_MAP.service_error;
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return ERROR_MESSAGE_MAP.network_error;
  }

  return ERROR_MESSAGE_MAP.unknown_error;
}
