'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GroupListItem,
  GroupSortKey,
  GroupStatusFilterKey,
  SortDirection,
  CreateGroupInput,
  CreateGroupResponse,
} from '@/types/index';
import { matchesStatus, sortGroups } from '@/lib/group-format';
import { GroupsToolbar } from '@/components/dashboard/GroupsToolbar';
import { GroupStatusFilter } from '@/components/dashboard/GroupStatusFilter';
import { GroupListRow } from '@/components/dashboard/GroupListRow';
import { CreateGroupModal } from '@/components/dashboard/CreateGroupModal';
import { JoinGroupModal } from '@/components/dashboard/JoinGroupModal';
import { PlusIcon, LoginIcon } from '@/components/dashboard/group-icons';
import styles from './groups.module.css';

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<GroupStatusFilterKey>('all');
  const [sortKey, setSortKey] = useState<GroupSortKey>('recent');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/groups');
      if (!res.ok) throw new Error('Could not load your groups.');
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
      setLoadError('');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load your groups.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo<Record<GroupStatusFilterKey, number>>(
    () => ({
      all: groups.length,
      owe: groups.filter((g) => g.net < 0).length,
      owed: groups.filter((g) => g.net > 0).length,
      settled: groups.filter((g) => g.net === 0).length,
    }),
    [groups],
  );

  const totalExpenses = useMemo(
    () => groups.reduce((sum, g) => sum + g.expenseCount, 0),
    [groups],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = groups.filter(
      (g) => matchesStatus(g.net, filter) && g.name.toLowerCase().includes(q),
    );
    return sortGroups(filtered, sortKey, sortDir);
  }, [groups, query, filter, sortKey, sortDir]);

  const handleCreate = async (input: CreateGroupInput): Promise<CreateGroupResponse> => {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || 'Could not create group.');
    }
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    await load();
    return data;
  };

  const handleJoin = async (code: string) => {
    const res = await fetch('/api/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'No group matches that code.');
    }
    await load();
    return { groupId: '', groupName: 'Group' };
  };

  const handleViewGroup = (groupId: string) => {
    // Navigate to group detail page if needed, or just close the modal
    // For now, just reload the groups list
    load();
  };

  const emptyState = (() => {
    if (query.trim())
      return { title: `No groups match "${query.trim()}".`, hint: '// search filters group names' };
    if (filter === 'owe')
      return { title: "You're all paid up here.", hint: '// nothing you owe' };
    if (filter === 'owed')
      return { title: 'No one owes you here.', hint: '// nothing owed to you' };
    if (filter === 'settled')
      return { title: 'No settled groups yet.', hint: '// settle up to see them here' };
    return { title: 'No groups yet.', hint: '// create one or join with a code to get started' };
  })();

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Groups</h1>
          <p className={styles.subtitle}>
            <span className={styles.num}>{groups.length}</span> groups
            <span className={styles.sep}>·</span>
            {totalExpenses} expenses
            <span className={styles.sep}>·</span>
            <span className={styles.neg}>{counts.owe}</span> need settling
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.joinBtn} onClick={() => setJoinOpen(true)}>
            <LoginIcon size={15} /> Join group
          </button>
          <button className={styles.createBtn} onClick={() => setCreateOpen(true)}>
            <PlusIcon size={15} /> Create group
          </button>
        </div>
      </header>

      <GroupsToolbar
        query={query}
        onQuery={setQuery}
        sortKey={sortKey}
        onSortKey={setSortKey}
        sortDir={sortDir}
        onToggleDir={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
      />

      <GroupStatusFilter active={filter} counts={counts} onChange={setFilter} />

      <div className={styles.list}>
        {loading ? (
          <div className={styles.listState}>
            Loading your groups…
            <div className={styles.listStateHint}>// fetching from group-view-svc</div>
          </div>
        ) : loadError ? (
          <div className={styles.listState}>
            {loadError}
            <div className={styles.listStateHint}>// try refreshing the page</div>
          </div>
        ) : visible.length === 0 ? (
          <div className={styles.listState}>
            {emptyState.title}
            <div className={styles.listStateHint}>{emptyState.hint}</div>
          </div>
        ) : (
          visible.map((g) => <GroupListRow key={g.id} group={g} />)
        )}
      </div>

      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
      <JoinGroupModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoin={handleJoin}
        onViewGroup={handleViewGroup}
      />
    </>
  );
}
