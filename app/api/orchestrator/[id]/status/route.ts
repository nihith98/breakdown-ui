import { NextRequest, NextResponse } from 'next/server';
import { WorkflowStatusResponse } from '@/types/workflow-orchestration';

/**
 * API Route: GET /api/orchestrator/[id]/status
 *
 * Fetches the current status of a workflow orchestration.
 * In production, this would call the Java backend via apiClient.
 * For demo purposes, returns mock data.
 */

// Mock data generator for demo
function generateMockWorkflowStatus(orchestrationId: string): WorkflowStatusResponse {
  const now = new Date('2026-06-12T22:30:00Z');
  const startedAt = new Date(now.getTime() - 5 * 60000); // Started 5 minutes ago

  return {
    orchestrationId,
    startedAt: startedAt.toISOString(),
    estimatedDuration: 900000, // 15 minutes
    overallProgress: 35,
    status: 'running',
    phases: [
      {
        phaseId: 'phase-1',
        phaseName: 'Code Generation',
        position: 1,
        status: 'completed',
        progress: 100,
        startedAt: startedAt.toISOString(),
        completedAt: new Date(startedAt.getTime() + 90000).toISOString(),
        estimatedDuration: 90000,
        agents: [
          {
            agentId: 'agent-1',
            agentNumber: 1,
            agentName: 'Backend Code Generator',
            role: 'Backend Code Generator',
            status: 'completed',
            progress: 100,
            parentPhaseId: 'phase-1',
            parallelIndex: 1,
            tasks: [
              {
                taskId: 'task-1-1',
                agentId: 'agent-1',
                taskName: 'Generate model classes',
                description: 'Create Group, Transaction, User models',
                status: 'completed',
                duration: 12000,
                startedAt: startedAt.toISOString(),
                completedAt: new Date(startedAt.getTime() + 12000).toISOString(),
              },
              {
                taskId: 'task-1-2',
                agentId: 'agent-1',
                taskName: 'Generate service layer',
                description: 'Create GroupService, TransactionService',
                status: 'completed',
                duration: 15000,
                startedAt: new Date(startedAt.getTime() + 12000).toISOString(),
                completedAt: new Date(startedAt.getTime() + 27000).toISOString(),
              },
              {
                taskId: 'task-1-3',
                agentId: 'agent-1',
                taskName: 'Generate controllers',
                description: 'Create REST endpoints',
                status: 'completed',
                duration: 18000,
                startedAt: new Date(startedAt.getTime() + 27000).toISOString(),
                completedAt: new Date(startedAt.getTime() + 45000).toISOString(),
              },
              {
                taskId: 'task-1-4',
                agentId: 'agent-1',
                taskName: 'Generate tests',
                description: 'JUnit5 + Mockito tests',
                status: 'completed',
                duration: 27000,
                startedAt: new Date(startedAt.getTime() + 45000).toISOString(),
                completedAt: new Date(startedAt.getTime() + 72000).toISOString(),
              },
            ],
            elapsedTime: 72000,
            estimatedTimeRemaining: 0,
            logs: [
              {
                logId: 'log-1-1',
                agentId: 'agent-1',
                timestamp: startedAt.toISOString(),
                level: 'info',
                message: 'Starting code generation for group detail view',
              },
              {
                logId: 'log-1-2',
                agentId: 'agent-1',
                timestamp: new Date(startedAt.getTime() + 1000).toISOString(),
                level: 'info',
                message: 'Analyzing handoff specification...',
              },
              {
                logId: 'log-1-3',
                agentId: 'agent-1',
                timestamp: new Date(startedAt.getTime() + 3000).toISOString(),
                level: 'info',
                message: 'Generated 9 Java files with 1,247 lines',
              },
            ],
          },
          {
            agentId: 'agent-2',
            agentNumber: 2,
            agentName: 'Frontend Code Generator',
            role: 'Frontend Code Generator',
            status: 'completed',
            progress: 100,
            parentPhaseId: 'phase-1',
            parallelIndex: 2,
            tasks: [
              {
                taskId: 'task-2-1',
                agentId: 'agent-2',
                taskName: 'Generate React components',
                status: 'completed',
                duration: 18000,
              },
              {
                taskId: 'task-2-2',
                agentId: 'agent-2',
                taskName: 'Generate API integration',
                status: 'completed',
                duration: 9000,
              },
              {
                taskId: 'task-2-3',
                agentId: 'agent-2',
                taskName: 'Generate tests',
                status: 'completed',
                duration: 12000,
              },
            ],
            elapsedTime: 39000,
            estimatedTimeRemaining: 0,
            logs: [],
          },
        ],
      },
      {
        phaseId: 'phase-2',
        phaseName: 'Build Pipeline',
        position: 2,
        status: 'running',
        progress: 65,
        startedAt: new Date(startedAt.getTime() + 95000).toISOString(),
        estimatedDuration: 180000,
        agents: [
          {
            agentId: 'agent-3',
            agentNumber: 3,
            agentName: 'Backend Build Agent',
            role: 'Backend Build Agent',
            status: 'running',
            progress: 75,
            parentPhaseId: 'phase-2',
            tasks: [
              {
                taskId: 'task-3-1',
                agentId: 'agent-3',
                taskName: 'Compile Java sources',
                status: 'completed',
                progress: 100,
                duration: 45000,
              },
              {
                taskId: 'task-3-2',
                agentId: 'agent-3',
                taskName: 'Run unit tests',
                status: 'running',
                progress: 65,
                startedAt: new Date(startedAt.getTime() + 140000).toISOString(),
              },
              {
                taskId: 'task-3-3',
                agentId: 'agent-3',
                taskName: 'Generate coverage report',
                status: 'pending',
              },
            ],
            elapsedTime: 115000,
            estimatedTimeRemaining: 35000,
            logs: [
              {
                logId: 'log-3-1',
                agentId: 'agent-3',
                timestamp: new Date(startedAt.getTime() + 95000).toISOString(),
                level: 'info',
                message: 'Starting backend build...',
              },
              {
                logId: 'log-3-2',
                agentId: 'agent-3',
                timestamp: new Date(startedAt.getTime() + 100000).toISOString(),
                level: 'info',
                message: 'Compiling 12 Java files...',
              },
              {
                logId: 'log-3-3',
                agentId: 'agent-3',
                timestamp: new Date(startedAt.getTime() + 140000).toISOString(),
                level: 'info',
                message: 'Running 34 unit tests...',
              },
              {
                logId: 'log-3-4',
                agentId: 'agent-3',
                timestamp: new Date(startedAt.getTime() + 190000).toISOString(),
                level: 'info',
                message: '32/34 tests passed (94%)',
              },
            ],
          },
          {
            agentId: 'agent-4',
            agentNumber: 4,
            agentName: 'Frontend Build Agent',
            role: 'Frontend Build Agent',
            status: 'running',
            progress: 55,
            parentPhaseId: 'phase-2',
            tasks: [
              {
                taskId: 'task-4-1',
                agentId: 'agent-4',
                taskName: 'TypeScript compilation',
                status: 'completed',
                duration: 25000,
              },
              {
                taskId: 'task-4-2',
                agentId: 'agent-4',
                taskName: 'Next.js build',
                status: 'running',
                progress: 55,
              },
              {
                taskId: 'task-4-3',
                agentId: 'agent-4',
                taskName: 'Jest tests',
                status: 'pending',
              },
            ],
            elapsedTime: 105000,
            estimatedTimeRemaining: 75000,
            logs: [],
          },
        ],
      },
      {
        phaseId: 'phase-3',
        phaseName: 'Deployment',
        position: 3,
        status: 'pending',
        progress: 0,
        estimatedDuration: 120000,
        agents: [
          {
            agentId: 'agent-5',
            agentNumber: 5,
            agentName: 'Deployment Agent',
            role: 'Deployment Agent',
            status: 'pending',
            progress: 0,
            parentPhaseId: 'phase-3',
            tasks: [],
            elapsedTime: 0,
            estimatedTimeRemaining: 120000,
            logs: [],
          },
        ],
      },
      {
        phaseId: 'phase-4',
        phaseName: 'Testing',
        position: 4,
        status: 'pending',
        progress: 0,
        estimatedDuration: 300000,
        agents: [
          {
            agentId: 'agent-6',
            agentNumber: 6,
            agentName: 'API Test Agent',
            role: 'API Test Agent',
            status: 'pending',
            progress: 0,
            parentPhaseId: 'phase-4',
            tasks: [],
            elapsedTime: 0,
            estimatedTimeRemaining: 300000,
            logs: [],
          },
          {
            agentId: 'agent-7',
            agentNumber: 7,
            agentName: 'E2E Test Agent',
            role: 'E2E Test Agent',
            status: 'pending',
            progress: 0,
            parentPhaseId: 'phase-4',
            tasks: [],
            elapsedTime: 0,
            estimatedTimeRemaining: 300000,
            logs: [],
          },
        ],
      },
      {
        phaseId: 'phase-5',
        phaseName: 'Finalization',
        position: 5,
        status: 'pending',
        progress: 0,
        estimatedDuration: 60000,
        agents: [
          {
            agentId: 'agent-8',
            agentNumber: 8,
            agentName: 'Commit & PR Agent',
            role: 'Commit & PR Agent',
            status: 'pending',
            progress: 0,
            parentPhaseId: 'phase-5',
            tasks: [],
            elapsedTime: 0,
            estimatedTimeRemaining: 60000,
            logs: [],
          },
        ],
      },
    ],
    metrics: {
      totalTasks: 34,
      tasksCompleted: 14,
      tasksFailed: 0,
      tasksRunning: 3,
      tasksPending: 17,
      agentsRunning: 2,
      agentsCompleted: 2,
      agentsFailed: 0,
      totalDuration: 300000,
      estimatedTotalDuration: 900000,
      failureRate: 0,
    },
    lastUpdated: now.toISOString(),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orchestrationId = params.id;

    // In production, fetch from Java backend via apiClient
    // const response = await apiClient.get(`/orchestrator/${orchestrationId}/status`);
    // return NextResponse.json(response.data);

    // For demo, return mock data
    const mockData = generateMockWorkflowStatus(orchestrationId);
    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Failed to fetch orchestration status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orchestration status' },
      { status: 500 }
    );
  }
}
