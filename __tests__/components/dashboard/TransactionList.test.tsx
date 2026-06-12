import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { Expense } from '@/types';

const mkExp = (overrides: Partial<Expense> & Pick<Expense, 'id' | 'description' | 'paidBy' | 'splitBetween'>): Expense => ({
  groupId: 'g-1',
  amount: 30,
  createdAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-01T10:00:00Z',
  ...overrides,
});

const mockExpenses: Expense[] = [
  mkExp({ id: 'e-1', description: 'Lunch', paidBy: 'alice', splitBetween: ['alice', 'bob'] }),
  mkExp({ id: 'e-2', description: 'Taxi', paidBy: 'bob', splitBetween: ['alice', 'bob'], amount: 20,
    createdAt: '2026-06-01T09:00:00Z' }),
  mkExp({ id: 'e-3', description: 'Coffee', paidBy: 'charlie', splitBetween: ['charlie', 'bob'],
    amount: 10, createdAt: '2026-06-01T08:00:00Z' }),
];

describe('TransactionList_render_displaysAllExpenses', () => {
  it('should render all transactions by default', () => {
    // Arrange + Act
    render(<TransactionList expenses={mockExpenses} currentUser="alice" />);
    // Assert
    expect(screen.getByText(/Lunch/)).toBeInTheDocument();
    expect(screen.getByText(/Taxi/)).toBeInTheDocument();
    expect(screen.getByText(/Coffee/)).toBeInTheDocument();
  });
});

describe('TransactionList_searchQuery_filtersResults', () => {
  it('should filter to matching description only', () => {
    // Arrange
    render(<TransactionList expenses={mockExpenses} currentUser="alice" />);
    // Act
    fireEvent.change(screen.getByPlaceholderText('search transactions...'), {
      target: { value: 'lunch' },
    });
    // Assert
    expect(screen.getByText(/Lunch/)).toBeInTheDocument();
    expect(screen.queryByText(/Taxi/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Coffee/)).not.toBeInTheDocument();
  });
});

describe('TransactionList_youPaidFilter_showsOnlyCurrentUserPaid', () => {
  it('should show only transactions paid by alice', () => {
    // Arrange
    render(<TransactionList expenses={mockExpenses} currentUser="alice" />);
    // Act
    fireEvent.click(screen.getByText('You paid'));
    // Assert
    expect(screen.getByText(/Lunch/)).toBeInTheDocument();
    expect(screen.queryByText(/Taxi/)).not.toBeInTheDocument();
  });
});

describe('TransactionList_othersPaidFilter_showsInvolvedOtherPaid', () => {
  it('should show transactions paid by others that include current user in split', () => {
    // Arrange
    render(<TransactionList expenses={mockExpenses} currentUser="alice" />);
    // Act
    fireEvent.click(screen.getByText('Others paid'));
    // Assert — Taxi: bob paid, alice in split → shown; Coffee: charlie paid, alice NOT in split → hidden
    expect(screen.getByText(/Taxi/)).toBeInTheDocument();
    expect(screen.queryByText(/Lunch/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Coffee/)).not.toBeInTheDocument();
  });
});

describe('TransactionList_notInvolved_showsNotInvolvedLabel', () => {
  it('should display "not involved" for transactions user is excluded from', () => {
    // Arrange + Act — Coffee excludes alice
    render(<TransactionList expenses={mockExpenses} currentUser="alice" />);
    // Assert
    expect(screen.getByText('not involved')).toBeInTheDocument();
  });
});

describe('TransactionList_sortDirection_togglesLabel', () => {
  it('should toggle direction button title on click', () => {
    // Arrange
    render(<TransactionList expenses={mockExpenses} currentUser="alice" />);
    // Act
    fireEvent.click(screen.getByTitle('Switch to ascending'));
    // Assert
    expect(screen.getByTitle('Switch to descending')).toBeInTheDocument();
  });
});

describe('TransactionList_emptyExpenses_showsEmptyState', () => {
  it('should show empty comment when no expenses provided', () => {
    // Arrange + Act
    render(<TransactionList expenses={[]} currentUser="alice" />);
    // Assert
    expect(screen.getByText('// no transactions match')).toBeInTheDocument();
  });
});

describe('TransactionList_allFilterCount_matchesTotal', () => {
  it('should show correct count badge on All filter pill', () => {
    // Arrange + Act
    render(<TransactionList expenses={mockExpenses} currentUser="alice" />);
    // Assert — All pill shows "3"
    const allPill = screen.getByText('All').closest('button');
    expect(allPill).toHaveTextContent('3');
  });
});
