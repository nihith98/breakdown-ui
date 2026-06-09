'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logoutAction } from '@/app/(dashboard)/actions';
import { LogoutLoader } from '@/app/components/LogoutLoader';
import styles from '@/app/(dashboard)/dashboard.module.css';

interface SidebarProps {
  displayName: string;
}

export function Sidebar({ displayName }: SidebarProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getInitial = () => displayName.charAt(0).toUpperCase();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: <GridIcon /> },
    { href: '/groups', label: 'Groups', icon: <UsersIcon />, badge: '5' },
    { href: '/families', label: 'Families', icon: <HomeIcon />, badge: '2' },
    { href: '/account', label: 'Account', icon: <UserIcon /> },
    { href: '/transactions', label: 'Transactions', icon: <ReceiptIcon />, badge: '38' },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAction();
      // logoutAction() handles redirect, so execution doesn't continue here
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <LogoutLoader isVisible={isLoggingOut} />
      <nav className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        {/* User Chip */}
        <div className={styles.userChip}>
          <div className={styles.avatar}>{getInitial()}</div>
          <div className={styles.displayName}>{displayName}</div>
        </div>

        {/* Section Label */}
        <div className={styles.sectionLabel}>// workspace</div>

        {/* Nav Items */}
        <div className={styles.navItems}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`${styles.logoutBtn} ${isLoggingOut ? styles.loading : ''}`}
          aria-label="Log out"
          title={isLoggingOut ? 'Logging out...' : 'Log out'}
        >
          <LogoutIcon />
          <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
        </button>
      </div>
    </nav>
    </>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9h12M6 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2M6 9v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" />
      <path d="M9 12h6M9 15h6M9 18h6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
