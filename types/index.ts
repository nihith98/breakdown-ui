export interface ResponseStructure<T = unknown> {
  responseStatus: 'SUCCESS' | 'FAILURE';
  responseMessage: string;
  responseObject: T | null;
}

export interface AuthResponseStructure<T = unknown> {
  responseStatus: 'SUCCESS' | 'FAILURE';
  messages: {
    informationMessages: string[];
    warningMessages: string[];
    errorMessages: string[];
  };
  payload: T | null | false;
}

export interface LoginPayload {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshToken?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaidForEntry {
  paidForId: string;
  paidForValue: number;
  paidForName?: string;
}

export interface Transaction {
  transactionId: string;
  transactionName: string;
  transactionDescription?: string;
  transactionType: 'EXPENSE' | 'SETTLEMENT';
  amount: number;
  paidById: string;
  paidByName?: string;
  paidForList: PaidForEntry[];
  splitType: string;
  timestamp: string | null;
  groupId: string;
  transactionStatus: string;
}

export interface SettlementEntry {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export type GroupBalanceStatus = 'owe' | 'owed' | 'settled';

export interface GroupMemberRef {
  username: string;
}

export interface GroupListItem {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  expenseCount: number;
  net: number;
  isFamily?: boolean;
  members?: GroupMemberRef[];
  lastTransactionTime?: string;
}

export type GroupStatusFilterKey = 'all' | GroupBalanceStatus;

export type GroupSortKey = 'recent' | 'name' | 'amount';

export type SortDirection = 'desc' | 'asc';

export interface CreateGroupInput {
  groupName: string;
  groupDescription: string;
}

export interface CreateGroupResponse {
  groupId: string;
  joiningCode: string;
  groupName: string;
  createdById: string | null;
  personList: string[];
  familyList: string[] | null;
  groupDescription: string;
  operation: string | null;
}

export interface GroupSummary {
  id: string;
  name: string;
  memberCount: number;
  expenseCount: number;
  net: number;
  isFamily?: boolean;
}

export interface Family {
  id: string;
  name: string;
  groupId: string;
  groupName: string;
  memberCount: number;
  totalSpend: number;
  net: number;
}

export interface DashboardSummary {
  displayName: string;
  youOwe: number;
  owedToYou: number;
  net: number;
  recentGroups: GroupSummary[];
  recentFamilies: Family[];
}

export type SplitType = 'EQUAL' | 'SHARES' | 'PERCENTAGE' | 'AMOUNT';

export interface InsertTransactionInput {
  transactionName: string;
  transactionDescription?: string;
  transactionType: 'EXPENSE';
  amount: number;
  paidById: string;
  paidForList: Array<{
    paidForId: string;
    paidForValue: number;
  }>;
  splitType: SplitType;
  timestamp: string | null;
  groupId: string;
  transactionStatus: 'INCOMPLETE';
}

export interface SettlementTransaction {
  uuid: string;
  transactionType: 'SETTLEMENT';
  paidById: string;
  paidByName?: string | null;
  paidForList: Array<{
    paidForId: string;
    paidForValue: number;
    paidForName?: string | null;
  }>;
  transactionStatus: 'INCOMPLETE' | 'COMPLETE';
  groupId: string;
  familyId: string | null;
}

export interface SettlementListResponse {
  groupId: string;
  settlementList: SettlementTransaction[];
  memberMap: Record<string, string>;
}

export interface MemberTotalSpend {
  userId: string;
  displayName: string;
  totalSpend: number;
}

export interface GroupInfoPerson {
  userId: string;
  displayName: string;
  familyId?: string | null;
}

export interface GroupInfoFamily {
  familyId: string;
  familyName: string;
  memberIds: string[];
}

export interface GroupInfo {
  groupId: string;
  joiningCode: string;
  groupName: string;
  groupDescription?: string;
  createdById: string | null;
  personList: GroupInfoPerson[];
  familyList: GroupInfoFamily[] | null;
}
