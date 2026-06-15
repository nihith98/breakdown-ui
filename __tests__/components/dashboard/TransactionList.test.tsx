import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { Transaction } from '@/types';

const mkTxn = (overrides: Partial<Transaction> & Pick<Transaction, 'transactionId' | 'transactionName' | 'paidById' | 'paidForList'>): Transaction => ({
  transactionType: 'EXPENSE',
  amount: 30,
  splitType: 'EQUAL',
  timestamp: '2026-06-01T10:00:00Z',
  groupId: 'g-1',
  transactionStatus: 'COMPLETE',
  ...overrides,
});

// alice paid 30 split equally with bob
// bob paid 20 split equally with alice
// charlie paid 10 split equally with charlie and bob (alice not involved)
const mockTransactions: Transaction[] = [
  mkTxn({
    transactionId: 't-1',
    transactionName: 'Lunch',
    paidById: 'alice',
    paidForList: [
      { paidForId: 'alice', paidForValue: 15 },
      { paidForId: 'bob', paidForValue: 15 },
    ],
  }),
  mkTxn({
    transactionId: 't-2',
    transactionName: 'Taxi',
    paidById: 'bob',
    amount: 20,
    timestamp: '2026-06-01T09:00:00Z',
    paidForList: [
      { paidForId: 'alice', paidForValue: 10 },
      { paidForId: 'bob', paidForValue: 10 },
    ],
  }),
  mkTxn({
    transactionId: 't-3',
    transactionName: 'Coffee',
    paidById: 'charlie',
    amount: 10,
    timestamp: '2026-06-01T08:00:00Z',
    paidForList: [
      { paidForId: 'charlie', paidForValue: 5 },
      { paidForId: 'bob', paidForValue: 5 },
    ],
  }),
];

describe('TransactionList_render_displaysAllExpenses', () => {
  it('should render all transactions by default', () => {
    // Arrange + Act
    render(<TransactionList transactions={mockTransactions} currentUser="alice" />);
    // Assert
    expect(screen.getByText(/Lunch/)).toBeInTheDocument();
    expect(screen.getByText(/Taxi/)).toBeInTheDocument();
    expect(screen.getByText(/Coffee/)).toBeInTheDocument();
  });
});

describe('TransactionList_searchQuery_filtersResults', () => {
  it('should filter to matching transaction name only', () => {
    // Arrange
    render(<TransactionList transactions={mockTransactions} currentUser="alice" />);
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
    render(<TransactionList transactions={mockTransactions} currentUser="alice" />);
    // Act
    fireEvent.click(screen.getByText('You paid'));
    // Assert
    expect(screen.getByText(/Lunch/)).toBeInTheDocument();
    expect(screen.queryByText(/Taxi/)).not.toBeInTheDocument();
  });
});

describe('TransactionList_othersPaidFilter_showsInvolvedOtherPaid', () => {
  it('should show transactions paid by others that include current user in paidForList', () => {
    // Arrange
    render(<TransactionList transactions={mockTransactions} currentUser="alice" />);
    // Act
    fireEvent.click(screen.getByText('Others paid'));
    // Assert — Taxi: bob paid, alice in paidForList → shown; Coffee: charlie paid, alice NOT in paidForList → hidden
    expect(screen.getByText(/Taxi/)).toBeInTheDocument();
    expect(screen.queryByText(/Lunch/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Coffee/)).not.toBeInTheDocument();
  });
});

describe('TransactionList_notInvolved_showsNotInvolvedLabel', () => {
  it('should display "not involved" for transactions user is excluded from', () => {
    // Arrange + Act — Coffee excludes alice
    render(<TransactionList transactions={mockTransactions} currentUser="alice" />);
    // Assert
    expect(screen.getByText('not involved')).toBeInTheDocument();
  });
});

describe('TransactionList_sortDirection_togglesLabel', () => {
  it('should toggle direction button title on click', () => {
    // Arrange
    render(<TransactionList transactions={mockTransactions} currentUser="alice" />);
    // Act
    fireEvent.click(screen.getByTitle('Switch to ascending'));
    // Assert
    expect(screen.getByTitle('Switch to descending')).toBeInTheDocument();
  });
});

describe('TransactionList_emptyExpenses_showsEmptyState', () => {
  it('should show empty comment when no transactions provided', () => {
    // Arrange + Act
    render(<TransactionList transactions={[]} currentUser="alice" />);
    // Assert
    expect(screen.getByText('// no transactions match')).toBeInTheDocument();
  });
});

describe('TransactionList_allFilterCount_matchesTotal', () => {
  it('should show correct count badge on All filter pill', () => {
    // Arrange + Act
    render(<TransactionList transactions={mockTransactions} currentUser="alice" />);
    // Assert — All pill shows "3"
    const allPill = screen.getByText('All').closest('button');
    expect(allPill).toHaveTextContent('3');
  });
});
