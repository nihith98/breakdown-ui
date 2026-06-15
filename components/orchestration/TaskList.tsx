'use client';

import { TaskStatus } from '@/types/workflow-orchestration';
import { StatusIndicator } from './StatusIndicator';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: TaskStatus[];
}

/**
 * TaskList — Displays tasks for an agent
 */
export function TaskList({ tasks }: TaskListProps) {
  return (
    <div className={styles.taskList}>
      {tasks.length === 0 ? (
        <p className={styles.empty}>No tasks</p>
      ) : (
        tasks.map((task) => (
          <div key={task.taskId} className={`${styles.taskRow} ${styles[task.status]}`}>
            <StatusIndicator status={task.status} size="sm" />
            <div className={styles.taskContent}>
              <h5 className={styles.taskName}>{task.taskName}</h5>
              {task.description && <p className={styles.taskDescription}>{task.description}</p>}
            </div>
            <div className={styles.taskMeta}>
              {task.progress !== undefined && (
                <span className={styles.taskProgress}>{task.progress}%</span>
              )}
              {task.duration !== undefined && (
                <span className={styles.taskDuration}>{Math.round(task.duration / 1000)}s</span>
              )}
            </div>
            {task.errorMessage && (
              <div className={styles.taskError} title={task.errorMessage}>
                ⚠
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
