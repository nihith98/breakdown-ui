import {
  GroupBalanceStatus,
  GroupListItem,
  GroupSortKey,
  SortDirection,
} from '@/types/index';

export function formatMoney(n: number): string {
  const sign = n < 0 ? '-' : '+';
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function balanceStatus(net: number): GroupBalanceStatus {
  if (net < 0) return 'owe';
  if (net > 0) return 'owed';
  return 'settled';
}

export function balanceLabel(net: number): string {
  const status = balanceStatus(net);
  if (status === 'owe') return 'You owe';
  if (status === 'owed') return 'Owed to you';
  return 'Settled';
}

export function balanceValue(net: number): string {
  return net === 0 ? 'Settled up' : formatMoney(net);
}

export function relativeTime(iso?: string): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.round(days / 7)}w ago`;
}

export function initials(username: string): string {
  return (username.trim()[0] ?? '?').toUpperCase();
}

const COMPARATORS: Record<GroupSortKey, (a: GroupListItem, b: GroupListItem) => number> = {
  recent: (a, b) =>
    new Date(b.lastTransactionTime ?? 0).getTime() -
    new Date(a.lastTransactionTime ?? 0).getTime(),
  name: (a, b) => a.name.localeCompare(b.name),
  amount: (a, b) => a.net - b.net,
};

export function sortGroups(
  groups: GroupListItem[],
  key: GroupSortKey,
  dir: SortDirection,
): GroupListItem[] {
  const sorted = [...groups].sort(COMPARATORS[key]);
  return dir === 'asc' ? sorted.reverse() : sorted;
}

export function matchesStatus(net: number, filter: 'all' | GroupBalanceStatus): boolean {
  if (filter === 'all') return true;
  return balanceStatus(net) === filter;
}
