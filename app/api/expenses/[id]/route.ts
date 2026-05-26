import { NextRequest, NextResponse } from 'next/server';
import { groupViewApiClient, groupAdminApiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const axiosResponse = await groupViewApiClient.get(`/expenses/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = handleResponseStructure(axiosResponse.data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Get expense ${params.id} error:`, error.message);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
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

    const axiosResponse = await groupAdminApiClient.put(`/expenses/${params.id}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = handleResponseStructure(axiosResponse.data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Update expense ${params.id} error:`, error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to update expense' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const axiosResponse = await groupAdminApiClient.delete(`/expenses/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    handleResponseStructure(axiosResponse.data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Delete expense ${params.id} error:`, error.message);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 400 }
    );
  }
}
