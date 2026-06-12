import { NextRequest, NextResponse } from 'next/server';
import { groupViewApiClient, groupAdminApiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';
import { Group } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const axiosResponse = await groupViewApiClient.get(`/groups/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = handleResponseStructure<Group>(axiosResponse.data);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch group';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const axiosResponse = await groupAdminApiClient.put(`/groups/${params.id}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = handleResponseStructure<Group>(axiosResponse.data);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update group';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
