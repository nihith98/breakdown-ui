import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { SettlementListResponse, Transaction } from '@/types';
import { BalancesPage } from '@/components/dashboard/BalancesPage';

interface Props {
  params: Promise<{ id: string }>;
}

async function serverFetch(path: string): Promise<Response> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const host = headerStore.get('host') ?? 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const cookie = cookieStore.toString();
  return fetch(`${protocol}://${host}${path}`, {
    headers: { cookie },
    cache: 'no-store',
  });
}

async function fetchSettlements(id: string): Promise<SettlementListResponse> {
  try {
    const res = await serverFetch(`/api/groups/${id}/settlements`);
    if (!res.ok) return { groupId: id, settlementList: [], memberMap: {} };
    return await res.json();
  } catch {
    return { groupId: id, settlementList: [], memberMap: {} };
  }
}

async function fetchTransactions(id: string): Promise<{ transactions: Transaction[]; memberMap: Record<string, string> }> {
  try {
    const res = await serverFetch(`/api/groups/${id}/transactions`);
    if (!res.ok) return { transactions: [], memberMap: {} };
    const data = await res.json();
    return {
      transactions: Array.isArray(data.transactions) ? data.transactions : [],
      memberMap: data.memberMap ?? {},
    };
  } catch {
    return { transactions: [], memberMap: {} };
  }
}

export default async function GroupBalancesPage({ params }: Props) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  const [settlements, { transactions, memberMap: txnMemberMap }] = await Promise.all([
    fetchSettlements(id),
    fetchTransactions(id),
  ]);

  const memberMap = { ...txnMemberMap, ...settlements.memberMap };

  return (
    <BalancesPage
      groupId={id}
      settlementList={settlements.settlementList}
      memberMap={memberMap}
      transactions={transactions}
      currentUserId={currentUser.username}
    />
  );
}
