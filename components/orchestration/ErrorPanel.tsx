'use client';

import styles from './ErrorPanel.module.css';

interface ErrorPanelProps {
  agentName: string;
  errorMessage: string;
}

/**
 * ErrorPanel — Displays error details for failed agents
 */
export function ErrorPanel({ agentName, errorMessage }: ErrorPanelProps) {
  return (
    <div className={styles.errorPanel}>
      <div className={styles.errorHeader}>
        <span className={styles.errorIcon}>⚠</span>
        <h5 className={styles.errorTitle}>{agentName} Failed</h5>
      </div>
      <p className={styles.errorMessage}>{errorMessage}</p>
    </div>
  );
}
