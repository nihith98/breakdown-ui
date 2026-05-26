import { NextRequest, NextResponse } from 'next/server';
import { groupViewApiClient, groupAdminApiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    const url = groupId
      ? `/groups/${groupId}/expenses`
      : '/expenses';

    const axiosResponse = await groupViewApiClient.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = handleResponseStructure(axiosResponse.data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get expenses error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
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
    const { groupId, ...expenseData } = body;

    const url = groupId
      ? `/groups/${groupId}/expenses`
      : '/expenses';

    const axiosResponse = await groupAdminApiClient.post(url, expenseData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = handleResponseStructure(axiosResponse.data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Create expense error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create expense' },
      { status: 400 }
    );
  }
}
