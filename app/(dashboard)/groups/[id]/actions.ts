'use server';

import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function addExpense(
  groupId: string,
  input: {
    description: string;
    amount: number;
    paidBy: string;
    splitBetween: string[];
  }
) {
  try {
    // Note: In a real app, you'd get the token from cookies
    // This is a simplified example
    const response = await apiClient.post(`/groups/${groupId}/expenses`, input);
    const { data } = handleResponseStructure(response);
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add expense');
  }
}
