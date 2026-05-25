import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await apiClient.get(`/groups/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { data } = handleResponseStructure(response);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Get group ${params.id} error:`, error.message);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await apiClient.put(`/groups/${params.id}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { data } = handleResponseStructure(response);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Update group ${params.id} error:`, error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to update group' },
      { status: 400 }
    );
  }
}
