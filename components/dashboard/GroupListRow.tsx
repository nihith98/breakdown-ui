import Link from 'next/link';
import { GroupListItem } from '@/types/index';
import {
  balanceLabel,
  balanceStatus,
  balanceValue,
  initials,
  relativeTime,
} from '@/lib/group-format';
import { ChevronRightIcon, HomeIcon } from './group-icons';
import styles from '@/app/(dashboard)/groups/groups.module.css';

interface GroupListRowProps {
  group: GroupListItem;
}

const BAL_CLASS = {
  owe: styles.balNegative,
  owed: styles.balPositive,
  settled: styles.balNeutral,
} as const;

export function GroupListRow({ group }: GroupListRowProps) {
  const status = balanceStatus(group.net);

  const memberNames = group.members?.map((m) => m.username) ?? [];
  const shown = memberNames.slice(0, 3);
  const extra = group.memberCount - shown.length;

  return (
    <Link href={`/groups/${group.id}`} className={styles.row}>
      <div className={styles.rowAvatar}>
        {group.isFamily ? <HomeIcon size={18} /> : group.name.charAt(0).toUpperCase()}
      </div>

      <div className={styles.rowMain}>
        <div className={styles.rowNameLine}>
          <span className={styles.rowName}>{group.name}</span>
          {group.isFamily && <span className={styles.familyTag}>family</span>}
        </div>
        <div className={styles.rowMeta}>
          {group.memberCount} members
          <span className={styles.sep}>·</span>
          {group.expenseCount} expenses
          {group.lastTransactionTime && (
            <>
              <span className={styles.sep}>·</span>
              updated {relativeTime(group.lastTransactionTime)}
            </>
          )}
        </div>
      </div>

      {(shown.length > 0 || extra > 0) && (
        <div className={styles.memberStack} aria-hidden="true">
          {shown.map((name, i) => (
            <div key={i} className={styles.memberDot}>
              {initials(name)}
            </div>
          ))}
          {extra > 0 && (
            <div className={`${styles.memberDot} ${styles.memberDotMore}`}>+{extra}</div>
          )}
        </div>
      )}

      <div className={styles.rowBalance}>
        <div className={styles.rowBalLabel}>{balanceLabel(group.net)}</div>
        <div className={`${styles.rowBalValue} ${BAL_CLASS[status]}`}>
          {balanceValue(group.net)}
        </div>
      </div>

      <span className={styles.rowChevron}>
        <ChevronRightIcon size={16} />
      </span>
    </Link>
  );
}
