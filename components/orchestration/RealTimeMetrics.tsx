'use client';

import { WorkflowMetrics } from '@/types/workflow-orchestration';
import styles from './RealTimeMetrics.module.css';

interface RealTimeMetricsProps {
  metrics: WorkflowMetrics;
}

/**
 * RealTimeMetrics — Live metric cards (tasks, agents, failure rate)
 */
export function RealTimeMetrics({ metrics }: RealTimeMetricsProps) {
  return (
    <div className={styles.metricsGrid}>
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Running</div>
        <div className={styles.metricValue}>{metrics.agentsRunning}</div>
        <div className={styles.metricSub}>agents</div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Completed</div>
        <div className={styles.metricValue}>{metrics.agentsCompleted}</div>
        <div className={styles.metricSub}>agents</div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Tasks Done</div>
        <div className={styles.metricValue}>{metrics.tasksCompleted}</div>
        <div className={styles.metricSub}>of {metrics.totalTasks}</div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Failures</div>
        <div className={`${styles.metricValue} ${metrics.tasksFailed > 0 ? styles.metricError : ''}`}>
          {metrics.tasksFailed}
        </div>
        <div className={styles.metricSub}>tasks</div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Failure Rate</div>
        <div className={`${styles.metricValue} ${metrics.failureRate > 10 ? styles.metricWarning : ''}`}>
          {metrics.failureRate.toFixed(1)}%
        </div>
        <div className={styles.metricSub}>of tasks</div>
      </div>
    </div>
  );
}
