'use client';

import { useRouter } from 'next/navigation';
import styles from './success.module.css';

export default function SuccessPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/');
  };

  return (
    <div className={styles.container} role="status">
      <div className={styles.content}>
        <h1 className={styles.heading}>Login successful</h1>
        <p className={styles.subtext}>Welcome back!</p>
        <button onClick={handleContinue} className={styles.button}>
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}
