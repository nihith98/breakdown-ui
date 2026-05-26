// Dashboard surface — Sidebar, SummaryCard, GroupCard, TransactionList, AddExpense modal

function Sidebar({ active, onNav, username, onLogout, theme, onThemeToggle }) {
  const items = [
    { id: "groups", label: "Groups", icon: "users" },
    { id: "activity", label: "Activity", icon: "receipt" },
    { id: "recurring", label: "Recurring", icon: "repeat" },
    { id: "analytics", label: "Analytics", icon: "chart" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];
  return (
    <nav className="bd-sidebar" aria-label="Primary">
      <div className="wordmark"><span>break<span className="accent">Down</span></span></div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it) => (
          <div
            key={it.id}
            className="bd-nav-item"
            data-active={active === it.id}
            role="button"
            tabIndex={0}
            onClick={() => onNav(it.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onNav(it.id); }}
          >
            <Icon name={it.icon} size={16} />
            <span>{it.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid var(--border-divider)", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(167,139,250,0.15)",
            border: "1px solid var(--border-lavender)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent-highlight)",
            fontWeight: 600,
          }}>
            {username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-primary)" }}>{username}</span>
            <span style={{ fontSize: 10, color: "var(--fg-tertiary)" }}>username only · no email</span>
          </div>
        </div>
        <div className="bd-nav-item" role="button" tabIndex={0} onClick={onLogout}>
          <Icon name="logout" size={16} />
          <span>Log out</span>
        </div>
      </div>
    </nav>
  );
}

function SummaryCard({ label, amount, sign, sub }) {
  return (
    <div className="bd-card flat" style={{ padding: "20px 22px" }}>
      <div className="bd-label" style={{ marginBottom: 8 }}>{label}</div>
      <div className="bd-amount" data-sign={sign} style={{ fontSize: 28, lineHeight: 1 }}>{amount}</div>
      {sub ? <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-tertiary)" }}>{sub}</div> : null}
    </div>
  );
}

function GroupCard({ group, active, onClick }) {
  const sign = group.net < 0 ? "negative" : group.net > 0 ? "positive" : "neutral";
  const fmt = (n) => (n < 0 ? "-" : n > 0 ? "+" : "") + "$" + Math.abs(n).toFixed(2);
  const balText = group.net === 0 ? "Settled up" : (group.net < 0 ? "You owe " : "Owed to you ") + fmt(group.net);
  return (
    <div
      className="bd-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        padding: "16px 18px",
        cursor: "pointer",
        outline: active ? "1px solid var(--accent-highlight)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: "var(--fg-primary)" }}>{group.name}</span>
        {group.family ? (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            padding: "2px 8px", borderRadius: 4,
            color: "var(--accent-highlight)",
            background: "rgba(167,139,250,0.12)",
            border: "1px solid rgba(167,139,250,0.30)",
          }}>family</span>
        ) : null}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-secondary)", marginBottom: 10 }}>
        {group.members.length} members · {group.expenses.length} expenses
      </div>
      <div className="bd-amount" data-sign={sign} style={{ fontSize: 14 }}>
        {balText}
      </div>
    </div>
  );
}

function TransactionList({ items, currentUser, onItemClick }) {
  if (!items.length) {
    return <EmptyState
      title="This group is quiet."
      body="Add an expense to get started. Who paid? How much? Who benefits?"
    />;
  }
  return (
    <div className="bd-card flat" style={{ padding: "16px 20px" }}>
      <div className="bd-txns" role="list" aria-label="Transactions">
        <div className="bd-txn-bracket">[</div>
        {items.map((tx, i) => {
          const youPaid = tx.paidBy === currentUser;
          const sign = youPaid ? "positive" : "negative";
          const share = tx.amount / tx.split.length;
          const youOwe = -share;
          const youGet = tx.amount - share;
          const display = youPaid ? youGet : youOwe;
          const fmt = (n) => (n >= 0 ? "+" : "-") + "$" + Math.abs(n).toFixed(2);
          return (
            <div className="bd-txn-row" key={tx.id} onClick={() => onItemClick?.(tx)} role="listitem" aria-label={tx.name + " " + fmt(display)}>
              <span className="bd-txn-bracket">{"{"}</span>
              <div className="bd-txn-content">
                <div>
                  <span className="bd-txn-name">"{tx.name}"</span>
                  <span className="bd-txn-meta"> · {youPaid ? "You" : tx.paidBy} paid · {tx.split.length}</span>
                </div>
                <span className="bd-txn-amount" data-sign={sign}>{fmt(display)}</span>
              </div>
              <span className="bd-txn-bracket">{i === items.length - 1 ? "}" : "},"}</span>
            </div>
          );
        })}
        <div className="bd-txn-bracket">]</div>
      </div>
    </div>
  );
}

