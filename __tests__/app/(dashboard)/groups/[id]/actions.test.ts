/**
 * Server Action Tests for Group Expense Management
 * Tests the addExpense action with various input scenarios
 *
 * Tests focus on:
 * - Valid input handling
 * - Error handling and reporting
 * - API call validation
 */

import { addExpense } from '@/app/(dashboard)/groups/[id]/actions';
import * as apiClient from '@/lib/api-client';
import * as responseHandler from '@/lib/response-handler';

jest.mock('@/lib/api-client');
jest.mock('@/lib/response-handler');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockResponseHandler = responseHandler as jest.Mocked<typeof responseHandler>;

describe('addExpense_validInput_createsExpense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an expense and return data on success', async () => {
    // Arrange
    const groupId = 'group-123';
    const expenseInput = {
      description: 'Dinner',
      amount: 50,
      paidBy: 'user1',
      splitBetween: ['user1', 'user2'],
    };

    const mockExpenseData = {
      id: 'exp-1',
      groupId,
      ...expenseInput,
      createdAt: '2026-05-26T00:00:00Z',
      updatedAt: '2026-05-26T00:00:00Z',
    };

    const mockResponse = {
      result: { status: 'SUCCESS', message: 'Created' },
      data: mockExpenseData,
    };

    mockApiClient.default.post = jest.fn().mockResolvedValue(mockResponse);
    mockResponseHandler.handleResponseStructure = jest.fn().mockReturnValue({
      data: mockExpenseData,
    });

    // Act
    const result = await addExpense(groupId, expenseInput);

    // Assert
    expect(result).toEqual(mockExpenseData);
    expect(mockApiClient.default.post).toHaveBeenCalledWith(
      `/groups/${groupId}/expenses`,
      expenseInput
    );
    expect(mockResponseHandler.handleResponseStructure).toHaveBeenCalledWith(mockResponse);
  });

  it('should send correct request payload to API', async () => {
    // Arrange
    const groupId = 'group-456';
    const expenseInput = {
      description: 'Concert tickets',
      amount: 120.50,
      paidBy: 'alice',
      splitBetween: ['alice', 'bob', 'charlie'],
    };

    const mockExpenseData = { id: 'exp-2', groupId, ...expenseInput, createdAt: '2026-05-26T00:00:00Z', updatedAt: '2026-05-26T00:00:00Z' };

    mockApiClient.default.post = jest.fn().mockResolvedValue({
      result: { status: 'SUCCESS', message: 'Created' },
      data: mockExpenseData,
    });

    mockResponseHandler.handleResponseStructure = jest.fn().mockReturnValue({
      data: mockExpenseData,
    });

    // Act
    await addExpense(groupId, expenseInput);

    // Assert
    expect(mockApiClient.default.post).toHaveBeenCalledWith(
      `/groups/group-456/expenses`,
      {
        description: 'Concert tickets',
        amount: 120.50,
        paidBy: 'alice',
        splitBetween: ['alice', 'bob', 'charlie'],
      }
    );
  });

  it('should handle expenses with various amounts correctly', async () => {
    // Arrange
    const testCases = [
      { amount: 0.01, description: 'Penny' },
      { amount: 100.50, description: 'Rounded' },
      { amount: 9999.99, description: 'Large amount' },
    ];

    for (const testCase of testCases) {
      mockApiClient.default.post = jest.fn().mockResolvedValue({
        result: { status: 'SUCCESS', message: 'Created' },
        data: { id: 'exp-id', groupId: 'g1', ...testCase, paidBy: 'user', splitBetween: ['user'], createdAt: '2026-05-26T00:00:00Z', updatedAt: '2026-05-26T00:00:00Z' },
      });

      mockResponseHandler.handleResponseStructure = jest.fn().mockReturnValue({
        data: { id: 'exp-id', groupId: 'g1', ...testCase, paidBy: 'user', splitBetween: ['user'], createdAt: '2026-05-26T00:00:00Z', updatedAt: '2026-05-26T00:00:00Z' },
      });

      // Act & Assert
      const result = await addExpense('g1', {
        ...testCase,
        paidBy: 'user',
        splitBetween: ['user'],
      });

      expect(result.amount).toBe(testCase.amount);
    }
  });
});

