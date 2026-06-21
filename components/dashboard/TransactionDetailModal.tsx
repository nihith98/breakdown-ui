'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Transaction } from '@/types';
import { getDollarShare, formatShortDate } from '@/lib/group-format';
import { getCurrencySymbol } from '@/lib/currency';
import { deleteTransaction } from '@/app/(dashboard)/groups/[id]/actions';
import styles from './TransactionDetailModal.module.css';

interface Props {
  transaction: Transaction;
  memberMap: Record<string, string>;
  currentUserId: string;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
}

function resolveName(userId: string, memberMap: Record<string, string>, explicitName?: string | null) {
  return explicitName ?? memberMap[userId] ?? userId;
}

function splitUnitLabel(tx: Transaction, value: number): string {
  if (tx.splitType === 'SHARES') return `${value} share${value !== 1 ? 's' : ''}`;
  if (tx.splitType === 'PERCENTAGE') return `${value}%`;
  return '';
}

export function TransactionDetailModal({ transaction, memberMap, currentUserId, onClose, onEdit }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirming) setConfirming(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, confirming]);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteTransaction(transaction.groupId, transaction.transactionId);
      router.refresh();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      setDeleting(false);
    }
  }

  const paidByName = resolveName(transaction.paidById, memberMap, transaction.paidByName);
  const isPayer = transaction.paidById === currentUserId;
  const userEntry = transaction.paidForList.find(e => e.paidForId === currentUserId);
  const involved = isPayer || !!userEntry;

  let net = 0;
  if (isPayer) {
    net = transaction.amount - getDollarShare(transaction, currentUserId);
  } else if (userEntry) {
    net = -getDollarShare(transaction, currentUserId);
  }
  const netSign: 'positive' | 'negative' | 'neutral' = net > 0 ? 'positive' : net < 0 ? 'negative' : 'neutral';

  return (
    <>
      <div className={styles.modalScrim} onClick={onClose} />
      <div className={styles.modalBox} role="dialog" aria-modal="true" aria-label="Transaction detail">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={`${styles.badge}${transaction.transactionType === 'EXPENSE' ? ` ${styles.badgeExpense}` : ` ${styles.badgeSettlement}`}`}>
              {transaction.transactionType}
            </span>
            <span className={styles.txnTitle}>&ldquo;{transaction.transactionName}&rdquo;</span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.editBtn} onClick={() => onEdit(transaction)}>Edit</button>
            <button
              className={styles.deleteHeaderBtn}
              onClick={() => setConfirming(true)}
              aria-label="Delete expense"
            >
              Delete
            </button>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.grid2}>
            <div>
              <div className={styles.fieldLabel}>Amount</div>
              <div className={styles.amountLarge}>{getCurrencySymbol()}{transaction.amount.toFixed(2)}</div>
            </div>
            <div>
              <div className={styles.fieldLabel}>Paid By</div>
              <div className={styles.paidByRow}>
                <div className={styles.avatar} aria-hidden="true">{(paidByName[0] ?? '?').toUpperCase()}</div>
                <span className={styles.paidByName}>{paidByName}</span>
                {isPayer && <span className={styles.youChip}>you</span>}
              </div>
            </div>
          </div>

          {involved && (
            <div className={styles.netCallout} data-sign={netSign}>
              {`// your net on this transaction → ${getCurrencySymbol()}${Math.abs(net).toFixed(2)}`}
            </div>
          )}

          {transaction.transactionDescription && (
            <div className={styles.description}>{`// ${transaction.transactionDescription}`}</div>
          )}

          <div className={styles.metaRow}>
            <span>Split: {transaction.splitType}</span>
            {transaction.timestamp && <span>· {formatShortDate(transaction.timestamp)}</span>}
            <span>· {transaction.paidForList.length} members</span>
          </div>

          <div className={styles.splitBlock}>
            <div className={styles.splitBrace}>{'{'}</div>
            {transaction.paidForList.map(entry => {
              const name = resolveName(entry.paidForId, memberMap, entry.paidForName);
              const dollar = getDollarShare(transaction, entry.paidForId);
              const unit = splitUnitLabel(transaction, entry.paidForValue);
              return (
                <div className={styles.splitRow} key={entry.paidForId}>
                  <span className={styles.splitName}>&ldquo;{name}&rdquo;</span>
                  {entry.paidForId === currentUserId && <span className={styles.youChip}>you</span>}
                  {unit && <span className={styles.splitUnit}>{unit}</span>}
                  <span className={styles.splitArrow}>→</span>
                  <span className={styles.splitAmount}>{getCurrencySymbol()}{dollar.toFixed(2)}</span>
                </div>
              );
            })}
            <div className={styles.splitBrace}>{'}'}</div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <span className={styles.errorText}>{error}</span>
            </div>
          )}
        </div>

        {confirming ? (
          <div className={styles.confirmFooter}>
            <span className={styles.confirmText}>// delete this expense?</span>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirming(false)} disabled={deleting}>
                Cancel
              </button>
              <button className={styles.confirmDeleteBtn} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.footer}>
            <button className={styles.closeFooterBtn} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </>
  );
}
