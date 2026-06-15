'use client';

import { useState } from 'react';
import { PhaseStatus as PhaseStatusType } from '@/types/workflow-orchestration';
import { AgentCard } from './AgentCard';
import { StatusIndicator } from './StatusIndicator';
import styles from './PhaseContainer.module.css';

interface PhaseContainerProps {
  phase: PhaseStatusType;
}

/**
 * PhaseContainer — Displays a workflow phase with all its agents
 */
export function PhaseContainer({ phase }: PhaseContainerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`${styles.phaseCard} ${styles[phase.status]}`}>
      <button
        className={styles.phaseHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className={styles.phaseInfo}>
          <StatusIndicator status={phase.status} size="sm" />
          <div className={styles.phaseMeta}>
            <h3 className={styles.phaseName}>{phase.phaseName}</h3>
            <p className={styles.phaseSubtitle}>
              {phase.agents.length} agent{phase.agents.length !== 1 ? 's' : ''} · Phase {phase.position}
            </p>
          </div>
        </div>

        <div className={styles.phaseProgressBar}>
          <div className={styles.progressFill} style={{ width: `${phase.progress}%` }} />
        </div>

        <div className={styles.phaseProgress}>
          <span className={styles.progressPercent}>{phase.progress}%</span>
          <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
        </div>
      </button>

      {isExpanded && (
        <div className={styles.agentGrid}>
          {phase.agents.map((agent) => (
            <AgentCard key={agent.agentId} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
