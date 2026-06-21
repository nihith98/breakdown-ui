'use client';

import { useState, useMemo } from 'react';
import { Transaction, UserFamilyInfo } from '@/types';
import { transactionUserAmount, transactionMeta, formatShortDate } from '@/lib/group-format';
import { getCurrencySymbol } from '@/lib/currency';
import { FamilyTag } from './FamilyTag';
import styles from './TransactionList.module.css';

type FilterKey = 'all' | 'you_paid' | 'others_paid';
type SortKey = 'recent' | 'amount' | 'name';
type SortDir = 'desc' | 'asc';

interface Props {
  transactions: Transaction[];
  currentUser: string;
  memberMap?: Record<string, string>;
  userFamilyMap?: Record<string, UserFamilyInfo>;
  onTxnClick?: (tx: Transaction) => void;
}

const FILTERS: { id: FilterKey; label: string; dot?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'you_paid', label: 'You paid', dot: 'dotYouPaid' },
  { id: 'others_paid', label: 'Others paid', dot: 'dotOthersPaid' },
];

export function TransactionList({ transactions, currentUser, memberMap, userFamilyMap, onTxnClick }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [dir, setDir] = useState<SortDir>('desc');
  const [activeId, setActiveId] = useState<string | null>(null);

  const visible = useMemo(() => {
    let list = [...transactions];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(t => t.transactionName.toLowerCase().includes(q));
    }
    if (filter === 'you_paid') {
      list = list.filter(t => t.paidById === currentUser);
    }
    if (filter === 'others_paid') {
      list = list.filter(
        t => t.paidById !== currentUser && t.paidForList.some(e => e.paidForId === currentUser),
      );
    }
    list.sort((a, b) => {
      if (sort === 'amount') return b.amount - a.amount;
      if (sort === 'name') return a.transactionName.localeCompare(b.transactionName);
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    });
    if (dir === 'asc') list.reverse();
    return list;
  }, [transactions, query, filter, sort, dir, currentUser]);

  const counts = useMemo((): Record<FilterKey, number> => ({
    all: transactions.length,
    you_paid: transactions.filter(t => t.paidById === currentUser).length,
    others_paid: transactions.filter(
      t => t.paidById !== currentUser && t.paidForList.some(e => e.paidForId === currentUser),
    ).length,
  }), [transactions, currentUser]);

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
        {visible.length === 0 ? (
          <div className={styles.emptyState} role="listitem">
            <span className={styles.emptyComment}>// no transactions match</span>
          </div>
        ) : (
          visible.map((tx) => {
            const isSettlement = tx.transactionType === 'SETTLEMENT';

            if (isSettlement) {
              const payerName = memberMap?.[tx.paidById] ?? tx.paidByName ?? tx.paidById;
              const payeeEntry = tx.paidForList[0];
              const payeeName = payeeEntry
                ? (memberMap?.[payeeEntry.paidForId] ?? payeeEntry.paidForName ?? payeeEntry.paidForId)
                : '?';
              const payerFamily = userFamilyMap?.[tx.paidById];
              const payeeFamily = payeeEntry ? userFamilyMap?.[payeeEntry.paidForId] : undefined;

              return (
                <div
                  key={tx.transactionId}
                  className={`${styles.txnRowSettlement} ${styles.txnRowClickable}`}
                  role="listitem"
                  onClick={() => onTxnClick?.(tx)}
                >
                  <span className={styles.txnBraceSettlement} aria-hidden="true">{'{'}</span>
                  <div className={styles.txnBody}>
                    <span className={styles.txnNameSettlement}>&ldquo;{tx.transactionName}&rdquo;</span>
                    <span className={styles.txnSep} aria-hidden="true">{' · '}</span>
                    <span className={styles.txnMeta} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      {payerName}
                      {payerFamily && <FamilyTag familyName={payerFamily.familyName} familyHex={payerFamily.familyHex} />}
                      {' → '}
                      {payeeName}
                      {payeeFamily && <FamilyTag familyName={payeeFamily.familyName} familyHex={payeeFamily.familyHex} />}
                    </span>
                  </div>
                  <div className={styles.txnRight}>
                    {tx.timestamp && (
                      <time className={styles.txnDate} dateTime={tx.timestamp}>
                        {formatShortDate(tx.timestamp)}
                      </time>
                    )}
                    <span className={styles.txnAmount} data-sign="neutral">
                      {getCurrencySymbol()}{tx.amount.toFixed(2)}
                    </span>
                  </div>
                  <span className={styles.txnBraceSettlement} aria-hidden="true">{'}'}</span>
                </div>
              );
            }

            const amount = transactionUserAmount(tx, currentUser);
            const meta = transactionMeta(tx, currentUser, memberMap);
            const payerFamily = userFamilyMap?.[tx.paidById];
            const isActive = activeId === tx.transactionId;
            const notInvolved = amount === null;
            const amountSign: 'positive' | 'negative' | 'neutral' =
              amount === null ? 'neutral'
              : amount > 0 ? 'positive'
              : amount < 0 ? 'negative'
              : 'neutral';

            return (
              <div
                key={tx.transactionId}
                className={`${styles.txnRow}${isActive ? ` ${styles.txnRowActive}` : ''}`}
                onClick={() => {
                  setActiveId(isActive ? null : tx.transactionId);
                  onTxnClick?.(tx);
                }}
                role="listitem"
              >
                <span className={styles.txnBrace} aria-hidden="true">{'{'}</span>
                <div className={styles.txnBody}>
                  <span className={styles.txnName}>&ldquo;{tx.transactionName}&rdquo;</span>
                  <span className={styles.txnSep} aria-hidden="true">{' · '}</span>
                  {payerFamily ? (
                    <span className={styles.txnMeta} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      {tx.paidById === currentUser ? 'You' : (tx.paidByName ?? memberMap?.[tx.paidById] ?? tx.paidById)}
                      <FamilyTag familyName={payerFamily.familyName} familyHex={payerFamily.familyHex} />
                      {` paid ${getCurrencySymbol()}${tx.amount.toFixed(2)} for ${tx.paidForList.length} member${tx.paidForList.length !== 1 ? 's' : ''}`}
                    </span>
                  ) : (
                    <span className={styles.txnMeta}>{meta}</span>
                  )}
                </div>
                <div className={styles.txnRight}>
                  {tx.timestamp && (
                    <time className={styles.txnDate} dateTime={tx.timestamp}>
                      {formatShortDate(tx.timestamp)}
                    </time>
                  )}
                  {notInvolved ? (
                    <span className={styles.txnNotInvolved}>not involved</span>
                  ) : (
                    <span className={styles.txnAmount} data-sign={amountSign}>
                      {getCurrencySymbol()}{Math.abs(amount!).toFixed(2)}
                    </span>
                  )}
                </div>
                <span className={styles.txnCloser} aria-hidden="true">{'}'}</span>
              </div>
            );
          })
        )}

      </div>
    </div>
  );
}
