'use client';

import { useEffect, useMemo, useState } from 'react';
import { Group, GroupInfo, Transaction } from '@/types';
import { buildUserFamilyMap } from '@/lib/group-format';
import { GroupHeader } from './GroupHeader';
import { TransactionList } from './TransactionList';
import { TransactionDetailModal } from './TransactionDetailModal';
import { SettlementDetailModal } from './SettlementDetailModal';
import { AddTransactionModal } from './AddTransactionModal';

interface Props {
  group: Group;
  transactions: Transaction[];
  memberMap: Record<string, string>;
  groupInfo: GroupInfo | null;
  currentUser: string;
  displayName?: string;
}

export function GroupDetailClient({ group, transactions, memberMap, groupInfo, currentUser, displayName }: Props) {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<Transaction | null>(null);
  const [editTxn, setEditTxn] = useState<Transaction | null>(null);
  const [showAddTxn, setShowAddTxn] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTxn(null);
        setSelectedSettlement(null);
        setEditTxn(null);
        setShowAddTxn(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const personList = groupInfo?.personList ?? [];
  const userFamilyMap = useMemo(() => buildUserFamilyMap(groupInfo), [groupInfo]);

  return (
    <>
      <GroupHeader
        group={group}
        transactions={transactions}
        currentUser={currentUser}
        displayName={displayName}
        joiningCode={groupInfo?.joiningCode}
        onAddTransaction={() => setShowAddTxn(true)}
        userFamilyMap={userFamilyMap}
      />
      <TransactionList
        transactions={transactions}
        currentUser={currentUser}
        memberMap={memberMap}
        userFamilyMap={userFamilyMap}
        onTxnClick={tx => {
          if (tx.transactionType === 'SETTLEMENT') setSelectedSettlement(tx);
          else setSelectedTxn(tx);
        }}
      />

      {selectedTxn && (
        <TransactionDetailModal
          transaction={selectedTxn}
          memberMap={memberMap}
          currentUserId={currentUser}
          onClose={() => setSelectedTxn(null)}
          onEdit={tx => { setSelectedTxn(null); setEditTxn(tx); }}
        />
      )}

      {selectedSettlement && (
        <SettlementDetailModal
          transaction={selectedSettlement}
          memberMap={memberMap}
          currentUserId={currentUser}
          onClose={() => setSelectedSettlement(null)}
        />
      )}

      {(showAddTxn || editTxn) && (
        <AddTransactionModal
          groupId={group.id}
          personList={personList}
          transaction={editTxn}
          currentUserId={currentUser}
          userFamilyMap={userFamilyMap}
          onClose={() => { setShowAddTxn(false); setEditTxn(null); }}
        />
      )}
    </>
  );
}
