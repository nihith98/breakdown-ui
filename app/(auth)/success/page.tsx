'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './success.module.css';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push('/dashboard');
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [router]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div className={styles.container} role="status">
      <div className={styles.content}>
        <h1 className={styles.heading}>Login successful</h1>
        <p className={styles.subtext}>Redirecting to dashboard...</p>
        <button onClick={handleContinue} className={styles.button}>
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}
