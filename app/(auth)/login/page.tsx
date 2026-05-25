'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loginUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await loginUser(username, password);
      router.push('/groups');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>breakDown</h1>

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

        <button
          type="submit"
          disabled={isLoading}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
        Don't have an account?{' '}
        <Link href="/register" style={{ color: '#0969da' }}>
          Register here
        </Link>
      </p>
    </>
  );
}
