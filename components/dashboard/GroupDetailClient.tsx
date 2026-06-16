'use client';

import { useEffect, useState } from 'react';
import { Group, GroupInfo, Transaction } from '@/types';
import { GroupHeader } from './GroupHeader';
import { TransactionList } from './TransactionList';
import { TransactionDetailModal } from './TransactionDetailModal';
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
  const [editTxn, setEditTxn] = useState<Transaction | null>(null);
  const [showAddTxn, setShowAddTxn] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTxn(null);
        setEditTxn(null);
        setShowAddTxn(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const personList = groupInfo?.personList ?? [];

  return (
    <>
      <GroupHeader
        group={group}
        transactions={transactions}
        currentUser={currentUser}
        displayName={displayName}
        onAddTransaction={() => setShowAddTxn(true)}
      />
      <TransactionList
        transactions={transactions}
        currentUser={currentUser}
        memberMap={memberMap}
        onTxnClick={tx => setSelectedTxn(tx)}
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

      {(showAddTxn || editTxn) && (
        <AddTransactionModal
          groupId={group.id}
          personList={personList}
          transaction={editTxn}
          currentUserId={currentUser}
          onClose={() => { setShowAddTxn(false); setEditTxn(null); }}
        />
      )}
    </>
  );
}
