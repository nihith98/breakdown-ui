import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call Java backend to verify token and get user info
    const response = await apiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { data } = handleResponseStructure(response.data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get current user error:', error.message);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 401 }
    );
  }
}
