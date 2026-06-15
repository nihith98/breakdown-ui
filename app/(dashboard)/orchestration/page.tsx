import { WorkflowProvider } from '@/lib/context/WorkflowContext';
import { WorkflowDashboard } from '@/components/orchestration/WorkflowDashboard';
import styles from './orchestration.module.css';

interface OrchestrationPageProps {
  searchParams: { orchestrationId?: string };
}

/**
 * Orchestration Monitoring Page
 *
 * Server component that sets up the workflow provider and passes
 * the orchestration ID to the client-side dashboard.
 */
export default async function OrchestrationPage({ searchParams }: OrchestrationPageProps) {
  const orchestrationId = searchParams.orchestrationId || 'igv-20250612-a7f3k'; // Fallback for demo

  return (
    <WorkflowProvider>
      <div className={styles.page}>
        <WorkflowDashboard orchestrationId={orchestrationId} />
      </div>
    </WorkflowProvider>
  );
}
