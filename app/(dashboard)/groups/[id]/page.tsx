'use client';

import { useEffect, useState } from 'react';
import { Group, Expense } from '@/types';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupRes, expensesRes] = await Promise.all([
          fetch(`/api/groups/${params.id}`),
          fetch(`/api/expenses?groupId=${params.id}`),
        ]);

        if (!groupRes.ok || !expensesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const groupData = await groupRes.json();
        const expensesData = await expensesRes.json();

        setGroup(groupData);
        setExpenses(Array.isArray(expensesData) ? expensesData : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div style={{ color: '#c33' }}>{error}</div>;
  if (!group) return <div>Group not found</div>;

  return (
    <div>
      <h1>{group.name}</h1>
      {group.description && <p>{group.description}</p>}

      <h2>Expenses</h2>
      {expenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <ul style={{ listStyle: 'none' }}>
          {expenses.map((expense) => (
            <li key={expense.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #ddd' }}>
              <strong>{expense.description}</strong> - ${expense.amount.toFixed(2)}
              <br />
              <small>Paid by: {expense.paidBy}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
