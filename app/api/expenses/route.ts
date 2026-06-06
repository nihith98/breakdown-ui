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
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    const url = groupId
      ? `/groups/${groupId}/expenses`
      : '/expenses';

    console.log(`[Expenses] Fetching expenses for user: ${user.username}`);

    const axiosResponse = await groupViewApiClient.get(url, { headers: enrichedHeaders });
    const data = handleResponseStructure(axiosResponse.data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Expenses] Error fetching expenses:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
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
    const { groupId, ...expenseData } = body;

    const url = groupId
      ? `/groups/${groupId}/expenses`
      : '/expenses';

    console.log(`[Expenses] Creating expense for user: ${user.username}`);

    const axiosResponse = await groupAdminApiClient.post(url, expenseData, { headers: enrichedHeaders });
    const data = handleResponseStructure(axiosResponse.data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Expenses] Error creating expense:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create expense' },
      { status: 400 }
    );
  }
}
