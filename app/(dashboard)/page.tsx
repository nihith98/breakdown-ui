import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { GroupCard } from '@/components/dashboard/GroupCard';
import { DashboardSummary } from '@/types';
import { getCurrentUser } from '@/lib/auth';
import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { getCurrencySymbol } from '@/lib/currency';

export const dynamic = 'force-dynamic';

async function getDashboardData(): Promise<DashboardSummary> {
  try {
    const headerStore = await headers();
    const cookieStore = await cookies();
    const host = headerStore.get('host') ?? 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const response = await fetch(`${protocol}://${host}/api/dashboard`, {
      headers: { cookie: cookieStore.toString() },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return {
      displayName: 'User',
      youOwe: 0,
      owedToYou: 0,
      net: 0,
      recentGroups: [],
      recentFamilies: [],
    };
  }
}

export default async function DashboardHome() {
  const user = await getCurrentUser();
  const userDisplayName = user?.displayName || 'User';
  const data = await getDashboardData();

  const groupCount = data.recentGroups.length;
  const familyCount = data.recentFamilies?.length ?? 0;

  return (
    <>
      {/* Greeting */}
      <h1 className={styles.greeting}>
        Hey, {userDisplayName.split(' ')[0]}
      </h1>

      {/* Summary Cards */}
      <div className={styles.summaryRow}>
        <div className={`${styles.summaryCard} ${data.youOwe < 0 ? styles.negative : data.youOwe > 0 ? styles.positive : styles.neutral}`}>
          <div className={styles.summaryLabel}>
            <ArrowUpRightIcon />
            You owe
          </div>
          <div className={`${styles.summaryAmount} ${data.youOwe < 0 ? styles.negative : data.youOwe > 0 ? styles.positive : styles.neutral}`}>
            {getCurrencySymbol()}{Math.abs(data.youOwe).toFixed(2)}
          </div>
          <div className={styles.summaryNote}>across {groupCount + familyCount} groups</div>
        </div>
        <div className={`${styles.summaryCard} ${data.owedToYou > 0 ? styles.positive : data.owedToYou < 0 ? styles.negative : styles.neutral}`}>
          <div className={styles.summaryLabel}>
            <ArrowDownLeftIcon />
            You are owed
          </div>
          <div className={`${styles.summaryAmount} ${data.owedToYou > 0 ? styles.positive : data.owedToYou < 0 ? styles.negative : styles.neutral}`}>
            {getCurrencySymbol()}{Math.abs(data.owedToYou).toFixed(2)}
          </div>
          <div className={styles.summaryNote}>across {groupCount + familyCount} groups</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.recentSection}>
        <div className={styles.primarySecHead}>
          <h2 className={styles.primarySecTitle}>Recent activity</h2>
        </div>

        {data.recentGroups.length > 0 ? (
          <>
            <div className={styles.subHead}>
              <h3 className={styles.subTitle}>Groups</h3>
              <Link href="/groups" className={styles.subLink}>
                view all groups
                <ArrowRightIcon />
              </Link>
            </div>
            <div className={styles.groupsGrid}>
              {data.recentGroups.slice(0, 3).map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </>
        ) : (
          <p className={styles.emptyState}>
            No recent groups. Create one to get started.
          </p>
        )}
      </div>
    </>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg className={styles.summaryIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function ArrowDownLeftIcon() {
  return (
    <svg className={styles.summaryIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="7" x2="7" y2="17" />
      <polyline points="17 17 7 17 7 7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
