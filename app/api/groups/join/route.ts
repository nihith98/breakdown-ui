import { NextRequest, NextResponse } from 'next/server';
import { groupAdminApiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'A group code is required.' }, { status: 400 });
    }

    const axiosResponse = await groupAdminApiClient.post(
      '/groups/join',
      { code: code.trim().toUpperCase() },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const data = handleResponseStructure(axiosResponse.data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Join group error:', error.message);
    return NextResponse.json(
      { error: error.message || 'No group matches that code.' },
      { status: 400 },
    );
  }
}
