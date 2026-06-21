import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; txnId: string }> }
) {
  try {
    const result = await validateAndEnrichRequest(request);
    if (!result) return buildUnauthorizedResponse();

    const { id, txnId } = await params;
    const { enrichedHeaders } = result;

    const apiHost = process.env.API_HOST || 'http://localhost:8080';
    const axiosResponse = await axios.delete(
      `${apiHost}/breakdown-dashboard-svc/group/${id}/delete-transaction/${txnId}`,
      { headers: enrichedHeaders }
    );
    return NextResponse.json(axiosResponse.data);
  } catch (error: any) {
    console.error('[Transactions] Error deleting transaction:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to delete transaction' },
      { status: error.response?.status || 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; txnId: string }> }
) {
  try {
    const result = await validateAndEnrichRequest(request);
    if (!result) {
      return buildUnauthorizedResponse();
    }

    const { id, txnId } = await params;
    const { enrichedHeaders } = result;
    const body = await request.json();

    const apiHost = process.env.API_HOST || 'http://localhost:8080';
    const axiosResponse = await axios.put(
      `${apiHost}/breakdown-dashboard-svc/group/${id}/update-transaction/${txnId}`,
      body,
      { headers: enrichedHeaders }
    );
    return NextResponse.json(axiosResponse.data);
  } catch (error: any) {
    console.error('[Transactions] Error updating transaction:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to update transaction' },
      { status: error.response?.status || 400 }
    );
  }
}
