'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      window.location.href = '/groups';
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  }

  return (
    <>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
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

        <button type="submit" style={{ width: '100%', marginBottom: '1rem' }}>
          Register
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#0969da' }}>
          Log in here
        </Link>
      </p>
    </>
  );
}
