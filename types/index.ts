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
  name: string;
  description: string;
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
