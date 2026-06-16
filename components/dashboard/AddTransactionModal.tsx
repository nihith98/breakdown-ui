'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GroupInfoPerson, InsertTransactionInput, SplitType, Transaction } from '@/types';
import { insertTransaction, updateTransaction } from '@/app/(dashboard)/groups/[id]/actions';
import styles from './AddTransactionModal.module.css';

interface Props {
  groupId: string;
  personList: GroupInfoPerson[];
  transaction?: Transaction | null;
  currentUserId: string;
  onClose: () => void;
}

const SPLIT_TYPES: { id: SplitType; label: string }[] = [
  { id: 'EQUAL', label: 'Equal' },
  { id: 'SHARES', label: 'Shares' },
  { id: 'PERCENTAGE', label: 'Percent' },
  { id: 'AMOUNT', label: 'Amount' },
];

function defaultSplitValues(splitType: SplitType, amount: number, memberIds: string[]): Record<string, number> {
  const n = memberIds.length || 1;
  const values: Record<string, number> = {};
  memberIds.forEach(id => {
    if (splitType === 'EQUAL') values[id] = Math.round((amount / n) * 100) / 100;
    else if (splitType === 'SHARES') values[id] = 1;
    else if (splitType === 'PERCENTAGE') values[id] = Math.round((100 / n) * 100) / 100;
    else values[id] = Math.round((amount / n) * 100) / 100;
  });
  return values;
}

