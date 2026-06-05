import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { handleResponseStructure } from '@/lib/response-handler';
import { DashboardSummary } from '@/types';

const API_HOST = process.env.API_HOST || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access-token')?.value;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(
      `${API_HOST}/dashboard/summary`,
      { headers }
    );

    const data = handleResponseStructure<DashboardSummary>(response.data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard API error:', error);
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
