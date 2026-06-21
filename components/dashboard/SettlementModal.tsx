'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InsertSettlementInput } from '@/types';
import { createSettlement } from '@/app/(dashboard)/groups/[id]/actions';
import { FamilyTag } from './FamilyTag';
import styles from './SettlementModal.module.css';
import { getCurrencySymbol, getCurrencyName } from '@/lib/currency';

type FamilyMemberEntry = { userId: string; displayName: string };

interface SettlementModalProps {
  groupId: string;
  settlement: {
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
  };
  onClose: () => void;
}

export function SettlementModal({ groupId, settlement, onClose }: SettlementModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(settlement.amount.toFixed(2));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDebtorId, setSelectedDebtorId] = useState(
    settlement.debtorFamilyMembers?.length ? settlement.debtorFamilyMembers[0].userId : settlement.debtorId
  );
  const [selectedCreditorId, setSelectedCreditorId] = useState(
    settlement.creditorFamilyMembers?.length ? settlement.creditorFamilyMembers[0].userId : settlement.creditorId
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError('Amount must be greater than 0'); return; }
    if (num > settlement.amount + 0.005) {
      setError(`Cannot exceed original amount of ${getCurrencySymbol()}${settlement.amount.toFixed(2)}`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const input: InsertSettlementInput = {
        transactionName: 'Settlement',
        transactionDescription: 'Settlement',
        transactionType: 'SETTLEMENT',
        amount: Math.round(num * 100) / 100,
        paidById: selectedDebtorId,
        paidForList: [{
          paidForId: selectedCreditorId,
          paidForValue: Math.round(num * 100) / 100,
        }],
        splitType: 'AMOUNT',
        timestamp: null,
        groupId,
        transactionStatus: 'COMPLETE',
      };
      await createSettlement(groupId, input);
      setSuccess(true);
      setTimeout(() => { router.refresh(); onClose(); }, 1700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record settlement');
    } finally {
      setSubmitting(false);
    }
  }

  function renderPartyField(
    label: string,
    name: string,
    familyName: string | undefined,
    familyHex: string | undefined,
    familyMembers: FamilyMemberEntry[] | undefined,
    selectedId: string,
    setSelectedId: (id: string) => void,
  ) {
    if (familyMembers && familyMembers.length > 0 && familyName && familyHex) {
      return (
        <div className={styles.field}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label className={styles.fieldLabel}>{label}</label>
            <FamilyTag familyName={familyName} familyHex={familyHex} />
          </div>
          <div className={styles.selectWrapper}>
            <select
              className={`${styles.input} ${styles.selectInput}`}
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
            >
              {familyMembers.map(m => (
                <option key={m.userId} value={m.userId}>{m.displayName} [{familyName}]</option>
              ))}
            </select>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.field}>
        <label className={styles.fieldLabel}>{label}</label>
        <div className={styles.lockedField}>
          <div className={styles.avatar}>{name[0]?.toUpperCase()}</div>
          <span className={styles.lockedName}>{name}</span>
          <span className={styles.lockedTag}>locked</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.modalScrim} onClick={onClose} />
      <div className={styles.modalBox} role="dialog" aria-modal="true" aria-label="Settle Up">

        <div className={styles.header}>
          <div>
            <div className={styles.title}>Settle Up</div>
            <div className={styles.headerNote}>// confirm and record this settlement</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {success ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✓</div>
            <span className={styles.successText}>// settlement recorded successfully</span>
            <span className={styles.successMeta}>transactionStatus: &quot;COMPLETE&quot;</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.body}>

              {renderPartyField(
                'Paid By',
                settlement.debtorName,
                settlement.debtorFamilyName,
                settlement.debtorFamilyHex,
                settlement.debtorFamilyMembers,
                selectedDebtorId,
                setSelectedDebtorId,
              )}

              <div className={styles.direction}>
                <div className={styles.dirLine} />
                <span className={styles.dirLabel}>↓ pays</span>
                <div className={styles.dirLine} />
              </div>

              {renderPartyField(
                'Paid To',
                settlement.creditorName,
                settlement.creditorFamilyName,
                settlement.creditorFamilyHex,
                settlement.creditorFamilyMembers,
                selectedCreditorId,
                setSelectedCreditorId,
              )}

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="settle-amount">Amount ({getCurrencyName()})</label>
                <input
                  id="settle-amount"
                  className={styles.input}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
                <span className={styles.amountHint}>
                  {`// partial settlement allowed — max ${getCurrencySymbol()}${settlement.amount.toFixed(2)}`}
                </span>
              </div>

              {error && (
                <div className={styles.errorBanner}>
                  <span className={styles.errorText}>{error}</span>
                </div>
              )}

            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Confirming…' : 'Confirm Settlement'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
