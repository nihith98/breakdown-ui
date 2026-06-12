import {
  computeUserNet,
  txnUserAmount,
  txnMeta,
  formatMoney,
  balanceLabel,
  balanceStatus,
  relativeTime,
  initials,
} from '@/lib/group-format';
import { Expense } from '@/types';

const mkExp = (overrides: Partial<Expense> & Pick<Expense, 'paidBy' | 'splitBetween'>): Expense => ({
  id: 'e-1',
  groupId: 'g-1',
  description: 'Lunch',
  amount: 30,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

// ============================================================
// computeUserNet
// ============================================================

describe('computeUserNet_payer_returnsPositiveNet', () => {
  it('should return positive net when user paid for others', () => {
    // Arrange
    const expenses = [mkExp({ paidBy: 'alice', splitBetween: ['alice', 'bob'] })];
    // Act
    const net = computeUserNet(expenses, 'alice');
    // Assert — paid 30, share = 15, net = +15
    expect(net).toBe(15);
  });
});

describe('computeUserNet_splitMember_returnsNegativeNet', () => {
  it('should return negative net when user is in split but did not pay', () => {
    // Arrange
    const expenses = [mkExp({ paidBy: 'alice', splitBetween: ['alice', 'bob'] })];
    // Act
    const net = computeUserNet(expenses, 'bob');
    // Assert — owes alice 15
    expect(net).toBe(-15);
  });
});

describe('computeUserNet_notInvolved_returnsZero', () => {
  it('should return 0 for expenses user is not involved in', () => {
    // Arrange
    const expenses = [mkExp({ paidBy: 'alice', splitBetween: ['alice', 'bob'] })];
    // Act
    const net = computeUserNet(expenses, 'charlie');
    // Assert
    expect(net).toBe(0);
  });
});

describe('computeUserNet_multipleExpenses_aggregatesCorrectly', () => {
  it('should sum nets across multiple expenses', () => {
    // Arrange — alice paid 30 (net +15), bob paid 20 split with alice (alice owes 10)
    const expenses = [
      mkExp({ paidBy: 'alice', splitBetween: ['alice', 'bob'], amount: 30 }),
      mkExp({ id: 'e-2', paidBy: 'bob', splitBetween: ['alice', 'bob'], amount: 20 }),
    ];
    // Act
    const net = computeUserNet(expenses, 'alice');
    // Assert — +15 - 10 = +5
    expect(net).toBe(5);
  });
});

// ============================================================
// txnUserAmount
// ============================================================

describe('txnUserAmount_payer_returnsPositiveShare', () => {
  it('should return amount minus own share for payer', () => {
    // Arrange
    const tx = mkExp({ paidBy: 'alice', splitBetween: ['alice', 'bob'], amount: 30 });
    // Act
    const amt = txnUserAmount(tx, 'alice');
    // Assert — paid 30, share 15, net = +15
    expect(amt).toBe(15);
  });
});

describe('txnUserAmount_splitMember_returnsNegativeShare', () => {
  it('should return negative share for non-payer in split', () => {
    // Arrange
    const tx = mkExp({ paidBy: 'alice', splitBetween: ['alice', 'bob'], amount: 30 });
    // Act
    const amt = txnUserAmount(tx, 'bob');
    // Assert
    expect(amt).toBe(-15);
  });
});

describe('txnUserAmount_notInvolved_returnsNull', () => {
  it('should return null for user not in paidBy or splitBetween', () => {
    // Arrange
    const tx = mkExp({ paidBy: 'alice', splitBetween: ['alice', 'bob'] });
    // Act
    const amt = txnUserAmount(tx, 'charlie');
    // Assert
    expect(amt).toBeNull();
  });
});

// ============================================================
// txnMeta
// ============================================================

describe('txnMeta_currentUserIsPayer_showsYou', () => {
  it('should use "You" as payer label when current user paid', () => {
    // Arrange
    const tx = mkExp({ paidBy: 'alice', splitBetween: ['alice', 'bob'], amount: 30 });
    // Act
    const meta = txnMeta(tx, 'alice');
    // Assert
    expect(meta).toBe('You paid $30.00 for 2 members');
  });
});

describe('txnMeta_otherUserIsPayer_showsUsername', () => {
  it('should show payer username when someone else paid', () => {
    // Arrange
    const tx = mkExp({ paidBy: 'bob', splitBetween: ['alice', 'bob'], amount: 30 });
    // Act
    const meta = txnMeta(tx, 'alice');
    // Assert
    expect(meta).toBe('bob paid $30.00 for 2 members');
  });
});

describe('txnMeta_singleMember_usessingularLabel', () => {
  it('should use "member" (singular) when only 1 person in split', () => {
    // Arrange
    const tx = mkExp({ paidBy: 'alice', splitBetween: ['alice'], amount: 20 });
    // Act
    const meta = txnMeta(tx, 'alice');
    // Assert
    expect(meta).toBe('You paid $20.00 for 1 member');
  });
});

// ============================================================
// Existing utilities (smoke tests)
// ============================================================

describe('formatMoney_positive_hasPlusSign', () => {
  it('should prefix positive numbers with +', () => {
    expect(formatMoney(12.5)).toBe('+$12.50');
  });
});

describe('formatMoney_negative_hasMinusSign', () => {
  it('should prefix negative numbers with -', () => {
    expect(formatMoney(-7.3)).toBe('-$7.30');
  });
});

describe('balanceStatus_positive_returnsOwed', () => {
  it('should return "owed" for positive net', () => {
    expect(balanceStatus(10)).toBe('owed');
  });
});

describe('balanceStatus_negative_returnsOwe', () => {
  it('should return "owe" for negative net', () => {
    expect(balanceStatus(-5)).toBe('owe');
  });
});

describe('balanceLabel_zero_returnsSettled', () => {
  it('should return "Settled" for zero net', () => {
    expect(balanceLabel(0)).toBe('Settled');
  });
});

describe('initials_username_returnsUppercaseFirst', () => {
  it('should return uppercase first character', () => {
    expect(initials('alice')).toBe('A');
  });
});
