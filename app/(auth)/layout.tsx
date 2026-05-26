import styles from './auth.module.css';
import { ThemeToggle } from './theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.hero}>
            <div className={styles.heroCard}>
              <div className={styles.logo}>
                <span className={styles.logoBreak}>break</span>
                <span className={styles.logoDown}>Down</span>
              </div>
              <p className={styles.tagline}>Privacy-first expense splitting with friends and family</p>
              <div className={styles.taglineFooter}>
                <div className={styles.taglineFooterItem}>username only.</div>
                <div className={styles.taglineFooterItem}>no email · no phone · no tracking.</div>
                <div className={`${styles.taglineFooterItem} ${styles.taglineVersion}`}>v0.1.0</div>
              </div>
            </div>
          </div>
          <div className={styles.formPanel}>
            {children}
          </div>
        </div>
      </div>
      <div className={styles.statusBar}>
        <div className={styles.statusBarContent}>
          <div className={styles.statusBarLeft}>
            <span className={styles.statusBarVersion}>v 0.1.0</span>
            <span className={styles.statusBarDivider}>·</span>
            <span className={styles.statusBarTelemetry}>no telemetry</span>
          </div>
          <div className={styles.statusBarRight}>
            <a
              href="https://github.com/nihith98/breakdown-project"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.statusBarLink}
              title="View on GitHub"
            >
              github
            </a>
            <span className={styles.statusBarDivider}>·</span>
            <a
              href="https://www.linkedin.com/in/nihith-sistla-65314414b"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.statusBarLink}
              title="Connect on LinkedIn"
            >
              connect
            </a>
            <span className={styles.statusBarDivider}>·</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
