'use client';

import { useRouter } from 'next/navigation';
import { SettlementTransaction, Transaction } from '@/types';
import { settleUp } from '@/app/(dashboard)/groups/[id]/actions';
import styles from './BalancesPage.module.css';

interface Props {
  groupId: string;
  settlementList: SettlementTransaction[];
  memberMap: Record<string, string>;
  transactions: Transaction[];
  currentUserId: string;
}

function resolveName(userId: string, memberMap: Record<string, string>, explicitName?: string | null) {
  return explicitName ?? memberMap[userId] ?? userId;
}

export function BalancesPage({ groupId, settlementList, memberMap, transactions, currentUserId }: Props) {
  const router = useRouter();

  const settlements = settlementList.map(s => {
    const entry = s.paidForList[0];
    return {
      uuid: s.uuid,
      debtorId: s.paidById,
      debtorName: resolveName(s.paidById, memberMap, s.paidByName),
      creditorId: entry?.paidForId ?? '',
      creditorName: entry ? resolveName(entry.paidForId, memberMap, entry.paidForName) : '',
      amount: entry?.paidForValue ?? 0,
      status: s.transactionStatus,
      involvesUser: s.paidById === currentUserId || entry?.paidForId === currentUserId,
    };
  });

  const involvedCount = settlements.filter(s => s.involvesUser).length;

  const totalsMap: Record<string, number> = {};
  transactions.forEach(t => {
    totalsMap[t.paidById] = (totalsMap[t.paidById] ?? 0) + t.amount;
  });
  const groupTotal = Object.values(totalsMap).reduce((s, v) => s + v, 0) || 1;
  const totals = Object.entries(totalsMap)
    .map(([userId, total]) => ({
      userId,
      name: memberMap[userId] ?? userId,
      total,
      percent: (total / groupTotal) * 100,
    }))
    .sort((a, b) => b.total - a.total);

  async function handleSettleUp(uuid: string) {
    try {
      await settleUp(groupId, uuid);
      router.refresh();
    } catch {
      // settle-up endpoint not yet implemented on backend
    }
  }

  return (
    <div className={styles.wrap}>
      <button className={styles.backLink} onClick={() => router.push(`/groups/${groupId}`)}>‹ Group</button>
      <h1 className={styles.title}>Balances</h1>
      <p className={styles.subtitle}>{settlements.length} settlements required · {involvedCount} involve you</p>

      <div className={styles.content}>
        <section>
          <div className={styles.sectionHeader}>Settlements ({settlements.length})</div>
          {settlements.length === 0 ? (
            <div className={styles.emptyState}>// no settlements required</div>
          ) : (
            settlements.map(s => (
              <div key={s.uuid} className={`${styles.settlementRow}${s.involvesUser ? ` ${styles.settlementRowHighlighted}` : ''}`}>
                <div className={styles.avatar} aria-hidden="true">{(s.debtorName[0] ?? '?').toUpperCase()}</div>
                <span className={styles.settlementName}>{s.debtorName}</span>
                <span className={styles.settlementArrow}>→</span>
                <span className={styles.settlementAmount} data-highlighted={s.involvesUser}>${s.amount.toFixed(2)}</span>
                <span className={styles.settlementArrow}>→</span>
                <div className={styles.avatar} aria-hidden="true">{(s.creditorName[0] ?? '?').toUpperCase()}</div>
                <span className={styles.settlementName}>{s.creditorName}</span>
                {s.status === 'COMPLETE' ? (
                  <span className={styles.completeBadge}>Settled</span>
                ) : (
                  <button className={styles.settleBtn} onClick={() => handleSettleUp(s.uuid)}>Settle up</button>
                )}
              </div>
            ))
          )}
        </section>

        <section>
          <div className={styles.sectionHeader}>Total Spend (${groupTotal.toFixed(2)})</div>
          {totals.map(t => (
            <div key={t.userId} className={`${styles.totalRow}${t.userId === currentUserId ? ` ${styles.totalRowHighlighted}` : ''}`}>
              <span className={styles.totalName}>{t.name}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${Math.min(100, t.percent)}%` }} />
              </div>
              <span className={styles.totalPercent}>{t.percent.toFixed(0)}%</span>
              <span className={styles.totalAmount}>${t.total.toFixed(2)}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
