import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await validateAndEnrichRequest(request);
    if (!result) return buildUnauthorizedResponse();

    const { id } = await params;
    const { enrichedHeaders } = result;
    const body = await request.json();

    const apiHost = process.env.API_HOST || 'http://localhost:8080';
    const axiosResponse = await axios.post(
      `${apiHost}/breakdown-dashboard-svc/admin/group/${id}/manage-families`,
      body,
      { headers: enrichedHeaders }
    );

    return NextResponse.json(axiosResponse.data);
  } catch (error: any) {
    console.error('[Families] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to manage families' },
      { status: error.response?.status || 500 }
    );
  }
}
