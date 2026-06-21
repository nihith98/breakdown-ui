'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GroupInfo, GroupInfoFamily, ManageFamiliesInput } from '@/types';
import { manageFamilies } from '@/app/(dashboard)/groups/[id]/actions';
import { FamilyTag, FAMILY_COLORS } from './FamilyTag';
import styles from './FamilyModal.module.css';

interface Props {
  groupId: string;
  groupInfo: GroupInfo;
  mode: 'create' | 'edit';
  editFamily?: GroupInfoFamily;
  onClose: () => void;
}

export function FamilyModal({ groupId, groupInfo, mode, editFamily, onClose }: Props) {
  const router = useRouter();
  const families = groupInfo.familyList ?? [];

  const initialSelected: GroupInfoFamily | null = (() => {
    if (mode === 'edit') {
      if (editFamily !== undefined) return editFamily;
      if (families.length === 1) return families[0];
      return null;
    }
    return null;
  })();

  const [selectedFamily, setSelectedFamily] = useState<GroupInfoFamily | null>(initialSelected);
  const showPicker = mode === 'edit' && selectedFamily === null;

  const [familyName, setFamilyName] = useState(initialSelected?.familyName ?? '');
  const [familyHex, setFamilyHex] = useState(initialSelected?.familyHex ?? FAMILY_COLORS[0]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(initialSelected?.memberIds ?? []);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSelectFamily(f: GroupInfoFamily) {
    setSelectedFamily(f);
    setFamilyName(f.familyName);
    setFamilyHex(f.familyHex ?? FAMILY_COLORS[0]);
    setSelectedMemberIds(f.memberIds);
  }

  function toggleMember(userId: string) {
    setSelectedMemberIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }

  function isMemberInOtherFamily(userId: string): boolean {
    return families.some(f => {
      if (selectedFamily && f.familyId === selectedFamily.familyId) return false;
      return f.memberIds.includes(userId);
    });
  }

  function getOtherFamilyForMember(userId: string): GroupInfoFamily | null {
    return families.find(f => {
      if (selectedFamily && f.familyId === selectedFamily.familyId) return false;
      return f.memberIds.includes(userId);
    }) ?? null;
  }

  async function handleSave() {
    const errs: string[] = [];
    if (!familyName.trim()) errs.push('Family name is required');
    if (selectedMemberIds.length === 0) errs.push('Add at least one member');
    if (errs.length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors([]);
    try {
      const newEntry = {
        familyName: familyName.trim(),
        familyHex,
        personIds: selectedMemberIds.map(id => ({
          personId: id,
          displayName: groupInfo.personList.find(p => p.userId === id)?.displayName ?? id,
        })),
      };

      let updatedFamilies: ManageFamiliesInput['familyList'];

      if (mode === 'create') {
        const existing = families.map(f => ({
          familyId: f.familyId,
          familyName: f.familyName,
          familyHex: f.familyHex,
          personIds: f.memberIds.map(id => ({
            personId: id,
            displayName: groupInfo.personList.find(p => p.userId === id)?.displayName ?? id,
          })),
        }));
        updatedFamilies = [...existing, newEntry];
      } else {
        updatedFamilies = families.map(f =>
          f.familyId === selectedFamily?.familyId
            ? { familyId: f.familyId, ...newEntry }
            : {
                familyId: f.familyId,
                familyName: f.familyName,
                familyHex: f.familyHex,
                personIds: f.memberIds.map(id => ({
                  personId: id,
                  displayName: groupInfo.personList.find(p => p.userId === id)?.displayName ?? id,
                })),
              }
        );
      }

      await manageFamilies(groupId, { familyList: updatedFamilies });
      setSuccess(true);
      setTimeout(() => { router.refresh(); onClose(); }, 1400);
    } catch (err: unknown) {
      setErrors([err instanceof Error ? err.message : 'Failed to save family']);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className={styles.scrim} onClick={onClose} />
      <div className={styles.modalBox} role="dialog" aria-modal="true" aria-label={mode === 'create' ? 'Create Family' : 'Edit Family'}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>{mode === 'create' ? 'Create Family' : 'Edit Family'}</div>
            {showPicker && <div className={styles.headerNote}>// select a family to edit</div>}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {success ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✓</div>
            <span className={styles.successText}>
              {`// family ${mode === 'create' ? 'created' : 'updated'} successfully`}
            </span>
          </div>
        ) : showPicker ? (
          <div className={styles.body}>
            <p className={styles.pickerNote}>// choose which family to edit</p>
            {families.length === 0 ? (
              <p className={styles.noFamiliesNote}>// no families exist yet</p>
            ) : (
              <div className={styles.pickerList}>
                {families.map(f => (
                  <button key={f.familyId} className={styles.pickerRow} onClick={() => handleSelectFamily(f)}>
                    <span
                      className={styles.pickerSwatch}
                      style={{ backgroundColor: f.familyHex, border: `2px solid ${f.familyHex}` }}
                    />
                    <span className={styles.pickerName}>{f.familyName}</span>
                    <span className={styles.pickerCount}>{f.memberIds.length} member{f.memberIds.length !== 1 ? 's' : ''}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={styles.body}>
              {errors.length > 0 && (
                <div className={styles.errorList}>
                  {errors.map((e, i) => <span key={i} className={styles.errorText}>{e}</span>)}
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="family-name">Family Name</label>
                <input
                  id="family-name"
                  className={styles.input}
                  placeholder="e.g. The Millers"
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Family Color</label>
                <div className={styles.colorGrid}>
                  {FAMILY_COLORS.map(hex => (
                    <button
                      key={hex}
                      type="button"
                      className={`${styles.colorSwatch}${familyHex === hex ? ` ${styles.colorSwatchSelected}` : ''}`}
                      style={{ backgroundColor: hex, color: hex }}
                      onClick={() => setFamilyHex(hex)}
                      aria-label={`Color ${hex}`}
                      aria-pressed={familyHex === hex}
                    />
                  ))}
                </div>
                <div className={styles.colorPreviewRow}>
                  <FamilyTag familyName={familyName || 'Preview'} familyHex={familyHex} />
                  <span className={styles.colorHex}>{familyHex}</span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Members</label>
                <p className={styles.membersNote}>
                  {'// Users cannot be part of multiple families. Remove users from other families to add them to this family.'}
                </p>
                <div className={styles.membersList}>
                  {groupInfo.personList.map(person => {
                    const inOtherFamily = isMemberInOtherFamily(person.userId);
                    const otherFamily = inOtherFamily ? getOtherFamilyForMember(person.userId) : null;
                    return (
                      <label
                        key={person.userId}
                        className={`${styles.memberRow}${inOtherFamily ? ` ${styles.memberRowDisabled}` : ''}`}
                      >
                        <input
                          type="checkbox"
                          disabled={inOtherFamily}
                          checked={selectedMemberIds.includes(person.userId)}
                          onChange={() => { if (!inOtherFamily) toggleMember(person.userId); }}
                        />
                        <div className={styles.memberAvatar}>
                          {(person.displayName[0] ?? '?').toUpperCase()}
                        </div>
                        <span className={styles.memberName}>{person.displayName}</span>
                        {otherFamily && (
                          <FamilyTag familyName={otherFamily.familyName} familyHex={otherFamily.familyHex} />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.cancelBtn} type="button" onClick={onClose}>Cancel</button>
              <button
                className={styles.saveBtn}
                type="button"
                onClick={handleSave}
                disabled={submitting}
              >
                {submitting ? 'Saving…' : 'Save Family'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