describe('addExpense_apiFailure_throwsError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error on API network failure', async () => {
    // Arrange
    const groupId = 'group-123';
    const expenseInput = {
      description: 'Dinner',
      amount: 50,
      paidBy: 'user1',
      splitBetween: ['user1', 'user2'],
    };

    const networkError = new Error('Network error');
    mockApiClient.default.post = jest.fn().mockRejectedValue(networkError);

    // Act & Assert
    await expect(addExpense(groupId, expenseInput)).rejects.toThrow();
  });

  it('should throw error on API server failure', async () => {
    // Arrange
    const groupId = 'group-789';
    const expenseInput = {
      description: 'Movie tickets',
      amount: 30,
      paidBy: 'user2',
      splitBetween: ['user2'],
    };

    const serverError = new Error('Internal server error');
    mockApiClient.default.post = jest.fn().mockRejectedValue(serverError);

    // Act & Assert
    await expect(addExpense(groupId, expenseInput)).rejects.toThrow('Internal server error');
  });

  it('should preserve error message from API', async () => {
    // Arrange
    const groupId = 'group-123';
    const expenseInput = {
      description: 'Test',
      amount: 10,
      paidBy: 'user',
      splitBetween: ['user'],
    };

    const customError = new Error('Insufficient permissions');
    mockApiClient.default.post = jest.fn().mockRejectedValue(customError);

    // Act & Assert
    try {
      await addExpense(groupId, expenseInput);
      fail('Should have thrown');
    } catch (error: any) {
      expect(error.message).toContain('Insufficient permissions');
    }
  });
});

describe('addExpense_edgeCases_handlesSpecialScenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle empty split between array', async () => {
    // Arrange
    const groupId = 'group-123';
    const expenseInput = {
      description: 'Personal expense',
      amount: 25,
      paidBy: 'user1',
      splitBetween: [],
    };

    const mockExpenseData = { id: 'exp-1', groupId, ...expenseInput, createdAt: '2026-05-26T00:00:00Z', updatedAt: '2026-05-26T00:00:00Z' };

    mockApiClient.default.post = jest.fn().mockResolvedValue({
      result: { status: 'SUCCESS', message: 'Created' },
      data: mockExpenseData,
    });

    mockResponseHandler.handleResponseStructure = jest.fn().mockReturnValue({
      data: mockExpenseData,
    });

    // Act
    const result = await addExpense(groupId, expenseInput);

    // Assert
    expect(result.splitBetween).toEqual([]);
  });

  it('should handle single person split', async () => {
    // Arrange
    const groupId = 'group-123';
    const expenseInput = {
      description: 'Solo lunch',
      amount: 15,
      paidBy: 'user1',
      splitBetween: ['user1'],
    };

    const mockExpenseData = { id: 'exp-2', groupId, ...expenseInput, createdAt: '2026-05-26T00:00:00Z', updatedAt: '2026-05-26T00:00:00Z' };

    mockApiClient.default.post = jest.fn().mockResolvedValue({
      result: { status: 'SUCCESS', message: 'Created' },
      data: mockExpenseData,
    });

    mockResponseHandler.handleResponseStructure = jest.fn().mockReturnValue({
      data: mockExpenseData,
    });

    // Act
    const result = await addExpense(groupId, expenseInput);

    // Assert
    expect(result.splitBetween).toEqual(['user1']);
    expect(result.splitBetween.length).toBe(1);
  });

  it('should handle multiple participants in split', async () => {
    // Arrange
    const groupId = 'group-123';
    const participants = ['user1', 'user2', 'user3', 'user4', 'user5'];
    const expenseInput = {
      description: 'Group dinner',
      amount: 250,
      paidBy: 'user1',
      splitBetween: participants,
    };

    const mockExpenseData = { id: 'exp-3', groupId, ...expenseInput, createdAt: '2026-05-26T00:00:00Z', updatedAt: '2026-05-26T00:00:00Z' };

    mockApiClient.default.post = jest.fn().mockResolvedValue({
      result: { status: 'SUCCESS', message: 'Created' },
      data: mockExpenseData,
    });

    mockResponseHandler.handleResponseStructure = jest.fn().mockReturnValue({
      data: mockExpenseData,
    });

    // Act
    const result = await addExpense(groupId, expenseInput);

    // Assert
    expect(result.splitBetween.length).toBe(5);
    expect(result.splitBetween).toEqual(participants);
  });
});
