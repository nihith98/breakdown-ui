'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GroupInfo, SettlementTransaction, Transaction, UserFamilyInfo } from '@/types';
import { buildUserFamilyMap } from '@/lib/group-format';
import { getCurrencySymbol } from '@/lib/currency';
import { FamilyTag } from './FamilyTag';
import { SettlementModal } from './SettlementModal';
import styles from './BalancesPage.module.css';

interface Props {
  groupId: string;
  settlementList: SettlementTransaction[];
  memberMap: Record<string, string>;
  transactions: Transaction[];
  currentUserId: string;
  groupInfo: GroupInfo | null;
}

type FamilyMemberEntry = { userId: string; displayName: string };

function resolveName(userId: string, memberMap: Record<string, string>, explicitName?: string | null) {
  return explicitName ?? memberMap[userId] ?? userId;
}

export function BalancesPage({ groupId, settlementList, memberMap, transactions, currentUserId, groupInfo }: Props) {
  const router = useRouter();
  const [pendingSettlement, setPendingSettlement] = useState<{
    uuid: string;
    debtorId: string;
    debtorName: string;
    debtorFamilyName?: string;
    debtorFamilyHex?: string;
    debtorFamilyMembers?: FamilyMemberEntry[];
    creditorId: string;
    creditorName: string;
    creditorFamilyName?: string;
    creditorFamilyHex?: string;
    creditorFamilyMembers?: FamilyMemberEntry[];
    amount: number;
  } | null>(null);

  const userFamilyMap = useMemo(() => buildUserFamilyMap(groupInfo), [groupInfo]);

  // Looks up a family directly by its familyId — needed when paidById/paidForId in a
  // settlement IS a family ID (backend uses family ID as paidById for family-level settlements).
  function getFamilyInfoById(familyId: string): UserFamilyInfo | undefined {
    const family = groupInfo?.familyList?.find(f => f.familyId === familyId);
    if (!family) return undefined;
    return {
      familyId: family.familyId,
      familyName: family.familyName,
      familyHex: family.familyHex,
      memberCount: family.memberIds.length,
    };
  }

  function getFamilyMembers(familyId: string): FamilyMemberEntry[] {
    const family = groupInfo?.familyList?.find(f => f.familyId === familyId);
    if (!family) return [];
    return family.memberIds.map(id => {
      const person = groupInfo?.personList.find(p => p.userId === id);
      return { userId: id, displayName: person?.displayName ?? id };
    });
  }

  const settlements = settlementList.map(s => {
    const entry = s.paidForList[0];
    // Try user-based lookup first (member who happens to be in a family),
    // then fall back to direct family ID lookup (family-level settlement).
    const debtorFamily = userFamilyMap[s.paidById]
      ?? getFamilyInfoById(s.paidById)
      ?? (s.familyId ? getFamilyInfoById(s.familyId) : undefined);
    const creditorFamily = entry
      ? (userFamilyMap[entry.paidForId] ?? getFamilyInfoById(entry.paidForId))
      : undefined;
    return {
      uuid: s.uuid,
      debtorId: s.paidById,
      debtorName: debtorFamily?.familyName ?? resolveName(s.paidById, memberMap, s.paidByName),
      creditorId: entry?.paidForId ?? '',
      creditorName: entry
        ? (creditorFamily?.familyName ?? resolveName(entry.paidForId, memberMap, entry.paidForName))
        : '',
      amount: Math.round((entry?.paidForValue ?? 0) * 100) / 100,
      status: s.transactionStatus,
      involvesUser: s.paidById === currentUserId || entry?.paidForId === currentUserId,
      debtorFamily,
      creditorFamily,
    };
  });

  const pendingSettlements = settlements.filter(s => s.amount >= 0.01);
  const involvedCount = pendingSettlements.filter(s => s.involvesUser).length;

  const totalsMap: Record<string, number> = {};
  transactions.forEach(t => {
    totalsMap[t.paidById] = (totalsMap[t.paidById] ?? 0) + t.amount;
  });
  const groupTotal = Object.values(totalsMap).reduce((s, v) => s + v, 0) || 1;
  const totals = Object.entries(totalsMap)
    .map(([userId, total]) => ({
      userId,
      name: memberMap[userId] ?? userId,
      family: userFamilyMap[userId],
      total,
      percent: (total / groupTotal) * 100,
    }))
    .sort((a, b) => b.total - a.total);

  function openSettlementModal(s: typeof settlements[0]) {
    setPendingSettlement({
      uuid: s.uuid,
      debtorId: s.debtorId,
      debtorName: s.debtorName,
      debtorFamilyName: s.debtorFamily?.familyName,
      debtorFamilyHex: s.debtorFamily?.familyHex,
      debtorFamilyMembers: s.debtorFamily ? getFamilyMembers(s.debtorFamily.familyId) : undefined,
      creditorId: s.creditorId,
      creditorName: s.creditorName,
      creditorFamilyName: s.creditorFamily?.familyName,
      creditorFamilyHex: s.creditorFamily?.familyHex,
      creditorFamilyMembers: s.creditorFamily ? getFamilyMembers(s.creditorFamily.familyId) : undefined,
      amount: s.amount,
    });
  }

  return (
    <div className={styles.wrap}>
      <button className={styles.backLink} onClick={() => router.push(`/groups/${groupId}`)}>‹ Group</button>
      <h1 className={styles.title}>Settlements</h1>
      <p className={styles.subtitle}>{pendingSettlements.length} settlement{pendingSettlements.length !== 1 ? 's' : ''} required · {involvedCount} involve you</p>

      <div className={styles.content}>
        <section>
          <div className={styles.sectionHeader}>Settlements ({pendingSettlements.length})</div>
          {pendingSettlements.length === 0 ? (
            <div className={styles.emptyState}>// no settlements required</div>
          ) : (
            pendingSettlements.map(s => {
              const debtorLabel = s.debtorFamily?.familyName ?? s.debtorName;
              const creditorLabel = s.creditorFamily?.familyName ?? s.creditorName;
              return (
                <div key={s.uuid} className={`${styles.settlementRow}${s.involvesUser ? ` ${styles.settlementRowHighlighted}` : ''}`}>
                  <div className={styles.avatar} aria-hidden="true">{(debtorLabel[0] ?? '?').toUpperCase()}</div>
                  <span className={styles.settlementName} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {s.debtorFamily
                      ? <FamilyTag familyName={s.debtorFamily.familyName} familyHex={s.debtorFamily.familyHex} />
                      : s.debtorName}
                  </span>
                  <span className={styles.settlementArrow}>→</span>
                  <span className={styles.settlementAmount} data-highlighted={s.involvesUser}>{getCurrencySymbol()}{s.amount.toFixed(2)}</span>
                  <span className={styles.settlementArrow}>→</span>
                  <div className={styles.avatar} aria-hidden="true">{(creditorLabel[0] ?? '?').toUpperCase()}</div>
                  <span className={styles.settlementName} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {s.creditorFamily
                      ? <FamilyTag familyName={s.creditorFamily.familyName} familyHex={s.creditorFamily.familyHex} />
                      : s.creditorName}
                  </span>
                  <button className={styles.settleBtn} onClick={() => openSettlementModal(s)}>Settle</button>
                </div>
              );
            })
          )}
        </section>

        <section>
          <div className={styles.sectionHeader}>Total Spend ({getCurrencySymbol()}{groupTotal.toFixed(2)})</div>
          {totals.map(t => (
            <div key={t.userId} className={`${styles.totalRow}${t.userId === currentUserId ? ` ${styles.totalRowHighlighted}` : ''}`}>
              <span className={styles.totalName}>
                <span className={styles.totalNameText}>{t.name}</span>
                {t.family && <FamilyTag familyName={t.family.familyName} familyHex={t.family.familyHex} />}
              </span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${Math.min(100, t.percent)}%` }} />
              </div>
              <span className={styles.totalPercent}>{t.percent.toFixed(0)}%</span>
              <span className={styles.totalAmount}>{getCurrencySymbol()}{t.total.toFixed(2)}</span>
            </div>
          ))}
        </section>
      </div>

      {pendingSettlement && (
        <SettlementModal
          groupId={groupId}
          settlement={pendingSettlement}
          onClose={() => setPendingSettlement(null)}
        />
      )}
    </div>
  );
}
