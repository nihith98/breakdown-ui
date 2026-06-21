'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GroupInfo, GroupInfoFamily, GroupInfoPerson } from '@/types';
import { removeMember } from '@/app/(dashboard)/groups/[id]/actions';
import { CheckIcon } from './group-icons';
import { FamilyTag } from './FamilyTag';
import { FamilyModal } from './FamilyModal';
import styles from './MembersPage.module.css';

interface Props {
  groupId: string;
  groupInfo: GroupInfo;
  currentUserId: string;
}

interface FamilyGroup {
  familyId: string | null;
  familyName: string;
  members: GroupInfoPerson[];
}

function formatMemberNames(members: GroupInfoPerson[]): string {
  const names = members.map(m => m.displayName).join(', ');
  return names.length > 50 ? names.slice(0, 47) + '...' : names;
}

function deriveFamilyId(person: GroupInfoPerson, groupInfo: GroupInfo): string | null {
  if (person.familyId) return person.familyId;
  const family = groupInfo.familyList?.find(f => f.memberIds.includes(person.userId));
  return family?.familyId ?? null;
}

export function MembersPage({ groupId, groupInfo, currentUserId }: Props) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [removeError, setRemoveError] = useState('');
  const [selfRemoved, setSelfRemoved] = useState(false);
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showEditFamily, setShowEditFamily] = useState(false);
  const [editingFamily, setEditingFamily] = useState<GroupInfoFamily | undefined>(undefined);

  const familyGroups: FamilyGroup[] = [];
  const noFamily: GroupInfoPerson[] = [];

  groupInfo.personList.forEach(person => {
    const familyId = deriveFamilyId(person, groupInfo);
    if (!familyId) {
      noFamily.push(person);
      return;
    }
    const family = groupInfo.familyList?.find(f => f.familyId === familyId);
    let group = familyGroups.find(g => g.familyId === familyId);
    if (!group) {
      group = { familyId, familyName: family?.familyName ?? 'Family', members: [] };
      familyGroups.push(group);
    }
    group.members.push(person);
  });

  const familyCount = familyGroups.length;
  const memberCount = groupInfo.personList.length;

  async function handleRemove(userId: string, displayName: string) {
    setRemoveError('');
    try {
      await removeMember(groupId, userId);
      const isSelf = userId === currentUserId;
      setSelfRemoved(isSelf);
      setSuccessMessage(isSelf ? 'You left the group.' : `${displayName} was removed from the group.`);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  }

  function closeSuccess() {
    setSuccessMessage('');
    if (selfRemoved) {
      router.push('/groups');
    } else {
      router.refresh();
    }
  }

  return (
    <div className={styles.wrap}>
      <button className={styles.backLink} onClick={() => router.push(`/groups/${groupId}`)}>‹ Group</button>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Members</h1>
        <span className={styles.countBadge}>{memberCount} members · {familyCount} families</span>
      </div>
      <p className={styles.groupName}>{`// ${groupInfo.groupName}`}</p>
      <p className={styles.infoLine}>{'// Add families. Families will be able to settle together as a single entity.'}</p>
      <p className={styles.infoLine}>{'// Members with a pending settlement cannot be removed from the group.'}</p>

      {removeError && <p className={styles.removeError}>{removeError}</p>}

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={() => setShowCreateFamily(true)}>
          Create Family
        </button>
        <button
          className={styles.btnGhost}
          disabled={familyGroups.length === 0}
          onClick={() => {
            setEditingFamily(familyGroups.length === 1 ? groupInfo.familyList?.find(f => f.familyId === familyGroups[0].familyId) : undefined);
            setShowEditFamily(true);
          }}
        >
          Edit Family
        </button>
      </div>

      <div className={styles.content}>
        {familyGroups.map(group => (
          <div className={styles.familySection} key={group.familyId}>
            <div className={styles.familyHeader}>
              {group.familyName}
              <span className={styles.familyCount}>{group.members.length} member{group.members.length !== 1 ? 's' : ''} · {formatMemberNames(group.members)}</span>
            </div>
            {(() => {
              const familyObj = groupInfo.familyList?.find(f => f.familyId === group.familyId);
              return group.members.map(member => (
                <div className={styles.memberRow} key={member.userId}>
                  <div className={styles.avatar} aria-hidden="true">{(member.displayName[0] ?? '?').toUpperCase()}</div>
                  <span className={styles.memberName}>{member.displayName}</span>
                  {familyObj && <FamilyTag familyName={familyObj.familyName} familyHex={familyObj.familyHex} />}
                  {member.userId === currentUserId && <span className={styles.youTag}>you</span>}
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(member.userId, member.displayName)}
                  >
                    {member.userId === currentUserId ? '✕ Leave' : '✕ Remove'}
                  </button>
                </div>
              ));
            })()}
          </div>
        ))}

        {noFamily.length > 0 && (
          <div className={styles.familySection}>
            <div className={styles.familyHeader}>
              No family
              <span className={styles.familyCount}>{noFamily.length} member{noFamily.length !== 1 ? 's' : ''} · {formatMemberNames(noFamily)}</span>
            </div>
            {noFamily.map(member => (
              <div className={styles.memberRow} key={member.userId}>
                <div className={styles.avatar} aria-hidden="true">{(member.displayName[0] ?? '?').toUpperCase()}</div>
                <span className={styles.memberName}>{member.displayName}</span>
                {member.userId === currentUserId && <span className={styles.youTag}>you</span>}
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemove(member.userId, member.displayName)}
                >
                  {member.userId === currentUserId ? '✕ Leave' : '✕ Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateFamily && (
        <FamilyModal
          groupId={groupId}
          groupInfo={groupInfo}
          mode="create"
          onClose={() => setShowCreateFamily(false)}
        />
      )}

      {showEditFamily && (
        <FamilyModal
          groupId={groupId}
          groupInfo={groupInfo}
          mode="edit"
          editFamily={editingFamily}
          onClose={() => { setShowEditFamily(false); setEditingFamily(undefined); }}
        />
      )}

      {successMessage && (
        <div className={styles.scrim} onClick={closeSuccess}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={selfRemoved ? 'Left group' : 'Member removed'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>{selfRemoved ? 'Left group' : 'Member removed'}</h2>
              <button className={styles.modalClose} onClick={closeSuccess} aria-label="Close">
                ✕
              </button>
            </div>
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>
                <CheckIcon size={24} />
              </div>
              <p className={styles.successMessage}>{successMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
