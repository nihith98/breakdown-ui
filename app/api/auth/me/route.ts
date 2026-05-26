import { NextRequest, NextResponse } from 'next/server';
import { authApiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await authApiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = handleResponseStructure(response.data);
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Get current user error:', error.message);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 401 }
    );
  }
}
