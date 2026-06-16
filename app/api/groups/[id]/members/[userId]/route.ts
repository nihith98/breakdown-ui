import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const result = await validateAndEnrichRequest(request);
    if (!result) {
      return buildUnauthorizedResponse();
    }

    const { id, userId } = await params;
    const { enrichedHeaders } = result;

    const apiHost = process.env.API_HOST || 'http://localhost:8080';
    const axiosResponse = await axios.delete(
      `${apiHost}/breakdown-dashboard-svc/admin/group/${id}/remove-member/${userId}`,
      { headers: enrichedHeaders }
    );
    return NextResponse.json(axiosResponse.data);
  } catch (error: any) {
    console.error('[Members] Error removing member:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to remove member' },
      { status: error.response?.status || 400 }
    );
  }
}
