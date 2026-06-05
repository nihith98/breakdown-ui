'use client';

import { useState, useEffect } from 'react';
import styles from '@/app/(dashboard)/dashboard.module.css';

export function StatusBar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('bd-theme') as 'light' | 'dark' | null;
    const initial = stored || 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('bd-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className={styles.statusBar}>
      <div className={styles.statusLeft}>
        <div className={styles.statusItem}>
          <span className={styles.statusKey}>v</span>
          <span className={styles.statusValue}>0.1.0</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusKey}>engine</span>
          <span className={styles.statusValue}>0.8.1</span>
        </div>
        <div className={styles.statusItem}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          <span className={styles.statusValue}>main</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusDot} />
          <span className={styles.statusValue}>no telemetry</span>
        </div>
      </div>

      <div className={styles.statusRight}>
        <button
          className={styles.statusThemeBtn}
          onClick={toggleTheme}
          aria-label="toggle theme"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          <span>{theme}</span>
        </button>
        <a
          href="https://github.com/nihith98/breakdown-project"
          className={styles.statusLink}
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
        >
          feedback
        </a>
      </div>
    </div>
  );
}

function SunIcon() {
  return (
    <svg className={styles.statusThemeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className={styles.statusThemeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
