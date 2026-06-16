'use client';

import { useRouter } from 'next/navigation';
import { Group, Transaction } from '@/types';
import { computeTransactionNet, balanceLabel, initials } from '@/lib/group-format';
import styles from './GroupHeader.module.css';

interface Props {
  group: Group;
  transactions: Transaction[];
  currentUser: string;
  displayName?: string;
  onAddTransaction?: () => void;
}

export function GroupHeader({ group, transactions, currentUser, displayName, onAddTransaction }: Props) {
  const router = useRouter();

  const net = computeTransactionNet(transactions, currentUser);
  const balSign = net < 0 ? 'negative' : net > 0 ? 'positive' : 'neutral';
  const label = balanceLabel(net);
  const involvedCount = transactions.filter(
    t => t.paidById === currentUser || t.paidForList.some(e => e.paidForId === currentUser),
  ).length;
  const totalAmount = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className={styles.header}>
      <button className={styles.backLink} onClick={() => router.back()}>
        ‹ Groups
      </button>

      <h1 className={styles.groupName}>{group.name}</h1>

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
        <span className={styles.statNum}>${totalAmount.toFixed(2)}</span>
        <span> total</span>
      </p>

      <div className={styles.summaryCard} data-sign={balSign}>
        <div className={styles.userInfo}>
          <div className={styles.avatar} aria-hidden="true">{initials(displayName ?? currentUser)}</div>
          <div className={styles.userDetails}>
            <div className={styles.username}>{displayName ?? currentUser}</div>
            <div className={styles.txnCount}>{involvedCount} transactions</div>
          </div>
        </div>
        <div className={styles.balance}>
          <span className={styles.balLabel}>{label}</span>
          <span className={styles.balAmount} data-sign={balSign}>
            {net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(2)}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={onAddTransaction}>+ Add transaction</button>
        <button className={styles.btnHighlight} onClick={() => router.push(`/groups/${group.id}/balances`)}>Settle up</button>
        <button className={styles.btnGhost} title="View balances" onClick={() => router.push(`/groups/${group.id}/balances`)}>Balances</button>
        <button className={styles.btnGhost} title="View members" onClick={() => router.push(`/groups/${group.id}/members`)}>Members</button>
      </div>
    </div>
  );
}
