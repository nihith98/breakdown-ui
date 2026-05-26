'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/auth';
import styles from './login.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBannerError('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const validateFields = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!username.trim()) {
      errors.username = 'Username is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    setBannerError('');
    setIsSubmitting(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      await loginUser(username, password);
      router.push('/auth/success');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setBannerError('Request timeout. Try again?');
      } else {
        setBannerError(err.message || 'Login failed');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.card}>
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        {bannerError && (
          <div className={styles.errorBanner} role="alert">
            <span className={styles.errorText}>{bannerError}</span>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setBannerError('')}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="username" className={styles.label}>Username</label>
          <input
            id="username"
            type="text"
            className={`${styles.input} ${fieldErrors.username ? styles.error : ''}`}
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => {
              if (!username.trim()) {
                setFieldErrors((prev) => ({ ...prev, username: 'Username is required' }));
              } else {
                setFieldErrors((prev) => ({ ...prev, username: undefined }));
              }
            }}
            disabled={isSubmitting}
            aria-describedby={fieldErrors.username ? 'username-error' : undefined}
          />
          {fieldErrors.username && (
            <span id="username-error" className={styles.fieldError}>{fieldErrors.username}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <div className={styles.inputWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${fieldErrors.password ? styles.error : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => {
                if (!password) {
                  setFieldErrors((prev) => ({ ...prev, password: 'Password is required' }));
                } else {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              disabled={isSubmitting}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              className={styles.eyeToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
              disabled={isSubmitting}
            >
              {showPassword ? '👁' : '👁‍🗨'}
            </button>
          </div>
          {fieldErrors.password && (
            <span id="password-error" className={styles.fieldError}>{fieldErrors.password}</span>
          )}
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className={styles.spinner} />
              LOGGING IN...
            </>
          ) : (
            'LOG IN'
          )}
        </button>
      </form>

      <div className={styles.signUpLink}>
        Don&apos;t have an account?{' '}
        <Link href="/register" aria-label="Create a new account">
          Sign up
        </Link>
      </div>
    </div>
  );
}
