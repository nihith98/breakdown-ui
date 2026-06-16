import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';
import { SettlementTransaction } from '@/types';

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
      `${apiHost}/breakdown-dashboard-svc/group/${id}/settlement-list`,
      { headers: enrichedHeaders }
    );

    const body = axiosResponse.data;
    if (body?.status !== 'SUCCESS' || !body?.payload) {
      return NextResponse.json({ groupId: id, settlementList: [], memberMap: {} });
    }

    const settlementList: SettlementTransaction[] = (body.payload.settlementList ?? []).map((s: any) => ({
      uuid: s.uuid,
      transactionType: 'SETTLEMENT',
      paidById: s.paidById,
      paidByName: s.paidByName ?? null,
      paidForList: (s.paidForList ?? []).map((pf: any) => ({
        paidForId: pf.paidForId,
        paidForValue: pf.paidForValue,
        paidForName: pf.paidForName ?? null,
      })),
      transactionStatus: s.transactionStatus,
      groupId: s.groupId,
      familyId: s.familyId ?? null,
    }));

    return NextResponse.json({
      groupId: id,
      settlementList,
      memberMap: body.payload.memberMap ?? {},
    });
  } catch (error: any) {
    console.error('[Settlements] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settlements' },
      { status: error.response?.status || 500 }
    );
  }
}
