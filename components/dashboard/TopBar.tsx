'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '@/app/(dashboard)/dashboard.module.css';

interface BreadcrumbSegment {
  label: string;
  href: string;
}

function useGroupName(groupId: string | null): string | null {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    fetch(`/api/groups/${groupId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.name) setName(data.name);
      })
      .catch(() => null);
  }, [groupId]);

  return name;
}

function buildSegments(pathname: string, groupName: string | null): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [{ label: 'breakdown-ui', href: '/' }];

  if (pathname === '/') return segments;

  const parts = pathname.split('/').filter(Boolean);

  const labelMap: Record<string, string> = {
    groups: 'Groups',
    families: 'Families',
    account: 'Account',
    transactions: 'Transactions',
    orchestration: 'Orchestration',
  };

  if (parts[0] && labelMap[parts[0]]) {
    segments.push({ label: labelMap[parts[0]], href: `/${parts[0]}` });
  }

  if (parts[0] === 'groups' && parts[1]) {
    const label = groupName ?? parts[1];
    segments.push({ label, href: `/groups/${parts[1]}` });

    const subLabelMap: Record<string, string> = {
      members: 'Members',
      balances: 'Settlements',
    };
    if (parts[2] && subLabelMap[parts[2]]) {
      segments.push({ label: subLabelMap[parts[2]], href: `/groups/${parts[1]}/${parts[2]}` });
    }
  }

  return segments;
}

export function TopBar() {
  const pathname = usePathname();

  const groupIdMatch = pathname.match(/^\/groups\/([^/]+)/);
  const groupId = groupIdMatch ? groupIdMatch[1] : null;
  const groupName = useGroupName(groupId);

  const segments = buildSegments(pathname, groupName);

  return (
    <div className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <div className={styles.wordmark}>
          break<span className={styles.wordmarkHighlight}>Down</span>
        </div>
      </div>

      <div className={styles.breadcrumb}>
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <span key={seg.href} className={styles.breadcrumbItem}>
              {i > 0 && <span className={styles.breadcrumbSep}>›</span>}
              {isLast ? (
                <span className={styles.breadcrumbCurrent}>{seg.label}</span>
              ) : (
                <Link href={seg.href} className={styles.breadcrumbLink}>
                  {seg.label}
                </Link>
              )}
            </span>
          );
        })}
      </div>

      <div className={styles.topBarRight}>
        <button className={styles.iconBtn} aria-label="git branch" title="git branch">
          <GitBranchIcon />
        </button>
        <button className={styles.iconBtn} aria-label="split columns" title="split columns">
          <ColumnsIcon />
        </button>
      </div>
    </div>
  );
}

function GitBranchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function ColumnsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v18" />
      <path d="M3 9h6" />
      <path d="M15 9h6" />
      <path d="M3 15h6" />
      <path d="M15 15h6" />
    </svg>
  );
}
