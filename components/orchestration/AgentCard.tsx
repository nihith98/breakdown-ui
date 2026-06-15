'use client';

import { useState } from 'react';
import { AgentStatus as AgentStatusType } from '@/types/workflow-orchestration';
import { TaskList } from './TaskList';
import { LogViewer } from './LogViewer';
import { ErrorPanel } from './ErrorPanel';
import { StatusIndicator } from './StatusIndicator';
import styles from './AgentCard.module.css';

interface AgentCardProps {
  agent: AgentStatusType;
}

/**
 * AgentCard — Individual agent status, tasks, logs, and errors
 */
export function AgentCard({ agent }: AgentCardProps) {
  const [expandedSection, setExpandedSection] = useState<'tasks' | 'logs' | null>('tasks');

  const elapsedSeconds = Math.round(agent.elapsedTime / 1000);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  return (
    <div className={`${styles.card} ${styles[agent.status]}`}>
      {/* Header */}
      <div className={styles.header}>
        <StatusIndicator status={agent.status} />
        <div className={styles.agentInfo}>
          <h4 className={styles.agentName}>
            Agent {agent.agentNumber}: {agent.role}
          </h4>
          <p className={styles.agentMeta}>{agent.agentName}</p>
        </div>
        <div className={styles.progress}>
          <span className={styles.progressPercent}>{agent.progress}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${agent.progress}%` }} />
      </div>

      {/* Timing */}
      <div className={styles.timing}>
        <span>
          Elapsed: <strong>{elapsedMinutes}m {(elapsedSeconds % 60).toString().padStart(2, '0')}s</strong>
        </span>
        {agent.estimatedTimeRemaining > 0 && (
          <span>
            Est. remaining: <strong>{Math.round(agent.estimatedTimeRemaining / 1000 / 60)}m</strong>
          </span>
        )}
      </div>

      {/* Tasks Section */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => setExpandedSection(expandedSection === 'tasks' ? null : 'tasks')}
          aria-expanded={expandedSection === 'tasks'}
        >
          <span className={styles.sectionTitle}>
            Tasks ({agent.tasks.filter((t) => t.status === 'completed').length}/{agent.tasks.length})
          </span>
          <span className={styles.expandIcon}>{expandedSection === 'tasks' ? '▼' : '▶'}</span>
        </button>
        {expandedSection === 'tasks' && <TaskList tasks={agent.tasks} />}
      </div>

      {/* Logs Section */}
      {agent.logs.length > 0 && (
        <div className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => setExpandedSection(expandedSection === 'logs' ? null : 'logs')}
            aria-expanded={expandedSection === 'logs'}
          >
            <span className={styles.sectionTitle}>Logs ({agent.logs.length})</span>
            <span className={styles.expandIcon}>{expandedSection === 'logs' ? '▼' : '▶'}</span>
          </button>
          {expandedSection === 'logs' && <LogViewer logs={agent.logs} />}
        </div>
      )}

      {/* Error Panel */}
      {agent.status === 'failed' && agent.errorMessage && (
        <ErrorPanel agentName={agent.agentName} errorMessage={agent.errorMessage} />
      )}
    </div>
  );
}
