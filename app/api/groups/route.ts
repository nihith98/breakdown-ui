import { NextRequest, NextResponse } from 'next/server';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';
import { groupViewApiClient } from '@/lib/api-client';
import axios from 'axios';
import { handleResponseStructure, handleAuthResponseStructure } from '@/lib/response-handler';

export async function GET(request: NextRequest) {
  try {
    // Validate JWT and get enriched headers
    const result = await validateAndEnrichRequest(request);
    if (!result) {
      return buildUnauthorizedResponse();
    }

    const { enrichedHeaders, user } = result;

    console.log(`[Groups] Fetching groups for user: ${user.username}`);

    const apiHost = process.env.API_HOST || 'http://localhost:8080';
    const axiosResponse = await axios.get(
      `${apiHost}/breakdown-dashboard-svc/group/list`,
      { headers: enrichedHeaders }
    );

    console.log(`[Groups] List response:`, axiosResponse.data);

    // Handle the new response format: { status: 'SUCCESS', payload: { groups: [...], ... } }
    if (axiosResponse.data?.status === 'SUCCESS' && axiosResponse.data?.payload?.groups) {
      const groups = axiosResponse.data.payload.groups.map((group: any) => ({
        id: group.groupId,
        name: group.groupName,
        memberCount: group.memberCount,
        expenseCount: group.transactionCount || 0,
        net: group.settlementAmount !== null && group.settlementAmount !== undefined
          ? parseFloat(group.settlementAmount.toFixed(2))
          : 0,
        lastTransactionTime: group.lastUpdatedTimestamp ? new Date(group.lastUpdatedTimestamp).toISOString() : null,
      }));
      return NextResponse.json(groups);
    }

    throw new Error('Invalid response format from group list API');
  } catch (error: any) {
    console.error('[Groups] Error fetching groups:', error.message);
    console.error('[Groups] Error status:', error.response?.status);
    if (error.response?.data) {
      console.error('[Groups] Backend response:', JSON.stringify(error.response.data));
    }
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
    const payload = await request.json();

    console.log(`[Groups] Creating group for user: ${user.username}`);

    const apiHost = process.env.API_HOST || 'http://localhost:8080';
    const axiosResponse = await axios.post(
      `${apiHost}/breakdown-dashboard-svc/admin/group/create`,
      payload,
      { headers: enrichedHeaders }
    );

    const data = handleAuthResponseStructure(axiosResponse.data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Groups] Error creating group:', error.message);
    console.error('[Groups] Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to create group' },
      { status: 400 }
    );
  }
}
