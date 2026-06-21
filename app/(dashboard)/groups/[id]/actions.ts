'use server';

import { cookies, headers } from 'next/headers';
import { groupAdminApiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';
import { InsertTransactionInput, InsertSettlementInput, ManageFamiliesInput } from '@/types';

export async function addExpense(
  groupId: string,
  input: {
    description: string;
    amount: number;
    paidBy: string;
    splitBetween: string[];
  }
) {
  try {
    const axiosResponse = await groupAdminApiClient.post(`/groups/${groupId}/expenses`, input);
    return handleResponseStructure(axiosResponse.data);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add expense');
  }
}

/**
 * Forwards a request to this app's own `/api/groups/...` middleware route, carrying the
 * caller's auth cookie. Used instead of calling the Java backend directly so the request
 * passes through `validateAndEnrichRequest` the same way browser-initiated fetches do.
 */
async function serverFetch(path: string, init?: RequestInit): Promise<Response> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const host = headerStore.get('host') ?? 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return fetch(`${protocol}://${host}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), cookie: cookieStore.toString() },
    cache: 'no-store',
  });
}

export async function insertTransaction(
  groupId: string,
  input: InsertTransactionInput
): Promise<void> {
  const res = await serverFetch(`/api/groups/${groupId}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to insert transaction');
}

export async function updateTransaction(
  groupId: string,
  txnId: string,
  input: InsertTransactionInput
): Promise<void> {
  const res = await serverFetch(`/api/groups/${groupId}/transactions/${txnId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update transaction');
}

export async function removeMember(groupId: string, userId: string): Promise<void> {
  const res = await serverFetch(`/api/groups/${groupId}/members/${userId}`, { method: 'DELETE' });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || 'Failed to remove member');
  if (body?.status === 'FAILURE') {
    const errorMessage = body?.messages?.errorMessages?.[0] || 'Failed to remove member';
    throw new Error(errorMessage);
  }
}

export async function settleUp(groupId: string, settlementUuid: string): Promise<void> {
  throw new Error('settleUp endpoint not yet implemented');
}

export async function deleteTransaction(
  groupId: string,
  transactionId: string
): Promise<void> {
  const res = await serverFetch(`/api/groups/${groupId}/transactions/${transactionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete transaction');
}

export async function createSettlement(
  groupId: string,
  input: InsertSettlementInput
): Promise<void> {
  const res = await serverFetch(`/api/groups/${groupId}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create settlement');
}

export async function manageFamilies(
  groupId: string,
  input: ManageFamiliesInput
): Promise<void> {
  const res = await serverFetch(`/api/groups/${groupId}/families`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to manage families');
}
