'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { LoginIcon, CheckIcon } from './group-icons';
import styles from '@/app/(dashboard)/groups/groups.module.css';

interface JoinGroupModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<{ groupId?: string; groupName?: string }>;
  onViewGroup?: (groupId: string) => void;
}

export function JoinGroupModal({ open, onClose, onJoin, onViewGroup }: JoinGroupModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pastError, setPastError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [joinedGroupId, setJoinedGroupId] = useState('');
  const [joinedGroupName, setJoinedGroupName] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCode('');
      setError('');
      setPastError('');
      setSubmitting(false);
      setSuccessMessage('');
      setJoinedGroupId('');
      setJoinedGroupName('');
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

  const handlePaste = async () => {
    setPastError('');
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim().toLowerCase();
      if (cleaned) {
        setCode(cleaned);
        setError('');
      }
    } catch {
      setPastError('Could not access clipboard. Try pasting manually.');
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = code.trim().toLowerCase();
    if (!value) {
      setError('Enter a group code.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await onJoin(value);
      setSuccessMessage('Joined successfully.');
      setJoinedGroupId(response.groupId || '');
      setJoinedGroupName(response.groupName || 'Group');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No group matches that code.');
      setSubmitting(false);
    }
  };

  const handleViewGroup = () => {
    if (joinedGroupId && onViewGroup) {
      onViewGroup(joinedGroupId);
      onClose();
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
          <h2 className={styles.modalTitle}>{successMessage ? 'Joined group' : 'Join a group'}</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {successMessage ? (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>
              <CheckIcon size={24} />
            </div>
            <p className={styles.successMessage}>{successMessage}</p>
            <p className={styles.successHint}>// you can now see {joinedGroupName} in your groups list</p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnGhost} onClick={onClose}>
                CLOSE
              </button>
              {joinedGroupId && (
                <button type="button" className={styles.createBtn} onClick={handleViewGroup}>
                  VIEW GROUP
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className={styles.modalSub}>// paste a group code someone shared with you</p>

            <form onSubmit={submit}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="j-code">
                  Group code
                </label>
                <div className={styles.codeInputGroup}>
                  <input
                    id="j-code"
                    ref={ref}
                    className={`${styles.fieldInput} ${styles.codeInput}`}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError('');
                      setPastError('');
                    }}
                    placeholder="e.g. TAHOE-4F2"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    className={styles.pasteBtn}
                    onClick={handlePaste}
                    disabled={submitting}
                    aria-label="Paste from clipboard"
                  >
                    Paste
                  </button>
                </div>
                {error && <span className={styles.fieldError}>{error}</span>}
                {pastError && <span className={styles.fieldError}>{pastError}</span>}
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
          </>
        )}
      </div>
    </div>
  );
}
