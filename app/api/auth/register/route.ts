import { NextRequest, NextResponse } from 'next/server';
import { registrationApiClient, authApiClient } from '@/lib/api-client';
import { handleResponseStructure, handleAuthResponseStructure } from '@/lib/response-handler';
import type { AuthResponseStructure, LoginPayload } from '@/types';

function parseRefreshTokenFromCookieHeader(setCookieHeaders: string | string[] | undefined): string | null {
  if (!setCookieHeaders) return null;

  const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

  for (const header of headers) {
    if (header.includes('refresh_token=')) {
      const match = header.match(/refresh_token=([^;]+)/);
      if (match?.[1]) {
        return match[1];
      }
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, displayName } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    const response = await registrationApiClient.post('/registration/register', {
      username,
      password,
      ...(displayName && { displayName }),
    });

    const user = handleResponseStructure(response.data);

    // Auto-login after registration
    const loginResponse = await authApiClient.post(
      '/auth/login',
      { userId: username, password },
      { headers: { 'X-Client-Platform': 'web' } }
    );

    const loginData: AuthResponseStructure<LoginPayload> = loginResponse.data;

    if (loginData.responseStatus === 'FAILURE') {
      const msg = loginData.messages.errorMessages?.[0] ?? 'Login failed';
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    // Extract access token from payload
    const accessToken = (loginData.payload as LoginPayload).accessToken;

    // Extract refresh_token from Java's Set-Cookie header
    const setCookieHeader = loginResponse.headers['set-cookie'];
    const refreshToken = parseRefreshTokenFromCookieHeader(setCookieHeader);

    const res = NextResponse.json({ success: true, user });

    res.cookies.set('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900,
      path: '/',
    });

    if (refreshToken) {
      res.cookies.set('refresh-token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 90,
        path: '/',
      });
    }

    return res;
  } catch (error: any) {
    console.error('Register error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
