import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Group, GroupInfo, Transaction } from '@/types';
import { GroupDetailClient } from '@/components/dashboard/GroupDetailClient';
import styles from './group-detail.module.css';

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

async function fetchGroup(id: string): Promise<Group | null> {
  try {
    const res = await serverFetch(`/api/groups/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
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

async function fetchGroupInfo(id: string): Promise<GroupInfo | null> {
  try {
    const res = await serverFetch(`/api/groups/${id}/group-info`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function GroupDetailPage({ params }: Props) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  const [group, { transactions, memberMap }, groupInfo] = await Promise.all([
    fetchGroup(id),
    fetchTransactions(id),
    fetchGroupInfo(id),
  ]);

  if (!group && transactions.length === 0) {
    return (
      <div className={styles.mainInner}>
        <p className={styles.notFound}>// Group not found</p>
      </div>
    );
  }

  const resolvedGroup: Group = group ?? {
    id,
    name: `Group ${id.slice(0, 8)}…`,
    members: [],
    createdAt: '',
    updatedAt: '',
  };

  return (
    <div className={styles.mainInner}>
      <GroupDetailClient
        group={resolvedGroup}
        transactions={transactions}
        memberMap={memberMap}
        groupInfo={groupInfo}
        currentUser={currentUser.username}
        displayName={currentUser.displayName}
      />
    </div>
  );
}
