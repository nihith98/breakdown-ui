import { render, screen, fireEvent } from '@testing-library/react';
import { GroupHeader } from '@/components/dashboard/GroupHeader';
import { Group, Transaction } from '@/types';

const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack }),
}));

const mockGroup: Group = {
  id: 'g-1',
  name: 'Office Lunch',
  description: 'Work lunches',
  members: [
    { id: 'u-1', username: 'alice', createdAt: '', updatedAt: '' },
    { id: 'u-2', username: 'bob', createdAt: '', updatedAt: '' },
  ],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

// alice paid 30, split equally with bob → alice net = +15; bob net = -15
const mockTransactions: Transaction[] = [
  {
    transactionId: 't-1',
    transactionName: 'Pizza',
    transactionType: 'EXPENSE',
    amount: 30,
    paidById: 'alice',
    paidForList: [
      { paidForId: 'alice', paidForValue: 15 },
      { paidForId: 'bob', paidForValue: 15 },
    ],
    splitType: 'EQUAL',
    timestamp: '2026-01-01T00:00:00Z',
    groupId: 'g-1',
    transactionStatus: 'COMPLETE',
  },
];

beforeEach(() => mockBack.mockClear());

describe('GroupHeader_render_displaysGroupName', () => {
  it('should display the group name', () => {
    // Arrange + Act
    render(<GroupHeader group={mockGroup} transactions={mockTransactions} currentUser="alice" />);
    // Assert
    expect(screen.getByRole('heading', { name: 'Office Lunch' })).toBeInTheDocument();
  });
});

describe('GroupHeader_render_displaysDescriptionAsComment', () => {
  it('should display description text', () => {
    // Arrange + Act
    render(<GroupHeader group={mockGroup} transactions={mockTransactions} currentUser="alice" />);
    // Assert
    expect(screen.getByText('Work lunches')).toBeInTheDocument();
  });
});

describe('GroupHeader_noDescription_hidesDescriptionRow', () => {
  it('should not render description paragraph when absent', () => {
    // Arrange
    const groupNoDesc: Group = { ...mockGroup, description: undefined };
    // Act
    render(<GroupHeader group={groupNoDesc} transactions={[]} currentUser="alice" />);
    // Assert
    expect(screen.queryByText('Work lunches')).not.toBeInTheDocument();
  });
});

describe('GroupHeader_positiveBalance_showsOwedToYou', () => {
  it('should show "Owed to you" label when net is positive', () => {
    // Arrange + Act — alice paid 30, own share is 15, net = +15
    render(<GroupHeader group={mockGroup} transactions={mockTransactions} currentUser="alice" />);
    // Assert
    expect(screen.getByText('Owed to you')).toBeInTheDocument();
  });
});

describe('GroupHeader_negativeBalance_showsYouOwe', () => {
  it('should show "You owe" label when net is negative', () => {
    // Arrange + Act — bob owes 15 to alice
    render(<GroupHeader group={mockGroup} transactions={mockTransactions} currentUser="bob" />);
    // Assert
    expect(screen.getByText('You owe')).toBeInTheDocument();
  });
});

describe('GroupHeader_zeroBalance_showsSettled', () => {
  it('should show "Settled" label when net is zero', () => {
    // Arrange + Act
    render(<GroupHeader group={mockGroup} transactions={[]} currentUser="alice" />);
    // Assert
    expect(screen.getByText('Settled')).toBeInTheDocument();
  });
});

describe('GroupHeader_backButton_callsRouterBack', () => {
  it('should invoke router.back when back link is clicked', () => {
    // Arrange
    render(<GroupHeader group={mockGroup} transactions={mockTransactions} currentUser="alice" />);
    // Act
    fireEvent.click(screen.getByText('‹ Groups'));
    // Assert
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});

describe('GroupHeader_render_displaysAllFourActionButtons', () => {
  it('should render all four action buttons', () => {
    // Arrange + Act
    render(<GroupHeader group={mockGroup} transactions={mockTransactions} currentUser="alice" />);
    // Assert
    expect(screen.getByText('+ Add transaction')).toBeInTheDocument();
    expect(screen.getByText('Settle up')).toBeInTheDocument();
    expect(screen.getByText('Balances')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
  });
});
