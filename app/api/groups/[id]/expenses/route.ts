import { NextRequest, NextResponse } from 'next/server';
import { groupViewApiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';
import { Expense } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = request.cookies.get('access-token')?.value;
    const response = await groupViewApiClient.get(`/groups/${params.id}/expenses`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const expenses = handleResponseStructure<Expense[]>(response.data);
    return NextResponse.json(expenses ?? []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch expenses';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
