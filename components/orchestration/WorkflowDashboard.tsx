'use client';

import { useEffect, useState } from 'react';
import { useWorkflow } from '@/lib/context/WorkflowContext';
import { DashboardHeader } from './DashboardHeader';
import { RealTimeMetrics } from './RealTimeMetrics';
import { PhaseContainer } from './PhaseContainer';
import { GlobalStatusReport } from './GlobalStatusReport';
import { ConnectionStatus } from './ConnectionStatus';
import styles from './WorkflowDashboard.module.css';

interface WorkflowDashboardProps {
  orchestrationId: string;
}

const POLL_INTERVAL_MS = 2000;

/**
 * WorkflowDashboard — Main client component for workflow monitoring
 *
 * Workflow-Trigger.psm1 is a one-shot PowerShell script, not a running
 * server, so there's no socket to push updates from. It writes a JSON
 * snapshot to .breakdown/workflow-status/<id>.json after every
 * phase/agent transition instead, and this component polls
 * GET /api/orchestrator/[id]/status (which reads that file) on an interval.
 */
export function WorkflowDashboard({ orchestrationId }: WorkflowDashboardProps) {
  const { workflow, setWorkflowStatus, setConnectionStatus, connectionStatus } = useWorkflow();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const response = await fetch(`/api/orchestrator/${orchestrationId}/status`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (cancelled) return;

        setWorkflowStatus(data);
        setConnectionStatus('connected');
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to fetch workflow status:', error);
        if (!cancelled) setConnectionStatus('disconnected');
      } finally {
        if (!cancelled) {
          pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      }
    };

    setConnectionStatus('connecting');
    poll();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [orchestrationId, setWorkflowStatus, setConnectionStatus]);

  if (!isInitialized || !workflow) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Initializing workflow orchestration monitor...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <ConnectionStatus status={connectionStatus} />
      <DashboardHeader workflow={workflow} />
      <RealTimeMetrics metrics={workflow.metrics} />

      <div className={styles.content}>
        <div className={styles.phasesSection}>
          <h2 className={styles.sectionTitle}>Workflow Phases</h2>
          <div className={styles.phasesGrid}>
            {workflow.phases.map((phase) => (
              <PhaseContainer key={phase.phaseId} phase={phase} />
            ))}
          </div>
        </div>

        <div className={styles.statusSection}>
          <h2 className={styles.sectionTitle}>Live Status Updates</h2>
          <GlobalStatusReport />
        </div>
      </div>
    </div>
  );
}
