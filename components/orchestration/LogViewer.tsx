'use client';

import { useRef, useEffect } from 'react';
import { LogEntry } from '@/types/workflow-orchestration';
import styles from './LogViewer.module.css';

interface LogViewerProps {
  logs: LogEntry[];
}

/**
 * LogViewer — Displays agent logs with auto-scroll to latest
 */
export function LogViewer({ logs }: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={styles.logContainer} ref={containerRef}>
      {logs.length === 0 ? (
        <p className={styles.empty}>No logs</p>
      ) : (
        logs.map((log) => (
          <div key={log.logId} className={`${styles.logEntry} ${styles[log.level]}`}>
            <span className={styles.timestamp}>{new Date(log.timestamp).toLocaleTimeString()}</span>
            <span className={styles.level}>[{log.level.toUpperCase()}]</span>
            <span className={styles.message}>{log.message}</span>
          </div>
        ))
      )}
    </div>
  );
}
