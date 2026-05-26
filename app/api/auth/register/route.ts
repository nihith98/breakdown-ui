import { NextRequest, NextResponse } from 'next/server';
import { registrationApiClient } from '@/lib/api-client';
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

    const response = await registrationApiClient.post('/auth/register', {
      username,
      password,
    });

    const user = handleResponseStructure(response.data);
    const res = NextResponse.json({ success: true, user });

    return res;
  } catch (error: any) {
    console.error('Register error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
