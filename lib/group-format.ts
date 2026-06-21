import {
  Expense,
  GroupInfo,
  Transaction,
  GroupBalanceStatus,
  GroupListItem,
  GroupSortKey,
  SortDirection,
  UserFamilyInfo,
} from '@/types/index';
import { getCurrencySymbol } from '@/lib/currency';

export function buildUserFamilyMap(groupInfo: GroupInfo | null): Record<string, UserFamilyInfo> {
  const map: Record<string, UserFamilyInfo> = {};
  if (!groupInfo?.familyList) return map;
  for (const family of groupInfo.familyList) {
    for (const memberId of family.memberIds) {
      map[memberId] = {
        familyId: family.familyId,
        familyName: family.familyName,
        familyHex: family.familyHex,
        memberCount: family.memberIds.length,
      };
    }
  }
  return map;
}

export function formatMoney(n: number): string {
  return `${getCurrencySymbol()}${Math.abs(n).toFixed(2)}`;
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

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

export function computeUserNet(txns: Expense[], user: string): number {
  let net = 0;
  txns.forEach(tx => {
    if (!tx.splitBetween.includes(user) && tx.paidBy !== user) return;
    const share = tx.amount / tx.splitBetween.length;
    if (tx.paidBy === user) net += tx.amount - share;
    else net -= share;
  });
  return Math.round(net * 100) / 100;
}

export function txnUserAmount(tx: Expense, user: string): number | null {
  const involved = tx.splitBetween.includes(user);
  const isPayer = tx.paidBy === user;
  if (!involved && !isPayer) return null;
  const share = tx.amount / tx.splitBetween.length;
  return isPayer ? tx.amount - share : -share;
}

export function txnMeta(tx: Expense, user: string): string {
  const payer = tx.paidBy === user ? 'You' : tx.paidBy;
  const n = tx.splitBetween.length;
  return `${payer} paid ${getCurrencySymbol()}${tx.amount.toFixed(2)} for ${n} member${n !== 1 ? 's' : ''}`;
}

export function computeTransactionNet(txns: Transaction[], user: string): number {
  let net = 0;
  txns.forEach(tx => {
    const userEntry = tx.paidForList.find(e => e.paidForId === user);
    const isPayer = tx.paidById === user;
    if (!userEntry && !isPayer) return;
    if (isPayer) {
      const ownShare = userEntry?.paidForValue ?? 0;
      net += tx.amount - ownShare;
    } else {
      net -= userEntry!.paidForValue;
    }
  });
  return Math.round(net * 100) / 100;
}

export function transactionUserAmount(tx: Transaction, user: string): number | null {
  const userEntry = tx.paidForList.find(e => e.paidForId === user);
  const isPayer = tx.paidById === user;
  if (!userEntry && !isPayer) return null;
  if (isPayer) {
    const ownShare = userEntry?.paidForValue ?? 0;
    return tx.amount - ownShare;
  }
  return -(userEntry!.paidForValue);
}

export function getDollarShare(tx: Transaction, userId: string): number {
  const entry = tx.paidForList.find(e => e.paidForId === userId);
  if (!entry) return 0;
  if (tx.splitType === 'EQUAL' || tx.splitType === 'AMOUNT') return entry.paidForValue;
  if (tx.splitType === 'SHARES') {
    const total = tx.paidForList.reduce((s, e) => s + e.paidForValue, 0);
    return total > 0 ? (entry.paidForValue / total) * tx.amount : 0;
  }
  if (tx.splitType === 'PERCENTAGE') return (entry.paidForValue / 100) * tx.amount;
  return 0;
}

export function transactionMeta(tx: Transaction, user: string, memberMap?: Record<string, string>): string {
  const resolvedName = tx.paidByName ?? memberMap?.[tx.paidById] ?? tx.paidById;
  const payer = tx.paidById === user ? 'You' : resolvedName;
  const n = tx.paidForList.length;
  return `${payer} paid ${getCurrencySymbol()}${tx.amount.toFixed(2)} for ${n} member${n !== 1 ? 's' : ''}`;
}