export function AddTransactionModal({ groupId, personList, transaction, currentUserId, onClose }: Props) {
  const router = useRouter();
  const isEdit = !!transaction;

  const allMemberIds = useMemo(() => personList.map(p => p.userId), [personList]);

  const [name, setName] = useState(transaction?.transactionName ?? '');
  const [description, setDescription] = useState(transaction?.transactionDescription ?? '');
  const [amount, setAmount] = useState<string>(transaction ? String(transaction.amount) : '');
  const [paidById, setPaidById] = useState(transaction?.paidById ?? currentUserId ?? personList[0]?.userId ?? '');
  const [paidForEditOpen, setPaidForEditOpen] = useState(false);
  const [paidForIds, setPaidForIds] = useState<string[]>(
    transaction ? transaction.paidForList.map(e => e.paidForId) : allMemberIds
  );
  const [splitType, setSplitType] = useState<SplitType>((transaction?.splitType as SplitType) ?? 'EQUAL');
  const [splitValues, setSplitValues] = useState<Record<string, number>>(() => {
    if (transaction) {
      const v: Record<string, number> = {};
      transaction.paidForList.forEach(e => { v[e.paidForId] = e.paidForValue; });
      return v;
    }
    return defaultSplitValues('EQUAL', 0, allMemberIds);
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const numericAmount = parseFloat(amount) || 0;

  function applySplitType(type: SplitType) {
    setSplitType(type);
    setSplitValues(defaultSplitValues(type, numericAmount, paidForIds));
  }

  function toggleMember(userId: string) {
    setPaidForIds(prev => {
      const next = prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId];
      setSplitValues(defaultSplitValues(splitType, numericAmount, next));
      return next;
    });
  }

  function selectAll() {
    setPaidForIds(allMemberIds);
    setSplitValues(defaultSplitValues(splitType, numericAmount, allMemberIds));
  }

  function setSplitValue(userId: string, value: number) {
    setSplitValues(prev => ({ ...prev, [userId]: value }));
  }

  const runningTotal = paidForIds.reduce((s, id) => s + (splitValues[id] ?? 0), 0);
  const splitSummary = useMemo(() => {
    if (splitType === 'PERCENTAGE') {
      const ok = Math.abs(runningTotal - 100) < 0.01;
      return { text: `${runningTotal.toFixed(2)}% of 100%`, ok };
    }
    if (splitType === 'AMOUNT') {
      const ok = Math.abs(runningTotal - numericAmount) < 0.01;
      return { text: `$${runningTotal.toFixed(2)} of $${numericAmount.toFixed(2)}`, ok };
    }
    if (splitType === 'SHARES') {
      return { text: `${runningTotal} total shares`, ok: runningTotal > 0 };
    }
    return { text: `$${runningTotal.toFixed(2)} of $${numericAmount.toFixed(2)}`, ok: true };
  }, [splitType, runningTotal, numericAmount]);

  function validate(): string[] {
    const errs: string[] = [];
    if (!name.trim()) errs.push('Name is required');
    if (!numericAmount || numericAmount <= 0) errs.push('Amount must be a positive number');
    if (paidForIds.length === 0) errs.push('Select at least one member to split with');
    if (splitType === 'PERCENTAGE' && Math.abs(runningTotal - 100) > 0.01) errs.push('Percent split must sum to 100%');
    if (splitType === 'AMOUNT' && Math.abs(runningTotal - numericAmount) > 0.01) errs.push('Amount split must sum to the total amount');
    if (splitType === 'SHARES' && runningTotal <= 0) errs.push('Shares must total more than 0');
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;

    setSubmitting(true);
    try {
      const paidForList = paidForIds.map(id => ({
        paidForId: id,
        paidForValue: splitType === 'EQUAL'
          ? Math.round((numericAmount / paidForIds.length) * 100) / 100
          : (splitValues[id] ?? 0),
      }));

      const input: InsertTransactionInput = {
        transactionName: name.trim(),
        transactionDescription: description.trim() || undefined,
        transactionType: 'EXPENSE',
        amount: numericAmount,
        paidById,
        paidForList,
        splitType,
        timestamp: null,
        groupId,
        transactionStatus: 'INCOMPLETE',
      };

      if (isEdit && transaction) {
        await updateTransaction(groupId, transaction.transactionId, input);
      } else {
        await insertTransaction(groupId, input);
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrors([err.message || 'Failed to submit transaction']);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className={styles.modalScrim} onClick={onClose} />
      <div className={styles.modalBox} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit Transaction' : 'Add Transaction'}>
        <div className={styles.header}>
          <span className={styles.title}>{isEdit ? 'Edit Transaction' : 'Add Transaction'}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {success ? (
          <div className={styles.successState}>
            <span className={styles.successText}>// payload queued for API submission</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.body}>
              {errors.length > 0 && (
                <div className={styles.field}>
                  {errors.map((err, i) => <span key={i} className={styles.errorText}>{err}</span>)}
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="txn-name">Name</label>
                <input id="txn-name" className={styles.input} placeholder="e.g. Dinner at Luigi's" value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="txn-desc">Description</label>
                <input id="txn-desc" className={styles.input} placeholder="Add a note (optional)" value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="txn-amount">Amount (USD)</label>
                  <input
                    id="txn-amount"
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => {
                      setAmount(e.target.value);
                      const next = parseFloat(e.target.value) || 0;
                      if (splitType === 'EQUAL' || splitType === 'AMOUNT') {
                        setSplitValues(defaultSplitValues(splitType, next, paidForIds));
                      }
                    }}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="txn-paidby">Paid By</label>
                  <select id="txn-paidby" className={styles.select} value={paidById} onChange={e => setPaidById(e.target.value)}>
                    {personList.map(p => (
                      <option key={p.userId} value={p.userId}>{p.userId === currentUserId ? 'You' : p.displayName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Paid For</label>
                <div className={styles.paidForSummary}>
                  <span className={styles.paidForSummaryText}>
                    {paidForIds.length === allMemberIds.length ? `All ${allMemberIds.length} members` : `${paidForIds.length} of ${allMemberIds.length} members`}
                  </span>
                  <button type="button" className={styles.linkBtn} onClick={() => setPaidForEditOpen(o => !o)}>
                    {paidForEditOpen ? 'Done' : 'Edit'}
                  </button>
                </div>
                {paidForEditOpen && (
                  <div className={styles.checkboxList}>
                    <button type="button" className={styles.selectAllBtn} onClick={selectAll}>Select All</button>
                    {personList.map(p => (
                      <label key={p.userId} className={styles.checkboxRow}>
                        <input
                          type="checkbox"
                          checked={paidForIds.includes(p.userId)}
                          onChange={() => toggleMember(p.userId)}
                        />
                        {p.displayName}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Split Type</label>
                <div className={styles.segmented}>
                  {SPLIT_TYPES.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      className={`${styles.segmentBtn}${splitType === st.id ? ` ${styles.segmentBtnActive}` : ''}`}
                      onClick={() => applySplitType(st.id)}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Split Breakdown</label>
                <div className={styles.splitRows}>
                  {paidForIds.map(id => {
                    const person = personList.find(p => p.userId === id);
                    const value = splitValues[id] ?? 0;
                    const dollar = splitType === 'EQUAL'
                      ? Math.round((numericAmount / (paidForIds.length || 1)) * 100) / 100
                      : splitType === 'SHARES'
                        ? (runningTotal > 0 ? Math.round((value / runningTotal) * numericAmount * 100) / 100 : 0)
                        : splitType === 'PERCENTAGE'
                          ? Math.round((value / 100) * numericAmount * 100) / 100
                          : value;
                    return (
                      <div className={styles.splitRow} key={id}>
                        <span className={styles.splitRowName}>{person?.displayName ?? id}</span>
                        <input
                          className={styles.splitRowInput}
                          type="number"
                          step={splitType === 'SHARES' ? 1 : 0.01}
                          min="0"
                          disabled={splitType === 'EQUAL'}
                          value={splitType === 'EQUAL' ? dollar : value}
                          onChange={e => {
                            const raw = parseFloat(e.target.value) || 0;
                            setSplitValue(id, splitType === 'SHARES' ? Math.round(raw) : raw);
                          }}
                        />
                        {splitType !== 'AMOUNT' && splitType !== 'EQUAL' && (
                          <span className={styles.splitRowComputed}>${dollar.toFixed(2)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <span className={styles.runningSummary} data-ok={splitSummary.ok}>{splitSummary.text}</span>
              </div>
            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Submitting…' : isEdit ? 'Save Changes' : 'Add Transaction'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
