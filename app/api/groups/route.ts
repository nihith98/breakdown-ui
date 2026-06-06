import { NextRequest, NextResponse } from 'next/server';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';
import { groupViewApiClient, groupAdminApiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function GET(request: NextRequest) {
  try {
    // Validate JWT and get enriched headers
    const result = await validateAndEnrichRequest(request);
    if (!result) {
      return buildUnauthorizedResponse();
    }

    const { enrichedHeaders, user } = result;

    console.log(`[Groups] Fetching groups for user: ${user.username}`);

    const axiosResponse = await groupViewApiClient.get('/groups', { headers: enrichedHeaders });
    const data = handleResponseStructure(axiosResponse.data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Groups] Error fetching groups:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate JWT and get enriched headers
    const result = await validateAndEnrichRequest(request);
    if (!result) {
      return buildUnauthorizedResponse();
    }

    const { enrichedHeaders, user } = result;
    const body = await request.json();

    console.log(`[Groups] Creating group for user: ${user.username}`);

    const axiosResponse = await groupAdminApiClient.post('/groups', body, { headers: enrichedHeaders });
    const data = handleResponseStructure(axiosResponse.data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Groups] Error creating group:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create group' },
      { status: 400 }
    );
  }
}
