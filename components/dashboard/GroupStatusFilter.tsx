'use client';

import { GroupStatusFilterKey } from '@/types/index';
import styles from '@/app/(dashboard)/groups/groups.module.css';

interface GroupStatusFilterProps {
  active: GroupStatusFilterKey;
  counts: Record<GroupStatusFilterKey, number>;
  onChange: (key: GroupStatusFilterKey) => void;
}

const FILTERS: { id: GroupStatusFilterKey; label: string; dot?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'owe', label: 'You owe', dot: 'dotOwe' },
  { id: 'owed', label: 'Owed to you', dot: 'dotOwed' },
  { id: 'settled', label: 'Settled up', dot: 'dotSettled' },
];

export function GroupStatusFilter({ active, counts, onChange }: GroupStatusFilterProps) {
  return (
    <div className={styles.filterBar} role="tablist" aria-label="Filter by balance">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          role="tab"
          aria-selected={active === f.id}
          className={`${styles.filterPill} ${active === f.id ? styles.filterPillActive : ''}`}
          onClick={() => onChange(f.id)}
        >
          {f.dot && <span className={`${styles.filterDot} ${styles[f.dot]}`} />}
          {f.label}
          <span className={styles.filterCount}>{counts[f.id]}</span>
        </button>
      ))}
    </div>
  );
}
