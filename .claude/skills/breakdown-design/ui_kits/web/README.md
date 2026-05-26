# breakDown — Web UI kit

A faithful recreation of the breakDown web app. Built as a clickable prototype, not production code: state is local, "auth" is fake, the settlement engine is real but in-memory.

## What's here

| File | Purpose |
|---|---|
| `index.html` | Entry point. Loads React + Babel and renders `<App />`. |
| `tokens.css` | Imports `../../colors_and_type.css` and adds kit-specific classes (`.bd-btn`, `.bd-card`, `.bd-input`, `.bd-txns`, sidebar layout). |
| `Primitives.jsx` | Button, TextField, ErrorBanner, Tabs, Modal, EmptyState, Icon (Lucide-style SVGs, inlined). |
| `Auth.jsx` | `AuthShell` (gradient page + glass hero card), `LoginForm`, `RegisterForm`, `SuccessScreen`. |
| `Dashboard.jsx` | `Sidebar`, `SummaryCard`, `GroupCard`, `TransactionList` (JSON-styled rows), `AddExpenseModal`, `SettleUpPanel` (real greedy min-tx settlement). |
| `App.jsx` | Top-level state machine: `login → register → success → app`. Owns seed groups, computes user balances and totals. |

## Flow it demonstrates

1. **Log in** — any username/password works. Tab-toggle to **Sign up** if you want to see the register variant.
2. **Success screen** — auto-advances after ~2.2 s.
3. **Dashboard** — three summary cards (you owe / owed to you / net), a list of groups, and a detail pane with three tabs:
   - **Expenses** — JSON-styled transaction list.
   - **Settle up** — the optimal-settlement panel showing the algorithm's result and the engine version.
   - **Members** — each member's net balance in the group.
4. **Add expense modal** — type, amount, who-paid, splits evenly. Submits to local state and triggers a success toast.
5. **Recurring / Analytics** — empty states that demonstrate the voice.
6. **Settings** — privacy copy + the engineering-precision debug footer.

## What's intentionally faked

- Auth has no backend. It always succeeds.
- The seed data lives in `App.jsx`. No persistence.
- The icons are inlined SVGs (Lucide-style: 1.75px stroke, currentColor). In production we'd CDN-load `lucide`.

## What this kit is for

Copy components out of here into mockups. The composition pattern (`AuthShell` + `LoginForm`, `Sidebar` + `<main>`, summary-card grid above a 320/1fr split) is the breakDown layout — match it on new surfaces.
