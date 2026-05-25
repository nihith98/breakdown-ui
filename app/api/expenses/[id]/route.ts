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

    const axiosResponse = await apiClient.get(`/expenses/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { data } = handleResponseStructure(axiosResponse.data);
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
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const axiosResponse = await apiClient.put(`/expenses/${params.id}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { data } = handleResponseStructure(axiosResponse.data);
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
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const axiosResponse = await apiClient.delete(`/expenses/${params.id}`, {
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
