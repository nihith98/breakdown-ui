import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { groupViewApiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';
import { Group, Expense } from '@/types';
import { GroupHeader } from '@/components/dashboard/GroupHeader';
import { TransactionList } from '@/components/dashboard/TransactionList';
import styles from './group-detail.module.css';

interface Props {
  params: { id: string };
}

async function fetchGroup(id: string, token: string | undefined): Promise<Group | null> {
  try {
    const res = await groupViewApiClient.get(`/groups/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return handleResponseStructure<Group>(res.data);
  } catch {
    return null;
  }
}

async function fetchExpenses(groupId: string, token: string | undefined): Promise<Expense[]> {
  try {
    const res = await groupViewApiClient.get(`/groups/${groupId}/expenses`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return handleResponseStructure<Expense[]>(res.data) ?? [];
  } catch {
    return [];
  }
}

export default async function GroupDetailPage({ params }: Props) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access-token')?.value;
  const currentUser = await getCurrentUser();

  if (!currentUser) redirect('/login');

  const [group, expenses] = await Promise.all([
    fetchGroup(params.id, token),
    fetchExpenses(params.id, token),
  ]);

  if (!group) {
    return (
      <div className={styles.mainInner}>
        <p className={styles.notFound}>// Group not found</p>
      </div>
    );
  }

  return (
    <div className={styles.mainInner}>
      <GroupHeader
        group={group}
        expenses={expenses}
        currentUser={currentUser.username}
      />
      <TransactionList
        expenses={expenses}
        currentUser={currentUser.username}
      />
    </div>
  );
}
