'use client';

import { useWorkflow } from '@/lib/context/WorkflowContext';
import styles from './GlobalStatusReport.module.css';

/**
 * GlobalStatusReport — Live stream of orchestrator messages
 */
export function GlobalStatusReport() {
  const { messages } = useWorkflow();

  if (messages.length === 0) {
    return <div className={styles.empty}>Waiting for status updates...</div>;
  }

  return (
    <div className={styles.reportContainer}>
      <div className={styles.messageList}>
        {messages.map((message) => (
          <div key={message.messageId} className={`${styles.messageRow} ${styles[message.severity]}`}>
            <div className={styles.messageHeader}>
              <span className={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString()}</span>
              <span className={styles.messageType}>{message.messageType.replace(/_/g, ' ')}</span>
            </div>
            <p className={styles.messageContent}>{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
