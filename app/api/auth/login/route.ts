import { NextRequest, NextResponse } from 'next/server';
import { authApiClient } from '@/lib/api-client';
import { handleAuthResponseStructure } from '@/lib/response-handler';
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
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Call Java backend with X-Client-Platform: web
    const response = await authApiClient.post(
      '/auth/login',
      { userId: username, password },
      { headers: { 'X-Client-Platform': 'web' } }
    );

    const data: AuthResponseStructure<LoginPayload> = response.data;

    if (data.responseStatus === 'FAILURE') {
      const msg = data.messages.errorMessages?.[0] ?? 'Login failed';
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    // Extract access token from payload
    const accessToken = (data.payload as LoginPayload).accessToken;

    // Extract refresh_token from Java's Set-Cookie header and re-set it
    const setCookieHeader = response.headers['set-cookie'];
    const refreshToken = parseRefreshTokenFromCookieHeader(setCookieHeader);

    const res = NextResponse.json({ success: true });

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
    console.error('Login error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 400 }
    );
  }
}
