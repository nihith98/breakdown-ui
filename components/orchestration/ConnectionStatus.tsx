'use client';

import styles from './ConnectionStatus.module.css';

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected';
}

/**
 * ConnectionStatus — Banner showing WebSocket/polling connection status
 */
export function ConnectionStatus({ status }: ConnectionStatusProps) {
  if (status === 'connected') {
    return null;
  }

  return (
    <div className={`${styles.banner} ${styles[status]}`}>
      <div className={styles.dot} />
      <span className={styles.text}>
        {status === 'connecting' && 'Connecting to orchestrator...'}
        {status === 'disconnected' && 'Connection lost. Reconnecting...'}
      </span>
    </div>
  );
}
