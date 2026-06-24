import { ReactNode } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  const displayName = user?.displayName || 'User';

  return <DashboardShell displayName={displayName}>{children}</DashboardShell>;
}
