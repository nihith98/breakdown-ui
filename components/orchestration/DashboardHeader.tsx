'use client';

import { WorkflowStatusResponse } from '@/types/workflow-orchestration';
import { StatusIndicator } from './StatusIndicator';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  workflow: WorkflowStatusResponse;
}

/**
 * DashboardHeader — Top banner with overall progress and metrics
 */
export function DashboardHeader({ workflow }: DashboardHeaderProps) {
  const elapsedSeconds = Math.round((Date.now() - new Date(workflow.startedAt).getTime()) / 1000);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const estimatedMinutes = Math.round(workflow.estimatedDuration / 60000);

  return (
    <header className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Workflow Orchestration</h1>
        <p className={styles.subtitle}>15-agent feature deployment pipeline</p>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.circularProgress}>
          <div
            className={styles.circularProgressInner}
            style={
              {
                '--progress-percent': `${workflow.overallProgress}%`,
              } as React.CSSProperties
            }
          >
            <span className={styles.progressText}>{workflow.overallProgress}%</span>
          </div>
        </div>
        <div className={styles.progressInfo}>
          <div className={styles.timing}>
            <span className={styles.timingLabel}>Elapsed</span>
            <span className={styles.timingValue}>{elapsedMinutes}:{(elapsedSeconds % 60).toString().padStart(2, '0')}m</span>
          </div>
          <div className={styles.timing}>
            <span className={styles.timingLabel}>Est. Total</span>
            <span className={styles.timingValue}>{estimatedMinutes}m</span>
          </div>
        </div>
      </div>

      <div className={styles.statusSection}>
        <StatusIndicator status={workflow.status} />
        <p className={styles.statusText}>
          {workflow.status === 'completed' && 'Workflow completed successfully'}
          {workflow.status === 'failed' && 'Workflow failed — see logs for details'}
          {workflow.status === 'running' && 'Workflow in progress'}
          {workflow.status === 'paused' && 'Workflow paused'}
          {workflow.status === 'pending' && 'Workflow queued'}
        </p>
      </div>
    </header>
  );
}
