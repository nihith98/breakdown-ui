'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Group, Transaction, UserFamilyInfo } from '@/types';
import { computeTransactionNet, balanceLabel, balanceStatus, initials } from '@/lib/group-format';
import { getCurrencySymbol } from '@/lib/currency';
import { FamilyTag } from './FamilyTag';
import styles from './GroupHeader.module.css';

interface Props {
  group: Group;
  transactions: Transaction[];
  currentUser: string;
  displayName?: string;
  joiningCode?: string;
  onAddTransaction?: () => void;
  userFamilyMap?: Record<string, UserFamilyInfo>;
}

export function GroupHeader({ group, transactions, currentUser, displayName, joiningCode, onAddTransaction, userFamilyMap }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!joiningCode) return;
    navigator.clipboard.writeText(joiningCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const net = computeTransactionNet(transactions, currentUser);
  const balSign = net < 0 ? 'negative' : net > 0 ? 'positive' : 'neutral';
  const currentUserFamily = userFamilyMap?.[currentUser] ?? null;
  const label = currentUserFamily
    ? (balanceStatus(net) === 'owe'
        ? `Your family of ${currentUserFamily.memberCount} owes`
        : balanceStatus(net) === 'owed'
          ? `Your family of ${currentUserFamily.memberCount} is owed`
          : `Your family of ${currentUserFamily.memberCount} is settled up`)
    : balanceLabel(net);
  const involvedCount = transactions.filter(
    t => t.paidById === currentUser || t.paidForList.some(e => e.paidForId === currentUser),
  ).length;
  const totalAmount = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className={styles.header}>
      <button className={styles.backLink} onClick={() => router.back()}>
        ‹ Groups
      </button>

      <div className={styles.nameRow}>
        <h1 className={styles.groupName}>{group.name}</h1>
        {joiningCode && (
          <div className={styles.joiningCodeWrap}>
            <span className={styles.joiningCodeLabel}>join code</span>
            <span className={styles.joiningCode}>{joiningCode}</span>
            <button
              className={`${styles.copyBtn}${copied ? ` ${styles.copyBtnCopied}` : ''}`}
              onClick={handleCopy}
              aria-label="Copy joining code"
              title={copied ? 'Copied!' : 'Copy joining code'}
            >
              {copied ? '✓' : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {group.description && (
        <p className={styles.description}>
          <span className={styles.commentSlash} aria-hidden="true">// </span>
          {group.description}
        </p>
      )}

      <p className={styles.stats}>
        {group.members.length > 0 && (
          <>
            <span className={styles.statNum}>{group.members.length}</span>
            <span> members</span>
            <span className={styles.statSep} aria-hidden="true"> · </span>
          </>
        )}
        <span className={styles.statNum}>{transactions.length}</span>
        <span> expenses</span>
        <span className={styles.statSep} aria-hidden="true"> · </span>
        <span className={styles.statNum}>{getCurrencySymbol()}{totalAmount.toFixed(2)}</span>
        <span> total</span>
      </p>

      <div className={styles.summaryCard} data-sign={balSign}>
        <div className={styles.userInfo}>
          <div className={styles.avatar} aria-hidden="true">{initials(displayName ?? currentUser)}</div>
          <div className={styles.userDetails}>
            <div className={styles.username} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {displayName ?? currentUser}
              {currentUserFamily && (
                <FamilyTag familyName={currentUserFamily.familyName} familyHex={currentUserFamily.familyHex} />
              )}
            </div>
            <div className={styles.txnCount}>{involvedCount} transactions</div>
          </div>
        </div>
        <div className={styles.balance}>
          <span className={styles.balLabel}>{label}</span>
          <span className={styles.balAmount} data-sign={balSign}>
            {getCurrencySymbol()}{Math.abs(net).toFixed(2)}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={onAddTransaction}>+ Add transaction</button>
        <button className={styles.btnHighlight} onClick={() => router.push(`/groups/${group.id}/balances`)}>Settlements</button>
        <button className={styles.btnGhost} title="View members" onClick={() => router.push(`/groups/${group.id}/members`)}>Members</button>
      </div>
    </div>
  );
}
