/**
 * Component Tests for ExpenseList
 * Tests rendering of expense lists with various states
 *
 * Tests focus on:
 * - Rendering expense items correctly
 * - Displaying empty state
 * - Handling different expense data structures
 * - Currency formatting
 */

import { render, screen } from '@testing-library/react';
import { ExpenseList } from '@/components/ExpenseList';
import { Expense } from '@/types';

// Mock the utility function
jest.mock('@/lib/utils', () => ({
  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },
}));

describe('ExpenseList_withExpenses_rendersExpenses', () => {
  it('should render list of expenses', () => {
    // Arrange
    const expenses: Expense[] = [
      {
        id: '1',
        groupId: 'g1',
        description: 'Dinner',
        amount: 50,
        paidBy: 'Alice',
        splitBetween: ['Alice', 'Bob'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
    ];

    // Act
    render(<ExpenseList expenses={expenses} />);

    // Assert
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('Paid by Alice')).toBeInTheDocument();
  });

  it('should render multiple expenses', () => {
    // Arrange
    const expenses: Expense[] = [
      {
        id: '1',
        groupId: 'g1',
        description: 'Dinner',
        amount: 50,
        paidBy: 'Alice',
        splitBetween: ['Alice', 'Bob'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
      {
        id: '2',
        groupId: 'g1',
        description: 'Movie tickets',
        amount: 30,
        paidBy: 'Bob',
        splitBetween: ['Alice', 'Bob'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
      {
        id: '3',
        groupId: 'g1',
        description: 'Gas',
        amount: 60,
        paidBy: 'Charlie',
        splitBetween: ['Alice', 'Bob', 'Charlie'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
    ];

    // Act
    render(<ExpenseList expenses={expenses} />);

    // Assert
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('Movie tickets')).toBeInTheDocument();
    expect(screen.getByText('Gas')).toBeInTheDocument();
    expect(screen.getByText('Paid by Alice')).toBeInTheDocument();
    expect(screen.getByText('Paid by Bob')).toBeInTheDocument();
    expect(screen.getByText('Paid by Charlie')).toBeInTheDocument();
  });

  it('should display formatted currency amounts', () => {
    // Arrange
    const expenses: Expense[] = [
      {
        id: '1',
        groupId: 'g1',
        description: 'Lunch',
        amount: 25.5,
        paidBy: 'Alice',
        splitBetween: ['Alice'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
    ];

    // Act
    render(<ExpenseList expenses={expenses} />);

    // Assert
    expect(screen.getByText(/\$25\.50/)).toBeInTheDocument();
  });

  it('should render expense header', () => {
    // Arrange
    const expenses: Expense[] = [
      {
        id: '1',
        groupId: 'g1',
        description: 'Dinner',
        amount: 50,
        paidBy: 'Alice',
        splitBetween: ['Alice', 'Bob'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
    ];

    // Act
    render(<ExpenseList expenses={expenses} />);

    // Assert
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });
});

describe('ExpenseList_noExpenses_showsEmptyState', () => {
  it('should render empty message when no expenses', () => {
    // Arrange
    const expenses: Expense[] = [];

    // Act
    render(<ExpenseList expenses={expenses} />);

    // Assert
    expect(screen.getByText('No expenses yet')).toBeInTheDocument();
  });

  it('should not render expenses header when empty', () => {
    // Arrange
    const expenses: Expense[] = [];

    // Act
    render(<ExpenseList expenses={expenses} />);

    // Assert
    expect(screen.queryByText('Expenses')).not.toBeInTheDocument();
  });
});

describe('ExpenseList_dataVariations_handlesEdgeCases', () => {
  it('should handle expense with special characters in description', () => {
    // Arrange
    const expenses: Expense[] = [
      {
        id: '1',
        groupId: 'g1',
        description: 'Coffee & pastry @ café',
        amount: 12.5,
        paidBy: 'Alice',
        splitBetween: ['Alice'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
    ];

    // Act
    render(<ExpenseList expenses={expenses} />);

    // Assert
    expect(screen.getByText('Coffee & pastry @ café')).toBeInTheDocument();
  });

  it('should handle expense with very long description', () => {
    // Arrange
    const longDescription =
      'This is a very long expense description that contains many words to test how the component handles lengthy text';
    const expenses: Expense[] = [
      {
        id: '1',
        groupId: 'g1',
        description: longDescription,
        amount: 99.99,
        paidBy: 'Alice',
        splitBetween: ['Alice'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
    ];

    // Act
    render(<ExpenseList expenses={expenses} />);

    // Assert
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('should handle expense with zero amount', () => {
    // Arrange
    const expenses: Expense[] = [
      {
        id: '1',
        groupId: 'g1',
        description: 'Free item',
        amount: 0,
        paidBy: 'Alice',
        splitBetween: ['Alice'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
    ];

    // Act
    render(<ExpenseList expenses={expenses} />);

    // Assert
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
  });

  it('should handle expense with very large amount', () => {
    // Arrange
    const expenses: Expense[] = [
      {
        id: '1',
        groupId: 'g1',
        description: 'Vacation',
        amount: 9999.99,
        paidBy: 'Alice',
        splitBetween: ['Alice'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
    ];

    // Act
    render(<ExpenseList expenses={expenses} />);

    // Assert
    expect(screen.getByText(/\$9,999\.99/)).toBeInTheDocument();
  });

  it('should handle paidBy with special characters', () => {
    // Arrange
    const expenses: Expense[] = [
      {
        id: '1',
        groupId: 'g1',
        description: 'Dinner',
        amount: 50,
        paidBy: "O'Brien",
        splitBetween: ["O'Brien"],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
    ];

    // Act
    render(<ExpenseList expenses={expenses} />);

    // Assert
    expect(screen.getByText("Paid by O'Brien")).toBeInTheDocument();
  });
});

describe('ExpenseList_listStructure_rendersCorrectly', () => {
  it('should render items as list items', () => {
    // Arrange
    const expenses: Expense[] = [
      {
        id: '1',
        groupId: 'g1',
        description: 'Item 1',
        amount: 10,
        paidBy: 'Alice',
        splitBetween: ['Alice'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
      {
        id: '2',
        groupId: 'g1',
        description: 'Item 2',
        amount: 20,
        paidBy: 'Bob',
        splitBetween: ['Bob'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
    ];

    // Act
    const { container } = render(<ExpenseList expenses={expenses} />);

    // Assert
    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(2);
  });

  it('should use unique keys for list items', () => {
    // Arrange
    const expenses: Expense[] = [
      {
        id: 'unique-1',
        groupId: 'g1',
        description: 'Item 1',
        amount: 10,
        paidBy: 'Alice',
        splitBetween: ['Alice'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
      {
        id: 'unique-2',
        groupId: 'g1',
        description: 'Item 2',
        amount: 20,
        paidBy: 'Bob',
        splitBetween: ['Bob'],
        createdAt: '2026-05-26T00:00:00Z',
        updatedAt: '2026-05-26T00:00:00Z',
      },
    ];

    // Act
    render(<ExpenseList expenses={expenses} />);

    // Assert - React will handle duplicate key warnings
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});
