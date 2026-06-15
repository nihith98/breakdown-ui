'use client';

import { CSSProperties, ReactNode } from 'react';

interface LogoutLoaderProps {
  /** Whether the loader is visible */
  isVisible: boolean;
  /** Optional variant for loader display */
  variant?: 'minimal' | 'statusbar' | 'spinner';
  /** Custom status text (default: "Signing you out") */
  statusText?: string;
  /** Optional subtitle text for spinner variant */
  subtitleText?: string;
  /** Optional aria-label for accessibility */
  ariaLabel?: string;
}

export function LogoutLoader({
  isVisible,
  variant = 'statusbar',
  statusText = 'Signing you out',
  subtitleText = 'Securing your data',
  ariaLabel = 'Signing you out. Please wait.',
}: LogoutLoaderProps): ReactNode {
  if (!isVisible) {
    return null;
  }

  const overlayStyles: CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const modalStyles: CSSProperties = {
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px 56px',
    width: '90%',
    maxWidth: '580px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '32px',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
    opacity: 1,
  };

  const wordmarkStyles: CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '-0.04em',
    textAlign: 'center',
  };

  const dotStyles: CSSProperties = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    animation: 'pulse-logout 1s ease-in-out infinite',
    flexShrink: 0,
  };

  const minimalDotStyles: CSSProperties = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    animation: 'pulse-logout 1.5s ease-in-out infinite',
  };

  const spinnerStyles: CSSProperties = {
    width: '32px',
    height: '32px',
    border: '2px solid var(--border-default)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin-logout 0.8s linear infinite',
  };

  const contentContainerStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'center',
    width: '100%',
  };

  const statusBarStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: 'var(--font-mono)',
    fontSize: '15px',
    color: 'var(--fg-secondary)',
    padding: '16px 20px',
    backgroundColor: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    width: '100%',
  };

  const statusTextStyles: CSSProperties = {
    color: 'var(--fg-primary)',
  };

  const spinnerContainerStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  };

  const spinnerLabelStyles: CSSProperties = {
    fontSize: '16px',
    fontWeight: 500,
    color: 'var(--fg-primary)',
  };

  const spinnerSublabelStyles: CSSProperties = {
    fontSize: '12px',
    color: 'var(--fg-tertiary)',
    marginTop: '4px',
  };

  const minimalContainerStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  };

  const minimalTextStyles: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '15px',
    color: 'var(--fg-secondary)',
    letterSpacing: '0.2px',
  };

  const minimalBracketStyles: CSSProperties = {
    color: 'var(--syntax-keyword)',
  };

  const minimalWordStyles: CSSProperties = {
    color: 'var(--fg-primary)',
  };

  const renderLoaderContent = (): ReactNode => {
    switch (variant) {
      case 'minimal':
        return (
          <div style={minimalContainerStyles}>
            <div style={minimalDotStyles} />
            <div style={minimalTextStyles}>
              <span style={minimalBracketStyles}>●</span>{' '}
              <span style={minimalWordStyles}>{statusText}</span>
            </div>
          </div>
        );

      case 'spinner':
        return (
          <div style={spinnerContainerStyles}>
            <div style={spinnerStyles} />
            <div>
              <div style={spinnerLabelStyles}>{statusText}</div>
              <div style={spinnerSublabelStyles}>{subtitleText}</div>
            </div>
          </div>
        );

      case 'statusbar':
      default:
        return (
          <div style={statusBarStyles}>
            <span style={dotStyles} />
            <span style={statusTextStyles}>{statusText}</span>
          </div>
        );
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse-logout {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes spin-logout {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={overlayStyles} role="status" aria-label={ariaLabel} aria-live="polite">
        <div style={modalStyles} role="dialog" aria-modal="true" aria-label={ariaLabel}>
          <div style={wordmarkStyles}>
            <span style={{ color: 'var(--fg-primary)' }}>break</span>
            <span style={{ color: 'var(--accent-highlight)' }}>Down</span>
          </div>
          <div style={contentContainerStyles}>{renderLoaderContent()}</div>
        </div>
      </div>
    </>
  );
}
