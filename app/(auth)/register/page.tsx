'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/auth';
import styles from './register.module.css';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    displayName?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
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

    if (displayName && displayName.length > 100) {
      errors.displayName = 'Display name must be 100 characters or less';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await registerUser(username, password, displayName);
      router.push('/success');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setBannerError('Request timeout. Try again?');
      } else {
        setBannerError(err.message || 'Registration failed');
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
            placeholder="Choose your username"
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
          <label htmlFor="displayName" className={styles.label}>Display Name</label>
          <input
            id="displayName"
            type="text"
            className={`${styles.input} ${fieldErrors.displayName ? styles.error : ''}`}
            placeholder="How should we call you? (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={() => {
              if (displayName && displayName.length > 100) {
                setFieldErrors((prev) => ({ ...prev, displayName: 'Display name must be 100 characters or less' }));
              } else {
                setFieldErrors((prev) => ({ ...prev, displayName: undefined }));
              }
            }}
            disabled={isSubmitting}
            aria-describedby={fieldErrors.displayName ? 'displayName-error' : undefined}
          />
          {fieldErrors.displayName && (
            <span id="displayName-error" className={styles.fieldError}>{fieldErrors.displayName}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <div className={styles.inputWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${fieldErrors.password ? styles.error : ''}`}
              placeholder="Create a password"
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

        <div className={styles.field}>
          <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
          <div className={styles.inputWrapper}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className={`${styles.input} ${fieldErrors.confirmPassword ? styles.error : ''}`}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => {
                if (!confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Confirm password is required' }));
                } else if (password !== confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
                } else {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              disabled={isSubmitting}
              aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            <button
              type="button"
              className={styles.eyeToggle}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle confirm password visibility"
              disabled={isSubmitting}
            >
              {showConfirmPassword ? '👁' : '👁‍🗨'}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <span id="confirmPassword-error" className={styles.fieldError}>{fieldErrors.confirmPassword}</span>
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
              REGISTERING...
            </>
          ) : (
            'CREATE ACCOUNT'
          )}
        </button>
      </form>

      <div className={styles.logInLink}>
        Already have an account?{' '}
        <Link href="/login" aria-label="Log in to your account">
          Log in
        </Link>
      </div>
    </div>
  );
}
