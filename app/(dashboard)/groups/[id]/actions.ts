'use server';

import { groupAdminApiClient } from '@/lib/api-client';
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
    const axiosResponse = await groupAdminApiClient.post(`/groups/${groupId}/expenses`, input);
    return handleResponseStructure(axiosResponse.data);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add expense');
  }
}
