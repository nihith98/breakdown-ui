import { POST } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';
import * as apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');

describe('POST_/api/auth/login_validCredentials_setsAccessTokenCookie', () => {
  it('should call Java backend and set access-token cookie', async () => {
    const mockResponse = {
      data: {
        responseStatus: 'SUCCESS',
        messages: {
          informationMessages: ['Login Successful'],
          warningMessages: [],
          errorMessages: [],
        },
        payload: {
          accessToken: 'jwt-token-123',
          tokenType: 'Bearer',
          expiresIn: 900,
        },
      },
      headers: {},
    };

    (apiClient.default.post as jest.Mock).mockResolvedValue(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', password: 'password123' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(apiClient.default.post).toHaveBeenCalledWith(
      '/auth/login',
      { username: 'testuser', password: 'password123' },
      expect.objectContaining({
        headers: { 'X-Client-Platform': 'web' },
      })
    );
  });
});

describe('POST_/api/auth/login_invalidCredentials_returns401WithMessage', () => {
  it('should return 401 with error message on FAILURE', async () => {
    const mockResponse = {
      data: {
        responseStatus: 'FAILURE',
        messages: {
          informationMessages: [],
          warningMessages: [],
          errorMessages: ['Invalid username or password'],
        },
        payload: false,
      },
      headers: {},
    };

    (apiClient.default.post as jest.Mock).mockResolvedValue(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', password: 'wrongpass' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid username or password');
  });
});

describe('POST_/api/auth/login_missingFields_returns400', () => {
  it('should return 400 if username missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'password123' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 if password missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
