import { NextRequest, NextResponse } from 'next/server';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';
import { groupAdminApiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

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

    const axiosResponse = await groupAdminApiClient.post(
      '/groups/join',
      { code: code.trim().toUpperCase() },
      { headers: enrichedHeaders },
    );

    const data = handleResponseStructure(axiosResponse.data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Groups] Error joining group:', error.message);
    return NextResponse.json(
      { error: error.message || 'No group matches that code.' },
      { status: 400 },
    );
  }
}
