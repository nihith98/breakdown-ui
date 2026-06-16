import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { GroupInfo } from '@/types';
import { MembersPage } from '@/components/dashboard/MembersPage';

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

async function fetchGroupInfo(id: string): Promise<GroupInfo | null> {
  try {
    const res = await serverFetch(`/api/groups/${id}/group-info`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function GroupMembersPage({ params }: Props) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  const groupInfo = await fetchGroupInfo(id);

  if (!groupInfo) {
    return <p>// Group not found</p>;
  }

  return (
    <MembersPage groupId={id} groupInfo={groupInfo} currentUserId={currentUser.username} />
  );
}
