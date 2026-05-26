// Top-level app: routes between auth → success → dashboard, owns mock state.

const SEED_GROUPS = [
  {
    id: "g1",
    name: "Sept Hawaii trip",
    family: false,
    members: ["you", "alex", "sam", "priya"],
    expenses: [
      { id: "t1", name: "Dinner @ Nobu", amount: 168.40, paidBy: "alex", split: ["you", "alex", "sam", "priya"] },
      { id: "t2", name: "Lyft from JFK", amount: 72.80,  paidBy: "you",  split: ["you", "alex", "sam", "priya"] },
      { id: "t3", name: "Groceries · Whole Foods", amount: 67.12, paidBy: "sam", split: ["you", "alex", "sam", "priya"] },
      { id: "t4", name: "Snorkel rental",      amount: 90.00, paidBy: "priya", split: ["you", "alex", "sam", "priya"] },
      { id: "t5", name: "Sunset boat ride",    amount: 240.00, paidBy: "alex", split: ["you", "alex", "sam", "priya"] },
    ],
  },
  {
    id: "g2",
    name: "The Lees",
    family: true,
    members: ["you", "mom", "dad", "kira"],
    expenses: [
      { id: "f1", name: "Costco run",           amount: 184.55, paidBy: "you",  split: ["you", "mom", "dad", "kira"] },
      { id: "f2", name: "Electric bill · May",  amount: 96.30,  paidBy: "mom",  split: ["you", "mom", "dad", "kira"] },
      { id: "f3", name: "Internet (recurring)", amount: 70.00,  paidBy: "dad",  split: ["you", "mom", "dad", "kira"] },
    ],
  },
  {
    id: "g3",
    name: "Brunch crew",
    family: false,
    members: ["you", "jordan", "rae"],
    expenses: [
      { id: "b1", name: "Sqirl tip",  amount: 42.00, paidBy: "rae",  split: ["you", "jordan", "rae"] },
    ],
  },
];

function netForUser(group, user) {
  let n = 0;
  group.expenses.forEach((tx) => {
    const share = tx.amount / tx.split.length;
    if (tx.paidBy === user) n += tx.amount - share;
    else if (tx.split.includes(user)) n -= share;
  });
  return Math.round(n * 100) / 100;
}

