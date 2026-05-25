'use client';

import { useState } from 'react';

interface AddExpenseFormProps {
  groupId: string;
  onSubmit: (data: any) => Promise<void>;
  onClose?: () => void;
}

export function AddExpenseForm({
  groupId,
  onSubmit,
  onClose,
}: AddExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onSubmit({
        description,
        amount: parseFloat(amount),
        paidBy,
        splitBetween: [paidBy], // Simplified
      });

      setDescription('');
      setAmount('');
      setPaidBy('');
      onClose?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Expense</h3>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Description
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Amount
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Paid By
          <input
            type="text"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
          />
        </label>
      </div>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Expense'}
      </button>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{ marginLeft: '0.5rem', background: '#999' }}
        >
          Cancel
        </button>
      )}
    </form>
  );
}
