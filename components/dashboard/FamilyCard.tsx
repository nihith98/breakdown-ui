import Link from 'next/link';
import { Family } from '@/types';
import styles from '@/app/(dashboard)/dashboard.module.css';

interface FamilyCardProps {
  family: Family;
}

export function FamilyCard({ family }: FamilyCardProps) {
  const isNegative = family.net < 0;
  const isSettled = family.net === 0;

  const getBalanceLabel = () => {
    if (isSettled) return 'Status';
    if (isNegative) return 'Your family owes';
    return 'Owed to your family';
  };

  const getBalanceValue = () => {
    if (isSettled) return 'Settled up';
    const sign = isNegative ? '-' : '+';
    return `${sign}$${Math.abs(family.net).toFixed(2)}`;
  };

  return (
    <div className={styles.familyCard}>
      {/* Top section */}
      <div className={styles.familyTop}>
        <div className={styles.familyIcon}>
          <FolderIcon />
        </div>
        <div style={{ flex: 1 }}>
          <div className={styles.familyName}>
            {family.name}
            <Link href={`/groups/${family.groupId}`} className={styles.groupChip}>
              <UsersIcon />
              {family.groupName}
            </Link>
          </div>
          <div className={styles.familyMembers}>{family.memberCount} members</div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.familyStats}>
        <div className={styles.familyStat}>
          <div className={styles.familyStatKey}>Total spend</div>
          <div className={styles.familyStatValue}>
            +${family.totalSpend.toFixed(2)}
          </div>
        </div>
        <div className={styles.familyStat}>
          <div className={styles.familyStatKey}>{getBalanceLabel()}</div>
          <div className={`${styles.familyStatValue} ${isNegative ? styles.negative : isSettled ? styles.neutral : styles.positive}`}>
            {getBalanceValue()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.familyActions}>
        {isNegative && (
          <Link href={`/families/${family.id}/settle`} className={`${styles.btn} ${styles.btnPrimary}`}>
            Settle up
          </Link>
        )}
        <Link href={`/families/${family.id}`} className={`${styles.btn} ${styles.btnSecondary}`}>
          View
          <ArrowRightIcon />
        </Link>
      </div>
    </div>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className={styles.groupChipIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
