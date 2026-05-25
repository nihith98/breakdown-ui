import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

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

    // Call Java backend
    const response = await apiClient.post('/auth/register', {
      username,
      password,
    });

    const { data } = handleResponseStructure(response.data);

    // Create response with HTTP-only cookie
    const res = NextResponse.json({ success: true, user: data });
    res.cookies.set('auth-token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    console.error('Register error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
