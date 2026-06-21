'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Transaction } from '@/types';
import { formatShortDate } from '@/lib/group-format';
import { getCurrencySymbol } from '@/lib/currency';
import { deleteTransaction } from '@/app/(dashboard)/groups/[id]/actions';
import styles from './SettlementDetailModal.module.css';

interface Props {
  transaction: Transaction;
  memberMap: Record<string, string>;
  currentUserId: string;
  onClose: () => void;
}

function resolveName(userId: string, memberMap: Record<string, string>, explicitName?: string | null) {
  return explicitName ?? memberMap[userId] ?? userId;
}

export function SettlementDetailModal({ transaction, memberMap, currentUserId, onClose }: Props) {
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

  const payerName = resolveName(transaction.paidById, memberMap, transaction.paidByName);
  const payeeEntry = transaction.paidForList[0];
  const payeeName = payeeEntry
    ? resolveName(payeeEntry.paidForId, memberMap, payeeEntry.paidForName)
    : '?';

  const isCurrentUserPayer = transaction.paidById === currentUserId;
  const isCurrentUserPayee = payeeEntry?.paidForId === currentUserId;

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteTransaction(transaction.groupId, transaction.transactionId);
      router.refresh();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete settlement');
      setDeleting(false);
    }
  }

  return (
    <>
      <div className={styles.modalScrim} onClick={onClose} />
      <div className={styles.modalBox} role="dialog" aria-modal="true" aria-label="Settlement detail">

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.badge}>SETTLEMENT</span>
            <span className={styles.txnTitle}>&ldquo;{transaction.transactionName}&rdquo;</span>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.deleteHeaderBtn}
              onClick={() => setConfirming(true)}
              aria-label="Delete settlement"
            >
              Delete
            </button>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.amountSection}>
            <div className={styles.fieldLabel}>Amount</div>
            <div className={styles.amountLarge}>{getCurrencySymbol()}{transaction.amount.toFixed(2)}</div>
          </div>

          <div className={styles.flowSection}>
            <div className={styles.flowParty}>
              <div className={styles.avatar} aria-hidden="true">{(payerName[0] ?? '?').toUpperCase()}</div>
              <span className={styles.partyName}>{payerName}</span>
              {isCurrentUserPayer && <span className={styles.youChip}>you</span>}
              <div className={styles.partyRole}>paid</div>
            </div>

            <div className={styles.flowArrow} aria-hidden="true">→</div>

            <div className={styles.flowParty}>
              <div className={styles.avatar} aria-hidden="true">{(payeeName[0] ?? '?').toUpperCase()}</div>
              <span className={styles.partyName}>{payeeName}</span>
              {isCurrentUserPayee && <span className={styles.youChip}>you</span>}
              <div className={styles.partyRole}>received</div>
            </div>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaComment}>{'// settlement · direct payment'}</span>
            {transaction.timestamp && (
              <time className={styles.metaDate} dateTime={transaction.timestamp}>
                {formatShortDate(transaction.timestamp)}
              </time>
            )}
          </div>

          {transaction.transactionDescription && transaction.transactionDescription !== 'Settlement' && (
            <div className={styles.description}>{`// ${transaction.transactionDescription}`}</div>
          )}

          {error && (
            <div className={styles.errorBanner}>
              <span className={styles.errorText}>{error}</span>
            </div>
          )}
        </div>

        {confirming ? (
          <div className={styles.confirmFooter}>
            <span className={styles.confirmText}>// delete this settlement?</span>
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
