// Auth surface — gradient page + glass hero panel + form

function AuthShell({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
    }}>
      <div style={{
        display: "flex",
        width: "100%",
        maxWidth: 1100,
        gap: 48,
        alignItems: "center",
      }}>
        <div className="bd-hero" style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}>
          <div className="bd-card lavender flat" style={{ padding: 48, textAlign: "center", maxWidth: 320, width: "100%" }}>
            <div style={{
              fontFamily: "var(--font-sans)",
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.05em",
              marginBottom: 16,
              color: "var(--fg-primary)",
              lineHeight: 1,
            }}>
              break<span style={{ color: "var(--accent-highlight)" }}>Down</span>
            </div>
            <p style={{ margin: 0, color: "var(--fg-secondary)", fontSize: 15, lineHeight: 1.6 }}>
              Privacy-first expense splitting with friends and family.
            </p>
            <div style={{
              marginTop: 32,
              paddingTop: 20,
              borderTop: "1px solid var(--border-divider)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--fg-tertiary)",
              lineHeight: 1.7,
            }}>
              <div>username only.</div>
              <div>no email · no phone · no tracking.</div>
              <div style={{ marginTop: 6, color: "var(--money-positive)" }}>v0.1.0</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, width: "100%", maxWidth: 460, display: "flex", justifyContent: "center" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin, onGoRegister }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [banner, setBanner] = React.useState("");
  const [errs, setErrs] = React.useState({});

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!username.trim()) next.username = "Username is required";
    if (!password) next.password = "Password is required";
    setErrs(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setBanner("");
    // Fake auth — the kit is a mock
    setTimeout(() => {
      setBusy(false);
      onLogin?.(username.trim());
    }, 350);
  };

  return (
    <div className="bd-card flat" style={{ padding: 32, width: "100%", maxWidth: 460 }}>
      <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {banner ? <ErrorBanner message={banner} onDismiss={() => setBanner("")} /> : null}

        <TextField
          id="username"
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChange={(v) => { setUsername(v); if (errs.username) setErrs({ ...errs, username: null }); }}
          error={errs.username}
          autoFocus
          disabled={busy}
        />

        <TextField
          id="password"
          label="Password"
          type={showPw ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(v) => { setPassword(v); if (errs.password) setErrs({ ...errs, password: null }); }}
          error={errs.password}
          disabled={busy}
          trailing={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label="Toggle password visibility"
              disabled={busy}
              style={{ background: "none", border: "none", padding: 8, cursor: "pointer", color: "var(--fg-secondary)", display: "flex" }}
            >
              <Icon name={showPw ? "eyeOff" : "eye"} size={18} />
            </button>
          }
        />

        <Button type="submit" variant="primary" loading={busy} disabled={busy}>
          {busy ? "LOGGING IN…" : "LOG IN"}
        </Button>
      </form>
      <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--fg-secondary)" }}>
        Don't have an account?{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); onGoRegister?.(); }}>Sign up</a>
      </div>
    </div>
  );
}

function RegisterForm({ onRegister, onGoLogin }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [banner, setBanner] = React.useState("");
  const [errs, setErrs] = React.useState({});

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    const u = username.trim();
    if (!u) next.username = "Pick a username";
    else if (!/^[a-z0-9_]{3,24}$/i.test(u)) next.username = "3–24 chars · letters, numbers, underscore";
    if (!password) next.password = "Set a password";
    else if (password.length < 8) next.password = "At least 8 characters";
    setErrs(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setBanner("");
    setTimeout(() => onRegister?.(u), 350);
  };

  return (
    <div className="bd-card flat" style={{ padding: 32, width: "100%", maxWidth: 460 }}>
      <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {banner ? <ErrorBanner message={banner} onDismiss={() => setBanner("")} /> : null}

        <TextField
          id="r-username"
          label="Username"
          placeholder="e.g. trip_lead"
          value={username}
          onChange={(v) => { setUsername(v); if (errs.username) setErrs({ ...errs, username: null }); }}
          error={errs.username}
          hint={errs.username ? null : "3–24 chars · stays inside breakDown"}
          autoFocus
          disabled={busy}
        />

        <TextField
          id="r-password"
          label="Password"
          type={showPw ? "text" : "password"}
          placeholder="At least 8 characters"
          value={password}
          onChange={(v) => { setPassword(v); if (errs.password) setErrs({ ...errs, password: null }); }}
          error={errs.password}
          disabled={busy}
          trailing={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label="Toggle password visibility"
              disabled={busy}
              style={{ background: "none", border: "none", padding: 8, cursor: "pointer", color: "var(--fg-secondary)", display: "flex" }}
            >
              <Icon name={showPw ? "eyeOff" : "eye"} size={18} />
            </button>
          }
        />

        <Button type="submit" variant="primary" loading={busy} disabled={busy}>
          {busy ? "CREATING…" : "CREATE ACCOUNT"}
        </Button>

        <div style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: "var(--fg-tertiary)",
          lineHeight: 1.7,
          textAlign: "center",
          paddingTop: 4,
        }}>
          <span style={{ color: "var(--syntax-comment)" }}>// </span>
          we store only your username · no email · no phone
        </div>
      </form>

      <div style={{
        marginTop: 24,
        paddingTop: 20,
        borderTop: "1px solid var(--border-divider)",
        textAlign: "center",
        fontSize: 14,
        color: "var(--fg-secondary)",
      }}>
        Already have an account?{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); onGoLogin?.(); }}>Log in</a>
      </div>
    </div>
  );
}

function SuccessScreen({ username, onContinue }) {
  React.useEffect(() => {
    const t = setTimeout(() => onContinue?.(), 2200);
    return () => clearTimeout(t);
  }, [onContinue]);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ display: "inline-flex", padding: 16, borderRadius: "50%", border: "1px solid var(--money-positive)", color: "var(--money-positive)", marginBottom: 20 }}>
          <Icon name="check" size={28} />
        </div>
        <h1 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 600 }}>Logged in</h1>
        <p style={{ color: "var(--fg-secondary)", margin: "0 0 32px 0", fontSize: 14 }}>
          Welcome back, <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-highlight)" }}>{username}</span>. Redirecting…
        </p>
        <Button variant="primary" onClick={onContinue}>Continue to dashboard</Button>
      </div>
    </div>
  );
}

Object.assign(window, { AuthShell, LoginForm, RegisterForm, SuccessScreen });
