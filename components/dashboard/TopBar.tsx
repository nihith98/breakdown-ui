import styles from '@/app/(dashboard)/dashboard.module.css';

export function TopBar() {
  return (
    <div className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <div className={styles.wordmark}>
          break<span className={styles.wordmarkHighlight}>Down</span>
        </div>
      </div>

      <div className={styles.breadcrumb}>
        <span>breakdown-ui</span>
        <span className={styles.breadcrumbSep}>›</span>
        <span>app</span>
        <span className={styles.breadcrumbSep}>›</span>
        <span>(dashboard)</span>
        <span className={styles.breadcrumbSep}>›</span>
        <span>page.tsx</span>
      </div>

      <div className={styles.topBarRight}>
        <button className={styles.iconBtn} aria-label="git branch" title="git branch">
          <GitBranchIcon />
        </button>
        <button className={styles.iconBtn} aria-label="split columns" title="split columns">
          <ColumnsIcon />
        </button>
      </div>
    </div>
  );
}

function GitBranchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function ColumnsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v18" />
      <path d="M3 9h6" />
      <path d="M15 9h6" />
      <path d="M3 15h6" />
      <path d="M15 15h6" />
    </svg>
  );
}
