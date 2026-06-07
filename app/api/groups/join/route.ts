import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAuthResponseStructure } from '@/lib/response-handler';

export async function POST(request: NextRequest) {
  try {
    // Validate JWT and get enriched headers
    const result = await validateAndEnrichRequest(request);
    if (!result) {
      return buildUnauthorizedResponse();
    }

    const { enrichedHeaders, user } = result;
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'A group code is required.' }, { status: 400 });
    }

    console.log(`[Groups] Joining group with code for user: ${user.username}`);
    console.log(`[Groups] Request payload:`, { joiningCode: code.trim().toLowerCase() });

    const apiHost = process.env.API_HOST || 'http://localhost:8080';
    const axiosResponse = await axios.post(
      `${apiHost}/breakdown-dashboard-svc/admin/group/join`,
      { joiningCode: code.trim().toLowerCase() },
      { headers: enrichedHeaders }
    );

    console.log(`[Groups] Join response:`, axiosResponse.data);
    const payload = handleAuthResponseStructure(axiosResponse.data);
    return NextResponse.json({
      data: null,
      groupId: payload?.groupId || '',
      groupName: payload?.groupName || 'Group',
    });
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error ||
                        error?.response?.data?.message ||
                        error?.message ||
                        'No group matches that code.';
    const statusCode = error?.response?.status || 400;

    console.error('[Groups] Error joining group:', errorMessage);
    console.error('[Groups] Error status:', statusCode);
    if (error?.response?.data) {
      console.error('[Groups] Backend response:', JSON.stringify(error.response.data));
    }

    return NextResponse.json(
      { error: String(errorMessage) },
      { status: statusCode },
    );
  }
}
