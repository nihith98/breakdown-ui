/**
 * Workflow Orchestration Types
 *
 * Type definitions for the 15-agent orchestration monitoring system.
 * Covers workflow state, phases, agents, tasks, and real-time updates.
 */

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';
export type PhaseStatusType = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type AgentStatusType = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type TaskStatusType = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type MessageType = 'phase_transition' | 'agent_status' | 'task_update' | 'error' | 'warning' | 'info';
export type MessageSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface WorkflowStatusResponse {
  orchestrationId: string;
  startedAt: string; // ISO8601
  estimatedDuration: number; // milliseconds
  overallProgress: number; // 0-100
  status: WorkflowStatus;
  phases: PhaseStatus[];
  metrics: WorkflowMetrics;
  lastUpdated: string; // ISO8601
}

export interface PhaseStatus {
  phaseId: string;
  phaseName: string;
  position: number;
  status: PhaseStatusType;
  progress: number; // 0-100
  agents: AgentStatus[];
  startedAt?: string; // ISO8601
  completedAt?: string; // ISO8601
  estimatedDuration: number; // milliseconds
}

export interface AgentStatus {
  agentId: string;
  agentNumber: number; // 1-15
  agentName: string;
  role: string;
  status: AgentStatusType;
  progress: number; // 0-100
  parentPhaseId: string;
  parallelIndex?: number;
  tasks: TaskStatus[];
  startedAt?: string; // ISO8601
  completedAt?: string; // ISO8601
  elapsedTime: number; // milliseconds
  estimatedTimeRemaining: number; // milliseconds
  errorMessage?: string;
  logs: LogEntry[];
}

export interface TaskStatus {
  taskId: string;
  agentId: string;
  taskName: string;
  description?: string;
  status: TaskStatusType;
  progress?: number; // 0-100
  startedAt?: string; // ISO8601
  completedAt?: string; // ISO8601
  duration?: number; // milliseconds
  errorMessage?: string;
}

export interface LogEntry {
  logId: string;
  agentId: string;
  timestamp: string; // ISO8601
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

export interface WorkflowMetrics {
  totalTasks: number;
  tasksCompleted: number;
  tasksFailed: number;
  tasksRunning: number;
  tasksPending: number;
  agentsRunning: number;
  agentsCompleted: number;
  agentsFailed: number;
  totalDuration: number; // milliseconds
  estimatedTotalDuration: number; // original estimate
  failureRate: number; // 0-100
}

export interface OrchestratorMessage {
  messageId: string;
  timestamp: string; // ISO8601
  messageType: MessageType;
  content: string;
  sourceAgentId?: string;
  severity: MessageSeverity;
}

export interface WebSocketMessage {
  type: 'workflow_status' | 'agent_update' | 'task_update' | 'log_entry' | 'message';
  data: any;
  timestamp: string; // ISO8601
}
