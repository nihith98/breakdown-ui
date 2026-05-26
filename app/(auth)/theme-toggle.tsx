'use client';

import { useEffect, useState } from 'react';
import styles from './auth.module.css';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    setIsDark(theme === 'dark');
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('bd-theme', next);
    setIsDark(next === 'dark');
  };

  if (!mounted) {
    return <button className={styles.statusBarThemeToggle} aria-label="Toggle theme" disabled>☀️</button>;
  }

  return (
    <button
      className={styles.statusBarThemeToggle}
      onClick={toggleTheme}
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
