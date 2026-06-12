'use client';

import { useState, useMemo } from 'react';
import { Expense } from '@/types';
import { txnUserAmount, txnMeta, relativeTime } from '@/lib/group-format';
import styles from './TransactionList.module.css';

type FilterKey = 'all' | 'you_paid' | 'others_paid';
type SortKey = 'recent' | 'amount' | 'name';
type SortDir = 'desc' | 'asc';

interface Props {
  expenses: Expense[];
  currentUser: string;
}

const FILTERS: { id: FilterKey; label: string; dot?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'you_paid', label: 'You paid', dot: 'dotYouPaid' },
  { id: 'others_paid', label: 'Others paid', dot: 'dotOthersPaid' },
];

export function TransactionList({ expenses, currentUser }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [dir, setDir] = useState<SortDir>('desc');
  const [activeId, setActiveId] = useState<string | null>(null);

  const visible = useMemo(() => {
    let list = [...expenses];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(t => t.description.toLowerCase().includes(q));
    }
    if (filter === 'you_paid') {
      list = list.filter(t => t.paidBy === currentUser);
    }
    if (filter === 'others_paid') {
      list = list.filter(
        t => t.paidBy !== currentUser && t.splitBetween.includes(currentUser),
      );
    }
    list.sort((a, b) => {
      if (sort === 'amount') return b.amount - a.amount;
      if (sort === 'name') return a.description.localeCompare(b.description);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    if (dir === 'asc') list.reverse();
    return list;
  }, [expenses, query, filter, sort, dir]);

  const counts = useMemo((): Record<FilterKey, number> => ({
    all: expenses.length,
    you_paid: expenses.filter(t => t.paidBy === currentUser).length,
    others_paid: expenses.filter(
      t => t.paidBy !== currentUser && t.splitBetween.includes(currentUser),
    ).length,
  }), [expenses, currentUser]);

  return (
    <div className={styles.txnSection}>
      {/* ===== Toolbar ===== */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="search transactions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search transactions"
          />
        </div>

        <div className={styles.sortWrap}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="15" y2="12" />
            <line x1="3" y1="18" x2="9" y2="18" />
          </svg>
          <span className={styles.sortLabel} aria-hidden="true">sort</span>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            aria-label="Sort transactions by"
          >
            <option value="recent">Most recent</option>
            <option value="amount">Amount</option>
            <option value="name">Description</option>
          </select>
        </div>

        <button
          className={styles.sortDirBtn}
          onClick={() => setDir(d => d === 'desc' ? 'asc' : 'desc')}
          aria-label={`Sort ${dir === 'desc' ? 'ascending' : 'descending'}`}
          title={dir === 'desc' ? 'Switch to ascending' : 'Switch to descending'}
        >
          {dir === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      {/* ===== Filter pills ===== */}
      <div className={styles.filterBar} role="group" aria-label="Filter transactions">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`${styles.filterPill}${filter === f.id ? ` ${styles.filterPillActive}` : ''}`}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
          >
            {f.dot && (
              <span
                className={`${styles.filterDot} ${styles[f.dot as keyof typeof styles]}`}
                aria-hidden="true"
              />
            )}
            {f.label}
            <span className={styles.filterCount}>{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {/* ===== JSON-styled transaction list ===== */}
      <div className={styles.txnListContainer} role="list" aria-label="Transaction list">
        <div className={styles.jsonBracket} aria-hidden="true">[</div>

        {visible.length === 0 ? (
          <div className={styles.emptyState} role="listitem">
            <span className={styles.emptyComment}>// no transactions match</span>
          </div>
        ) : (
          visible.map((tx, idx) => {
            const amount = txnUserAmount(tx, currentUser);
            const meta = txnMeta(tx, currentUser);
            const isActive = activeId === tx.id;
            const isLast = idx === visible.length - 1;
            const notInvolved = amount === null;
            const amountSign: 'positive' | 'negative' | 'neutral' =
              amount === null ? 'neutral'
              : amount > 0 ? 'positive'
              : amount < 0 ? 'negative'
              : 'neutral';

            return (
              <div
                key={tx.id}
                className={`${styles.txnRow}${isActive ? ` ${styles.txnRowActive}` : ''}`}
                onClick={() => setActiveId(isActive ? null : tx.id)}
                role="listitem"
              >
                <div className={styles.txnRowInner}>
                  <span className={styles.txnBrace} aria-hidden="true">{'{'}</span>
                  <div className={styles.txnBody}>
                    <span className={styles.txnName}>&ldquo;{tx.description}&rdquo;</span>
                    <span className={styles.txnMeta}>{meta}</span>
                  </div>
                  <div className={styles.txnRight}>
                    {notInvolved ? (
                      <span className={styles.txnNotInvolved}>not involved</span>
                    ) : (
                      <span className={styles.txnAmount} data-sign={amountSign}>
                        {amount! >= 0 ? '+' : '-'}${Math.abs(amount!).toFixed(2)}
                      </span>
                    )}
                    <span className={styles.txnChevron} aria-hidden="true">›</span>
                  </div>
                </div>
                <div className={styles.txnCloser} aria-hidden="true">
                  {isLast ? '}' : '},'}
                </div>
                <time className={styles.txnTime} dateTime={tx.createdAt}>
                  {relativeTime(tx.createdAt)}
                </time>
              </div>
            );
          })
        )}

        <div className={styles.jsonBracket} aria-hidden="true">]</div>
      </div>
    </div>
  );
}
