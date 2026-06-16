'use client';

import { WorkflowStatus, PhaseStatusType, AgentStatusType, TaskStatusType } from '@/types/workflow-orchestration';
import styles from './StatusIndicator.module.css';

type Status = WorkflowStatus | PhaseStatusType | AgentStatusType | TaskStatusType;

interface StatusIndicatorProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

const statusLabels: Record<Status, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  paused: 'Paused',
  skipped: 'Skipped',
};

/**
 * StatusIndicator — Reusable status dot and label
 */
export function StatusIndicator({ status, size = 'md' }: StatusIndicatorProps) {
  return (
    <div className={`${styles.indicator} ${styles[size]} ${styles[status]}`}>
      <div className={styles.dot} />
      <span className={styles.label}>{statusLabels[status]}</span>
    </div>
  );
}
