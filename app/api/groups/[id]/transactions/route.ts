import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { validateAndEnrichRequest, buildUnauthorizedResponse } from '@/lib/auth-middleware';
import { InsertTransactionInput, Transaction } from '@/types';

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
      `${apiHost}/breakdown-dashboard-svc/group/${id}/transaction-list`,
      { headers: enrichedHeaders }
    );

    const body = axiosResponse.data;
    if (body?.status !== 'SUCCESS' || !body?.payload) {
      return NextResponse.json([]);
    }

    const transactions: Transaction[] = (body.payload.transactionList ?? []).map((t: any) => ({
      transactionId: t.uuid ?? t.transactionId,
      transactionName: t.transactionName,
      transactionDescription: t.transactionDescription,
      transactionType: t.transactionType,
      amount: t.amount,
      paidById: t.paidById,
      paidByName: t.paidByName ?? undefined,
      paidForList: (t.paidForList ?? []).map((pf: any) => ({
        paidForId: pf.paidForId,
        paidForValue: pf.paidForValue,
        paidForName: pf.paidForName ?? undefined,
      })),
      splitType: t.splitType,
      timestamp: t.timestamp ?? null,
      groupId: t.groupId,
      transactionStatus: t.transactionStatus,
    }));

    const memberMap: Record<string, string> = body.payload.memberMap ?? {};

    return NextResponse.json({ transactions, memberMap });
  } catch (error: any) {
    console.error('[Transactions] Error:', error.message);
    if (error.response?.data) {
      console.error('[Transactions] Backend response:', JSON.stringify(error.response.data));
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(
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
    const body: InsertTransactionInput = await request.json();

    const apiHost = process.env.API_HOST || 'http://localhost:8080';
    const axiosResponse = await axios.post(
      `${apiHost}/breakdown-dashboard-svc/group/${id}/insert-transaction`,
      body,
      { headers: enrichedHeaders }
    );
    return NextResponse.json(axiosResponse.data);
  } catch (error: any) {
    console.error('[Transactions] Error inserting transaction:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to insert transaction' },
      { status: error.response?.status || 400 }
    );
  }
}
