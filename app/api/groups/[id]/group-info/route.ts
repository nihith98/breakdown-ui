import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';
import { GroupInfo } from '@/types';

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
    const { enrichedHeaders } = result;

    const apiHost = process.env.API_HOST || 'http://localhost:8080';
    const axiosResponse = await axios.get(
      `${apiHost}/breakdown-dashboard-svc/group/${id}/group-information`,
      { headers: enrichedHeaders }
    );

    const body = axiosResponse.data;
    if (body?.status !== 'SUCCESS' || !body?.payload) {
      return NextResponse.json(null, { status: 404 });
    }

    const payload = body.payload;
    const groupInfo: GroupInfo = {
      groupId: payload.groupId,
      joiningCode: payload.joiningCode,
      groupName: payload.groupName,
      groupDescription: payload.groupDescription,
      createdById: payload.createdById ?? null,
      personList: (payload.personList ?? []).map((p: any) => ({
        userId: p.userId,
        displayName: p.displayName,
        familyId: p.familyId ?? null,
      })),
      familyList: payload.familyList
        ? payload.familyList.map((f: any) => ({
            familyId: f.familyId,
            familyName: f.familyName,
            memberIds: f.personIds ?? f.memberIds ?? [],
          }))
        : null,
    };

    return NextResponse.json(groupInfo);
  } catch (error: any) {
    console.error('[GroupInfo] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch group info' },
      { status: error.response?.status || 500 }
    );
  }
}
