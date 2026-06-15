import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';
import { Group } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await validateAndEnrichRequest(request);
    if (!result) {
      return buildUnauthorizedResponse();
    }

    const { id } = await params;
    const { enrichedHeaders, user } = result;

    const apiHost = process.env.API_HOST || 'http://localhost:8080';
    const axiosResponse = await axios.get(
      `${apiHost}/breakdown-dashboard-svc/group/list`,
      { headers: enrichedHeaders }
    );

    const body = axiosResponse.data;
    if (body?.status !== 'SUCCESS' || !body?.payload?.groups) {
      return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
    }

    const match = body.payload.groups.find((g: any) => g.groupId === id);
    if (!match) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const group: Group = {
      id: match.groupId,
      name: match.groupName,
      members: [],
      createdAt: '',
      updatedAt: '',
    };

    return NextResponse.json(group);
  } catch (error: any) {
    console.error('[Group] Error fetching group:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch group' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await validateAndEnrichRequest(request);
    if (!result) {
      return buildUnauthorizedResponse();
    }

    const { id } = await params;
    const { enrichedHeaders } = result;
    const body = await request.json();

    const apiHost = process.env.API_HOST || 'http://localhost:8080';
    const axiosResponse = await axios.put(
      `${apiHost}/breakdown-dashboard-svc/admin/group/${id}`,
      body,
      { headers: enrichedHeaders }
    );

    return NextResponse.json(axiosResponse.data);
  } catch (error: any) {
    console.error('[Group] Error updating group:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to update group' },
      { status: error.response?.status || 400 }
    );
  }
}
