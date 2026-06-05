'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { CreateGroupInput } from '@/types/index';
import { PlusIcon, LinkIcon } from './group-icons';
import styles from '@/app/(dashboard)/groups/groups.module.css';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreateGroupInput) => Promise<void>;
}

export function CreateGroupModal({ open, onClose, onCreate }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setError('');
      setSubmitting(false);
      const t = setTimeout(() => nameRef.current?.focus(), 30);
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
    if (!name.trim()) {
      setError('Give the group a name.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onCreate({ name: name.trim(), description: description.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create group.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Create group"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>Create group</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className={styles.modalSub}>// name it, then share the invite link to start splitting</p>

        <form onSubmit={submit}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="g-name">
              Group name
            </label>
            <input
              id="g-name"
              ref={nameRef}
              className={styles.fieldInput}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Sept Hawaii trip"
            />
            {error && <span className={styles.fieldError}>{error}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="g-desc">
              Description <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="g-desc"
              className={`${styles.fieldInput} ${styles.fieldTextarea}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What's this group for? e.g. Sept trip to Maui — flights, food, rentals."
            />
          </div>

          <div className={styles.inviteNote}>
            <LinkIcon size={14} />
            <span>Members can join using group code once the group exists.</span>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnGhost} onClick={onClose} disabled={submitting}>
              CANCEL
            </button>
            <button type="submit" className={styles.createBtn} disabled={submitting}>
              <PlusIcon size={15} /> {submitting ? 'CREATING…' : 'CREATE GROUP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