function AddExpenseModal({ open, members, onClose, onSubmit }) {
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [paidBy, setPaidBy] = React.useState(members[0] || "");
  const [err, setErr] = React.useState({});

  React.useEffect(() => { if (open) { setName(""); setAmount(""); setPaidBy(members[0] || ""); setErr({}); } }, [open]);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    const amt = parseFloat(amount);
    if (!name.trim()) next.name = "Description is required";
    if (!amount || isNaN(amt) || amt <= 0) next.amount = "That amount doesn't work. Try a positive number.";
    setErr(next);
    if (Object.keys(next).length) return;
    onSubmit?.({ name: name.trim(), amount: amt, paidBy, split: members });
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add expense">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <TextField id="exp-name" label="Description" placeholder='e.g. "Dinner @ Nobu"' value={name} onChange={setName} error={err.name} autoFocus />
        <TextField id="exp-amount" label="Amount (USD)" placeholder="42.33" value={amount} onChange={setAmount} error={err.amount} />
        <div className="bd-field">
          <label className="bd-label" htmlFor="exp-paid">Paid by</label>
          <select id="exp-paid" className="bd-input" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {members.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-tertiary)", fontFamily: "var(--font-mono)" }}>
          // splits evenly across {members.length} members · {members.join(", ")}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose}>CANCEL</Button>
          <Button type="submit">ADD EXPENSE</Button>
        </div>
      </form>
    </Modal>
  );
}

function SettleUpPanel({ group, currentUser }) {
  // Compute net balance per member based on expenses, then minimum-transaction settlement.
  const balances = {};
  group.members.forEach((m) => (balances[m] = 0));
  group.expenses.forEach((tx) => {
    const share = tx.amount / tx.split.length;
    balances[tx.paidBy] += tx.amount;
    tx.split.forEach((m) => (balances[m] -= share));
  });

  // Greedy min-tx settlement
  const pos = [], neg = [];
  Object.entries(balances).forEach(([m, v]) => {
    if (v > 0.01) pos.push({ m, v });
    else if (v < -0.01) neg.push({ m, v: -v });
  });
  pos.sort((a, b) => b.v - a.v);
  neg.sort((a, b) => b.v - a.v);
  const txs = [];
  let i = 0, j = 0;
  while (i < neg.length && j < pos.length) {
    const pay = Math.min(neg[i].v, pos[j].v);
    txs.push({ from: neg[i].m, to: pos[j].m, amount: pay });
    neg[i].v -= pay;
    pos[j].v -= pay;
    if (neg[i].v < 0.01) i++;
    if (pos[j].v < 0.01) j++;
  }

  return (
    <div className="bd-card flat lavender" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Optimal settlement</h3>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-secondary)" }}>
          engine v0.8.1 · {txs.length} tx{txs.length !== 1 ? "s" : ""}
        </span>
      </div>
      {txs.length === 0 ? (
        <div style={{ color: "var(--money-positive)", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="check" size={16} />
          <span>Settled up ✓</span>
        </div>
      ) : (
        <div className="bd-txns" style={{ fontSize: 13 }}>
          {txs.map((t, k) => (
            <div key={k} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 0", borderBottom: k < txs.length - 1 ? "1px solid var(--border-divider)" : "none",
            }}>
              <span style={{ color: t.from === currentUser ? "var(--money-negative)" : "var(--fg-primary)", fontWeight: t.from === currentUser ? 600 : 400 }}>
                {t.from === currentUser ? "you" : t.from}
              </span>
              <Icon name="arrowRight" size={14} />
              <span style={{ color: t.to === currentUser ? "var(--money-positive)" : "var(--fg-primary)", fontWeight: t.to === currentUser ? 600 : 400 }}>
                {t.to === currentUser ? "you" : t.to}
              </span>
              <span style={{ flex: 1, borderBottom: "1px dotted var(--border-divider)", marginBottom: 2 }} />
              <span className="bd-amount" data-sign="neutral" style={{ color: "var(--fg-primary)" }}>${t.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 16, fontSize: 12, color: "var(--fg-tertiary)", lineHeight: 1.6 }}>
        We compute the fewest transactions needed to settle everyone's balances.
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, SummaryCard, GroupCard, TransactionList, AddExpenseModal, SettleUpPanel });
