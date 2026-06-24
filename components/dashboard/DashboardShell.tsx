'use client';

import { useState, ReactNode } from 'react';
import { TopBar } from '@/components/dashboard/TopBar';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { StatusBar } from '@/components/dashboard/StatusBar';
import styles from '@/app/(dashboard)/dashboard.module.css';

interface DashboardShellProps {
  displayName: string;
  children: ReactNode;
}

export function DashboardShell({ displayName, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <TopBar onSidebarOpen={() => setSidebarOpen(true)} />
      <Sidebar
        displayName={displayName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <main className={styles.main}>
        <div className={styles.mainInner}>{children}</div>
      </main>
      <StatusBar />
    </div>
  );
}
