'use client';

import styles from './LogoutLoader.module.css';

interface LogoutLoaderProps {
  isVisible: boolean;
}

export function LogoutLoader({ isVisible }: LogoutLoaderProps) {
  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div
        className={styles.modal}
        role="dialog"
        aria-live="polite"
        aria-label="Signing you out, please wait"
      >
        <div className={styles.wordmark}>
          <span className={styles.break}>break</span>
          <span className={styles.down}>Down</span>
        </div>
        <div className={styles.loaderContent}>
          {/* Status bar variant (default) */}
          <div className={styles.statusBar}>
            <span className={styles.dot} />
            <span className={styles.text}>Signing you out</span>
          </div>
        </div>
      </div>
    </div>
  );
}
