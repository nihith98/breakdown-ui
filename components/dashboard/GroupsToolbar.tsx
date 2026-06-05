'use client';

import { GroupSortKey, SortDirection } from '@/types/index';
import { SearchIcon, SortIcon, ArrowDownIcon, ArrowUpIcon } from './group-icons';
import styles from '@/app/(dashboard)/groups/groups.module.css';

interface GroupsToolbarProps {
  query: string;
  onQuery: (value: string) => void;
  sortKey: GroupSortKey;
  onSortKey: (key: GroupSortKey) => void;
  sortDir: SortDirection;
  onToggleDir: () => void;
}

export function GroupsToolbar({
  query,
  onQuery,
  sortKey,
  onSortKey,
  sortDir,
  onToggleDir,
}: GroupsToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchWrap}>
        <SearchIcon size={15} />
        <input
          className={styles.searchInput}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="filter groups by name..."
          aria-label="Filter groups by name"
        />
      </div>

      <div className={styles.sortWrap}>
        <SortIcon size={13} />
        <span className={styles.sortLabel}>sort</span>
        <select
          className={styles.sortSelect}
          value={sortKey}
          onChange={(e) => onSortKey(e.target.value as GroupSortKey)}
          aria-label="Sort groups"
        >
          <option value="recent">Recent activity</option>
          <option value="name">Name</option>
          <option value="amount">Amount owed</option>
        </select>
      </div>

      <button
        type="button"
        className={styles.sortDirBtn}
        onClick={onToggleDir}
        aria-label={sortDir === 'desc' ? 'Sort ascending' : 'Sort descending'}
        title={sortDir === 'desc' ? 'Descending' : 'Ascending'}
      >
        {sortDir === 'desc' ? <ArrowDownIcon size={14} /> : <ArrowUpIcon size={14} />}
      </button>
    </div>
  );
}
