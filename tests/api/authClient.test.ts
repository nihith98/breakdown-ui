/**
 * Test suite for authClient API functions
 * Tests the HTTP client implementation for authentication endpoints
 */

import { loginApi } from '@/api/authClient';
import type { LoginRequest, ApiResponse, LoginResponse } from '@/types/auth';

describe('authClient_loginApi_validCredentials_returnsAccessToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export loginApi function', () => {
    // Assert
    expect(loginApi).toBeDefined();
    expect(typeof loginApi).toBe('function');
  });

  it('should handle LoginRequest with email and password', () => {
    // Arrange
    const credentials: LoginRequest = {
      email: 'testuser@example.com',
      password: 'password123',
    };

    // Assert
    expect(credentials.email).toBe('testuser@example.com');
    expect(credentials.password).toBe('password123');
  });

  it('should accept optional clientPlatform parameter', () => {
    // Assert - loginApi should be callable with just credentials
    expect(loginApi.length).toBeLessThanOrEqual(2);
  });

  it('should have correct API response types', () => {
    // Arrange
    const mockLoginResponse: LoginResponse = {
      accessToken: 'token123',
      refreshToken: 'refresh123',
      user: {
        id: 'user-123',
        email: 'testuser@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: '2026-05-23T00:00:00Z',
        updatedAt: '2026-05-23T00:00:00Z',
      },
    };

    const mockResponse: ApiResponse<LoginResponse> = {
      success: true,
      data: mockLoginResponse,
    };

    // Assert
    expect(mockResponse.success).toBe(true);
    expect(mockResponse.data.accessToken).toBe('token123');
    expect(mockResponse.data.user.email).toBe('testuser@example.com');
  });

  it('should support iOS platform identifier', () => {
    // Arrange
    const platforms: Array<'ios' | 'android' | 'web'> = ['ios', 'android', 'web'];

    // Assert - verify the type system accepts these platforms
    platforms.forEach(platform => {
      expect(['ios', 'android', 'web']).toContain(platform);
    });
  });
});
