import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { GroupCard } from '@/components/dashboard/GroupCard';
import { FamilyCard } from '@/components/dashboard/FamilyCard';
import { DashboardSummary } from '@/types';
import { getCurrentUser } from '@/lib/auth';
import styles from './dashboard.module.css';

export const dynamic = 'force-dynamic';

async function getDashboardData(): Promise<DashboardSummary> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/dashboard`, {
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
  const familyCount = data.recentFamilies.length;

  return (
    <>
      {/* Greeting */}
      <h1 className={styles.greeting}>
        Hey, {userDisplayName.split(' ')[0]}
      </h1>

      {/* Summary Cards */}
      <div className={styles.summaryRow}>
        <div className={`${styles.summaryCard} ${data.youOwe < 0 ? styles.negative : styles.positive}`}>
          <div className={styles.summaryLabel}>
            <ArrowUpRightIcon />
            You owe
          </div>
          <div className={`${styles.summaryAmount} ${data.youOwe < 0 ? styles.negative : styles.positive}`}>
            {data.youOwe < 0 ? '-' : '+'}${Math.abs(data.youOwe).toFixed(2)}
          </div>
          <div className={styles.summaryNote}>across {groupCount + familyCount} groups</div>
        </div>
        <div className={`${styles.summaryCard} ${data.owedToYou > 0 ? styles.positive : styles.negative}`}>
          <div className={styles.summaryLabel}>
            <ArrowDownLeftIcon />
            You are owed
          </div>
          <div className={`${styles.summaryAmount} ${data.owedToYou > 0 ? styles.positive : styles.negative}`}>
            {data.owedToYou > 0 ? '+' : '-'}${Math.abs(data.owedToYou).toFixed(2)}
          </div>
          <div className={styles.summaryNote}>across {groupCount + familyCount} groups</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Recent activity</h2>

        {/* Groups */}
        {data.recentGroups.length > 0 && (
          <div className={styles.groupsGrid}>
            {data.recentGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}

        {/* Families */}
        {data.recentFamilies.length > 0 && (
          <div className={styles.familiesGrid}>
            {data.recentFamilies.map((family) => (
              <FamilyCard key={family.id} family={family} />
            ))}
          </div>
        )}

        {data.recentGroups.length === 0 && data.recentFamilies.length === 0 && (
          <p style={{ color: 'var(--fg-tertiary)', fontSize: '14px' }}>
            No recent groups or families. Create one to get started.
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
