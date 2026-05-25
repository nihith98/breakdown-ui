/**
 * Central export point for all TypeScript types
 */

export interface ResponseStructure<T = any> {
  result: {
    status: 'SUCCESS' | 'FAILURE';
    message: string;
  };
  data: T;
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

export interface AuthUser extends User {
  token: string;
}
