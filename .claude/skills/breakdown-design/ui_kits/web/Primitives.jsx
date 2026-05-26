// Atomic primitives — Button, TextField, Spinner, Tabs, ErrorBanner.
// Components attach themselves to window so other scripts can use them.

function Spinner() {
  return <span className="bd-spinner" aria-hidden="true" />;
}

function Button({ children, variant = "primary", size, disabled, loading, onClick, type = "button", ariaLabel, style }) {
  return (
    <button
      type={type}
      className="bd-btn"
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      style={style}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

function TextField({ id, label, value, onChange, type = "text", placeholder, error, disabled, autoFocus, trailing, hint }) {
  return (
    <div className="bd-field">
      {label ? <label className="bd-label" htmlFor={id}>{label}</label> : null}
      <div style={{ position: "relative", display: "flex" }}>
        <input
          id={id}
          className={"bd-input" + (error ? " error" : "")}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? id + "-error" : (hint ? id + "-hint" : undefined)}
          style={trailing ? { paddingRight: 40 } : undefined}
        />
        {trailing ? (
          <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}>
            {trailing}
          </div>
        ) : null}
      </div>
      {error ? <span id={id + "-error"} className="bd-field-error">{error}</span> : null}
      {!error && hint ? <span id={id + "-hint"} style={{ fontSize: 12, color: "var(--fg-tertiary)" }}>{hint}</span> : null}
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="bd-banner" role="alert">
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss ? (
        <button type="button" className="close" onClick={onDismiss} aria-label="Dismiss error">✕</button>
      ) : null}
    </div>
  );
}

function Tabs({ items, value, onChange }) {
  return (
    <div className="bd-tabs" role="tablist">
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          className="bd-tab"
          data-active={value === it.value}
          aria-selected={value === it.value}
          onClick={() => onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ title, body, action }) {
  return (
    <div className="bd-empty">
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

function Modal({ open, title, onClose, children, footer }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="bd-modal-scrim" onClick={onClose} />
      <div className="bd-modal" role="dialog" aria-modal="true" aria-label={title}>
        {title ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{title}</h2>
            <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: "var(--fg-secondary)", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
          </div>
        ) : null}
        {children}
        {footer ? <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>{footer}</div> : null}
      </div>
    </>
  );
}

// Icon: thin currentColor stroke, matching the Lucide-style brief
function Icon({ name, size = 16 }) {
  const paths = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    receipt: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></>,
    repeat: <><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></>,
    chart: <><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></>,
    settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>,
    plus: <><path d="M5 12h14"/><path d="M12 5v14"/></>,
    eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></>,
    arrowRight: <><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></>,
    moon: <><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
  };
  return (
    <svg className="ic" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

Object.assign(window, { Spinner, Button, TextField, ErrorBanner, Tabs, EmptyState, Modal, Icon });
