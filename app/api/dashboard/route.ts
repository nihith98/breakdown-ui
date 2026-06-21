import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';

const API_HOST = process.env.API_HOST || 'http://localhost:8080';

const EMPTY_SUMMARY = {
  displayName: 'User',
  youOwe: 0,
  owedToYou: 0,
  net: 0,
  recentGroups: [],
  recentFamilies: [],
};

export async function GET(request: NextRequest) {
  try {
    const result = await validateAndEnrichRequest(request);
    if (!result) {
      return buildUnauthorizedResponse();
    }

    const { enrichedHeaders, user } = result;

    console.log(`[Dashboard] Fetching summary for user: ${user.username}`);

    const axiosResponse = await axios.get(
      `${API_HOST}/breakdown-dashboard-svc/dashboard/summary`,
      { headers: enrichedHeaders }
    );

    const body = axiosResponse.data;
    if (body?.status === 'SUCCESS' && body?.payload) {
      return NextResponse.json(body.payload);
    }

    console.error('[Dashboard] Unexpected response shape:', JSON.stringify(body));
    return NextResponse.json(EMPTY_SUMMARY);
  } catch (error) {
    console.error('[Dashboard] Error fetching summary:', error);
    return NextResponse.json(EMPTY_SUMMARY);
  }
}
