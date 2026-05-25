'use client';

import { Expense } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ExpenseListProps {
  expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return <p>No expenses yet</p>;
  }

  return (
    <div>
      <h3>Expenses</h3>
      <ul style={{ listStyle: 'none' }}>
        {expenses.map((expense) => (
          <li
            key={expense.id}
            style={{
              padding: '0.75rem',
              borderBottom: '1px solid #ddd',
            }}
          >
            <strong>{expense.description}</strong>
            <br />
            <span>{formatCurrency(expense.amount)}</span>
            <small style={{ display: 'block', color: '#666', marginTop: '0.25rem' }}>
              Paid by {expense.paidBy}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
