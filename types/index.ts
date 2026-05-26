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
