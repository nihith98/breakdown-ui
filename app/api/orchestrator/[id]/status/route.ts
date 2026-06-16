import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { WorkflowStatusResponse } from '@/types/workflow-orchestration';

/**
 * API Route: GET /api/orchestrator/[id]/status
 *
 * Reads the live workflow status snapshot written by
 * Workflow-Trigger.psm1 (Write-WorkflowStatus) to
 * <repo-root>/.breakdown/workflow-status/<id>.json and returns it as-is.
 *
 * Pass `latest` as the id to resolve the most recently started workflow
 * without already knowing its generated id.
 */

function statusDir(): string {
  // breakdown-ui is a sibling submodule of the .breakdown/ state directory
  // at the repo root, not a parent of it.
  return process.env.WORKFLOW_STATUS_DIR || path.join(process.cwd(), '..', '.breakdown', 'workflow-status');
}

async function resolveWorkflowId(id: string): Promise<string> {
  if (id !== 'latest') return id;

  const latestPath = path.join(statusDir(), 'latest.json');
  const raw = await fs.readFile(latestPath, 'utf-8');
  const { workflowId } = JSON.parse(raw) as { workflowId: string };
  return workflowId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orchestrationId = await resolveWorkflowId(id);

    const filePath = path.join(statusDir(), `${orchestrationId}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    const data: WorkflowStatusResponse = JSON.parse(raw);

    return NextResponse.json(data);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code;
    if (code === 'ENOENT') {
      return NextResponse.json(
        { error: 'No status found for this workflow yet. Has the workflow been started?' },
        { status: 404 }
      );
    }

    console.error('Failed to read orchestration status:', error);
    return NextResponse.json(
      { error: 'Failed to read orchestration status' },
      { status: 500 }
    );
  }
}