function App({ theme, onThemeToggle }) {
  const [stage, setStage] = React.useState("login"); // login | register | success | app
  const [username, setUsername] = React.useState("");
  const [groups, setGroups] = React.useState(SEED_GROUPS);
  const [activeGroupId, setActiveGroupId] = React.useState("g1");
  const [section, setSection] = React.useState("groups");
  const [tab, setTab] = React.useState("expenses");
  const [addOpen, setAddOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const active = groups.find((g) => g.id === activeGroupId);

  const totals = React.useMemo(() => {
    let owe = 0, owed = 0;
    groups.forEach((g) => {
      const n = netForUser(g, "you");
      if (n < 0) owe += -n;
      else if (n > 0) owed += n;
    });
    return { owe, owed, net: owed - owe };
  }, [groups]);

  const handleAdd = (data) => {
    setGroups((prev) => prev.map((g) =>
      g.id === activeGroupId
        ? { ...g, expenses: [...g.expenses, { ...data, id: "t" + Date.now() }] }
        : g
    ));
    setToast({ kind: "success", text: "Expense added. Settlements updated." });
    setTimeout(() => setToast(null), 2400);
  };

  if (stage === "login") {
    return (<>
      <AuthShell>
        <LoginForm
          onLogin={(u) => { setUsername(u); setStage("app"); }}
          onGoRegister={() => setStage("register")}
        />
      </AuthShell>
      {/* status bar lives in IDEChrome */}
    </>);
  }
  if (stage === "register") {
    return (<>
      <AuthShell>
        <RegisterForm
          onRegister={(u) => { setUsername(u); setStage("app"); }}
          onGoLogin={() => setStage("login")}
        />
      </AuthShell>
    </>);
  }

  // Dashboard
  const fmt = (n) => (n < 0 ? "-" : n > 0 ? "+" : "") + "$" + Math.abs(n).toFixed(2);

  return (
    <div className="bd-shell">
      <Sidebar
        active={section}
        onNav={setSection}
        username={username || "you"}
        onLogout={() => { setStage("login"); setUsername(""); }}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />
      <main className="bd-main">
        {section === "groups" ? (
          <>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>Groups</h1>
                <p style={{ margin: "4px 0 0 0", color: "var(--fg-secondary)", fontSize: 14 }}>
                  {groups.length} active · {groups.reduce((a, g) => a + g.expenses.length, 0)} total expenses
                </p>
              </div>
              <Button onClick={() => setAddOpen(true)}>
                <Icon name="plus" size={16} /> <span style={{ whiteSpace: "nowrap" }}>ADD EXPENSE</span>
              </Button>
            </header>

            <section aria-label="Summary" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
              <SummaryCard label="You owe"     amount={fmt(-totals.owe)}  sign="negative" sub={totals.owe ? "across " + groups.filter((g) => netForUser(g, "you") < 0).length + " group(s)" : "nothing outstanding"} />
              <SummaryCard label="Owed to you" amount={fmt(totals.owed)}  sign="positive" sub={totals.owed ? "across " + groups.filter((g) => netForUser(g, "you") > 0).length + " group(s)" : "nothing outstanding"} />
              <SummaryCard label="Net"         amount={fmt(totals.net)}   sign={totals.net < 0 ? "negative" : totals.net > 0 ? "positive" : "neutral"} sub="all groups · all time" />
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" }}>
              <aside aria-label="Group list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="bd-label" style={{ marginBottom: 4 }}>Your groups</div>
                {groups.map((g) => (
                  <GroupCard
                    key={g.id}
                    group={{ ...g, net: netForUser(g, "you") }}
                    active={g.id === activeGroupId}
                    onClick={() => { setActiveGroupId(g.id); setTab("expenses"); }}
                  />
                ))}
              </aside>

              <section aria-label="Group detail">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>
                    {active.name}
                    {active.family ? <span style={{
                      marginLeft: 10, fontFamily: "var(--font-mono)", fontSize: 11,
                      padding: "2px 8px", borderRadius: 4,
                      color: "var(--accent-highlight)",
                      background: "rgba(167,139,250,0.12)",
                      border: "1px solid rgba(167,139,250,0.30)",
                      verticalAlign: "middle",
                    }}>family</span> : null}
                  </h2>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-secondary)" }}>
                    {active.members.join(" · ")}
                  </span>
                </div>

                <Tabs
                  value={tab}
                  onChange={setTab}
                  items={[
                    { value: "expenses", label: "Expenses" },
                    { value: "settle",   label: "Settle up" },
                    { value: "members",  label: "Members" },
                  ]}
                />
                <div style={{ marginTop: 18 }}>
                  {tab === "expenses" ? (
                    <TransactionList items={active.expenses} currentUser="you" />
                  ) : null}
                  {tab === "settle" ? (
                    <SettleUpPanel group={active} currentUser="you" />
                  ) : null}
                  {tab === "members" ? (
                    <div className="bd-card flat" style={{ padding: 20 }}>
                      <div className="bd-label" style={{ marginBottom: 12 }}>{active.members.length} members</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {active.members.map((m) => (
                          <div key={m} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--font-mono)", fontSize: 13 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: "50%",
                              background: "rgba(99,102,241,0.10)",
                              border: "1px solid var(--border-default)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, fontWeight: 600,
                              color: m === "you" ? "var(--accent-highlight)" : "var(--fg-primary)",
                            }}>{m[0].toUpperCase()}</div>
                            <span style={{ color: m === "you" ? "var(--accent-highlight)" : "var(--fg-primary)" }}>{m}</span>
                            <span style={{ marginLeft: "auto", color: "var(--fg-tertiary)", fontSize: 11 }}>
                              {(() => { const n = netForUser(active, m); return n === 0 ? "settled" : (n < 0 ? "owes " : "owed ") + fmt(Math.abs(n)); })()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </>
        ) : null}

        {section === "activity" ? (
          <>
            <h1 style={{ margin: "0 0 24px 0", fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>Activity</h1>
            <TransactionList items={groups.flatMap((g) => g.expenses).slice(0, 12)} currentUser="you" />
          </>
        ) : null}

        {section === "recurring" ? (
          <EmptyState
            title="No recurring expenses yet."
            body={"Subscriptions, monthly bills, weekly groceries — define once, settle regularly."}
            action={<Button variant="primary"><Icon name="plus" size={14} /> ADD RECURRING</Button>}
          />
        ) : null}

        {section === "analytics" ? (
          <EmptyState
            title="Analytics is loading the kettle."
            body="See who's bankrolling the trips. No judgement, just clarity. (Coming soon.)"
          />
        ) : null}

        {section === "settings" ? (
          <>
            <h1 style={{ margin: "0 0 24px 0", fontSize: 28, fontWeight: 600 }}>Settings</h1>
            <div className="bd-card flat" style={{ padding: 24, maxWidth: 580 }}>
              <div className="bd-label" style={{ marginBottom: 8 }}>What we collect</div>
              <p style={{ margin: "0 0 16px 0", color: "var(--fg-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                Only your username. No email, phone, location, or other identifiers. Your expense
                transactions are stored on secure servers so you can access them from any device.
                We don't sell your data or share it with third parties. You own what you create.
              </p>
              <Button variant="secondary" size="sm">EXPORT MY DATA</Button>
            </div>
            <div className="bd-card flat" style={{ padding: 20, marginTop: 16, maxWidth: 580, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>// frontend</span><span style={{ color: "var(--fg-primary)" }}>v0.1.0</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>settlement-engine</span><span style={{ color: "var(--fg-primary)" }}>v0.8.1</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>api</span><span style={{ color: "var(--fg-primary)" }}>v2</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>telemetry</span><span style={{ color: "var(--money-positive)" }}>none</span></div>
              <div style={{ marginTop: 10, color: "var(--fg-tertiary)" }}>Built with precision. No telemetry. Just transparency.</div>
            </div>
          </>
        ) : null}
      </main>

      <AddExpenseModal
        open={addOpen}
        members={active?.members ?? []}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
      />

      {toast ? (
        <div style={{
          position: "fixed", bottom: 24, right: 24,
          padding: "10px 14px",
          background: "rgba(34,197,94,0.10)",
          border: "1px solid rgba(34,197,94,0.40)",
          borderRadius: 8,
          color: "var(--money-positive)",
          fontSize: 13,
          display: "flex", alignItems: "center", gap: 8,
          backdropFilter: "blur(10px)",
          zIndex: 200,
        }}>
          <Icon name="check" size={14} /> {toast.text}
        </div>
      ) : null}
    </div>
  );
}

window.App = App;
