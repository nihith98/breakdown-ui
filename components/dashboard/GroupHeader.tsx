'use client';

import { useRouter } from 'next/navigation';
import { Group, Expense } from '@/types';
import { computeUserNet, balanceLabel, initials } from '@/lib/group-format';
import styles from './GroupHeader.module.css';

interface Props {
  group: Group;
  expenses: Expense[];
  currentUser: string;
}

export function GroupHeader({ group, expenses, currentUser }: Props) {
  const router = useRouter();

  const net = computeUserNet(expenses, currentUser);
  const balSign = net < 0 ? 'negative' : net > 0 ? 'positive' : 'neutral';
  const label = balanceLabel(net);
  const involvedCount = expenses.filter(
    t => t.splitBetween.includes(currentUser) || t.paidBy === currentUser,
  ).length;
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

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
        <span className={styles.statNum}>{group.members.length}</span>
        <span> members</span>
        <span className={styles.statSep} aria-hidden="true"> · </span>
        <span className={styles.statNum}>{expenses.length}</span>
        <span> expenses</span>
        <span className={styles.statSep} aria-hidden="true"> · </span>
        <span className={styles.statNum}>${totalAmount.toFixed(2)}</span>
        <span> total</span>
      </p>

      <div className={styles.summaryCard} data-sign={balSign}>
        <div className={styles.userInfo}>
          <div className={styles.avatar} aria-hidden="true">{initials(currentUser)}</div>
          <div className={styles.userDetails}>
            <div className={styles.username}>{currentUser}</div>
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
        <button className={styles.btnPrimary}>+ Add transaction</button>
        <button className={styles.btnHighlight}>Settle up</button>
        <button className={styles.btnGhost} title="View balances">Balances</button>
        <button className={styles.btnGhost} title="View members">Members</button>
      </div>
    </div>
  );
}
