import { NextRequest, NextResponse } from 'next/server';
import { groupViewApiClient, groupAdminApiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const axiosResponse = await groupViewApiClient.get('/groups', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = handleResponseStructure(axiosResponse.data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get groups error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const axiosResponse = await groupAdminApiClient.post('/groups', body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = handleResponseStructure(axiosResponse.data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Create group error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create group' },
      { status: 400 }
    );
  }
}
