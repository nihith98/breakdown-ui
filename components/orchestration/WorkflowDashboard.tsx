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

/**
 * WorkflowDashboard — Main client component for workflow monitoring
 *
 * Manages:
 * - Initial workflow state fetch
 * - WebSocket/polling connection
 * - Real-time updates
 * - Component composition and layout
 */
export function WorkflowDashboard({ orchestrationId }: WorkflowDashboardProps) {
  const {
    workflow,
    setWorkflowStatus,
    setConnectionStatus,
    connectionStatus,
    addLog,
    updateAgentStatus,
    updateTaskStatus,
    addMessage,
  } = useWorkflow();

  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch initial workflow state
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        setConnectionStatus('connecting');
        const response = await fetch(`/api/orchestrator/${orchestrationId}/status`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        setWorkflowStatus(data);
        setConnectionStatus('connected');
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to fetch initial workflow state:', error);
        setConnectionStatus('disconnected');
        // Retry after 3 seconds
        setTimeout(fetchInitialState, 3000);
      }
    };

    fetchInitialState();
  }, [orchestrationId, setWorkflowStatus, setConnectionStatus]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isInitialized) return;

    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/api/orchestrator/ws?orchestrationId=${orchestrationId}`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        setConnectionStatus('connecting');

        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnectionStatus('connected');
          if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            switch (message.type) {
              case 'workflow_status':
                setWorkflowStatus(message.data);
                break;
              case 'agent_update':
                updateAgentStatus(message.data.agentId, message.data);
                break;
              case 'task_update':
                updateTaskStatus(message.data.agentId, message.data.taskId, message.data);
                break;
              case 'log_entry':
                addLog(message.data.agentId, message.data);
                break;
              case 'message':
                addMessage(message.data);
                break;
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('disconnected');
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setConnectionStatus('disconnected');
          // Reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        setConnectionStatus('disconnected');
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [isInitialized, orchestrationId, setConnectionStatus, setWorkflowStatus, updateAgentStatus, updateTaskStatus, addLog, addMessage]);

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
