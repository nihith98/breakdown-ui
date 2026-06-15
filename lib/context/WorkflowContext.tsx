'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  WorkflowStatusResponse,
  AgentStatus,
  TaskStatus,
  LogEntry,
  OrchestratorMessage,
} from '@/types/workflow-orchestration';

interface WorkflowContextType {
  workflow: WorkflowStatusResponse | null;
  messages: OrchestratorMessage[];
  selectedAgentId: string | null;
  selectedPhaseId: string | null;
  isPaused: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';

  // Actions
  setWorkflowStatus: (workflow: WorkflowStatusResponse) => void;
  addMessage: (message: OrchestratorMessage) => void;
  updateAgentStatus: (agentId: string, updates: Partial<AgentStatus>) => void;
  updateTaskStatus: (agentId: string, taskId: string, updates: Partial<TaskStatus>) => void;
  addLog: (agentId: string, log: LogEntry) => void;
  setSelectedAgent: (agentId: string | null) => void;
  setSelectedPhase: (phaseId: string | null) => void;
  setPauseState: (isPaused: boolean) => void;
  setConnectionStatus: (status: 'connected' | 'connecting' | 'disconnected') => void;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export function WorkflowProvider({ children, initialWorkflow }: { children: ReactNode; initialWorkflow?: WorkflowStatusResponse }) {
  const [workflow, setWorkflow] = useState<WorkflowStatusResponse | null>(initialWorkflow || null);
  const [messages, setMessages] = useState<OrchestratorMessage[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  const setWorkflowStatus = useCallback((newWorkflow: WorkflowStatusResponse) => {
    setWorkflow(newWorkflow);
  }, []);

  const addMessage = useCallback((message: OrchestratorMessage) => {
    setMessages((prev) => [message, ...prev].slice(0, 100)); // Keep last 100 messages
  }, []);

  const updateAgentStatus = useCallback((agentId: string, updates: Partial<AgentStatus>) => {
    setWorkflow((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phases: prev.phases.map((phase) => ({
          ...phase,
          agents: phase.agents.map((agent) =>
            agent.agentId === agentId ? { ...agent, ...updates } : agent
          ),
        })),
      };
    });
  }, []);

  const updateTaskStatus = useCallback((agentId: string, taskId: string, updates: Partial<TaskStatus>) => {
    setWorkflow((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phases: prev.phases.map((phase) => ({
          ...phase,
          agents: phase.agents.map((agent) =>
            agent.agentId === agentId
              ? {
                  ...agent,
                  tasks: agent.tasks.map((task) =>
                    task.taskId === taskId ? { ...task, ...updates } : task
                  ),
                }
              : agent
          ),
        })),
      };
    });
  }, []);

  const addLog = useCallback((agentId: string, log: LogEntry) => {
    setWorkflow((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phases: prev.phases.map((phase) => ({
          ...phase,
          agents: phase.agents.map((agent) =>
            agent.agentId === agentId
              ? {
                  ...agent,
                  logs: [...agent.logs, log].slice(-50), // Keep last 50 logs per agent
                }
              : agent
          ),
        })),
      };
    });
  }, []);

  const value: WorkflowContextType = {
    workflow,
    messages,
    selectedAgentId,
    selectedPhaseId,
    isPaused,
    connectionStatus,
    setWorkflowStatus,
    addMessage,
    updateAgentStatus,
    updateTaskStatus,
    addLog,
    setSelectedAgent: setSelectedAgentId,
    setSelectedPhase: setSelectedPhaseId,
    setPauseState: setIsPaused,
    setConnectionStatus,
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
}
