import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleResponseStructure } from '@/lib/response-handler';
import { DashboardSummary } from '@/types';

const API_HOST = process.env.API_HOST || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    // Validate JWT and get enriched headers
    const result = await validateAndEnrichRequest(request);
    if (!result) {
      return buildUnauthorizedResponse();
    }

    const { enrichedHeaders, user } = result;

    console.log(`[Dashboard] Fetching summary for user: ${user.username}`);

    const response = await axios.get(
      `${API_HOST}/dashboard/summary`,
      { headers: enrichedHeaders }
    );

    const data = handleResponseStructure<DashboardSummary>(response.data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Dashboard] Error fetching summary:', error);
    return NextResponse.json(
      {
        displayName: 'User',
        youOwe: 0,
        owedToYou: 0,
        net: 0,
        recentGroups: [],
        recentFamilies: [],
      }
    );
  }
}
