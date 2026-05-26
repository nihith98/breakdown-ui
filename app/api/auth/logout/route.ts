import { NextRequest, NextResponse } from 'next/server';
import { authApiClient } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh-token')?.value;

  try {
    await authApiClient.post(
      '/auth/logout',
      refreshToken ? { refreshToken } : {}
    );
  } catch {
    // Logout is always successful per spec, even if backend fails
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set('access-token', '', { maxAge: 0, path: '/' });
  res.cookies.set('refresh-token', '', { maxAge: 0, path: '/' });

  return res;
}
