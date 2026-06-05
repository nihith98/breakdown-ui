import { ReactNode } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { TopBar } from '@/components/dashboard/TopBar';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { StatusBar } from '@/components/dashboard/StatusBar';
import { AiChatPanel } from '@/components/dashboard/AiChatPanel';
import styles from './dashboard.module.css';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  const displayName = user?.displayName || 'User';

  return (
    <div className={styles.shell}>
      <TopBar />
      <Sidebar displayName={displayName} />
      <main className={styles.main}>
        <div className={styles.mainInner}>
          {children}
        </div>
      </main>
      <AiChatPanel />
      <StatusBar />
    </div>
  );
}
