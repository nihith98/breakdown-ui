'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { LoginIcon, LinkIcon } from './group-icons';
import styles from '@/app/(dashboard)/groups/groups.module.css';

interface JoinGroupModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
}

export function JoinGroupModal({ open, onClose, onJoin }: JoinGroupModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCode('');
      setError('');
      setSubmitting(false);
      const t = setTimeout(() => ref.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = code.trim().toUpperCase();
    if (!value) {
      setError('Enter a group code.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onJoin(value);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No group matches that code.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Join a group"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>Join a group</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className={styles.modalSub}>// paste a group code someone shared with you</p>

        <form onSubmit={submit}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="j-code">
              Group code
            </label>
            <input
              id="j-code"
              ref={ref}
              className={`${styles.fieldInput} ${styles.codeInput}`}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              placeholder="e.g. TAHOE-4F2"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
            {error && <span className={styles.fieldError}>{error}</span>}
          </div>

          <div className={styles.inviteNote}>
            <LinkIcon size={14} />
            <span>Codes are case-insensitive. Ask a member for the group&apos;s code.</span>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnGhost} onClick={onClose} disabled={submitting}>
              CANCEL
            </button>
            <button type="submit" className={styles.createBtn} disabled={submitting}>
              <LoginIcon size={15} /> {submitting ? 'JOINING…' : 'JOIN GROUP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
