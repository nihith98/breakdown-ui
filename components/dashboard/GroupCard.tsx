import Link from 'next/link';
import { GroupSummary } from '@/types';
import styles from '@/app/(dashboard)/dashboard.module.css';

interface GroupCardProps {
  group: GroupSummary;
}

export function GroupCard({ group }: GroupCardProps) {
  const isNegative = group.net < 0;
  const isSettled = group.net === 0;

  const getBalanceLabel = () => {
    if (isSettled) return 'Status';
    if (isNegative) return 'You owe';
    return 'Owed to you';
  };

  const getBalanceValue = () => {
    if (isSettled) return 'Settled up';
    const sign = isNegative ? '-' : '+';
    return `${sign}$${Math.abs(group.net).toFixed(2)}`;
  };

  return (
    <div className={styles.groupCard}>
      {/* Name */}
      <div className={styles.groupName}>
        {group.name}
        {group.isFamily && (
          <span className={styles.familyTag}>family</span>
        )}
      </div>

      {/* Meta */}
      <div className={styles.groupMeta}>
        {group.memberCount} members · {group.expenseCount} expenses
      </div>

      {/* Balance */}
      <div className={styles.groupBalance}>
        <div className={styles.balanceLabel}>{getBalanceLabel()}</div>
        <div className={`${styles.balanceValue} ${isNegative ? styles.negative : isSettled ? styles.neutral : styles.positive}`}>
          {getBalanceValue()}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.groupActions}>
        {isNegative && (
          <Link href={`/groups/${group.id}/settle`} className={`${styles.btn} ${styles.btnPrimary}`}>
            Settle up
          </Link>
        )}
        <Link href={`/groups/${group.id}`} className={`${styles.btn} ${styles.btnSecondary}`}>
          View
          <ArrowRightIcon />
        </Link>
      </div>
    </div>
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
