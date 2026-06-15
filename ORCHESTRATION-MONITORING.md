# Workflow Orchestration Monitoring UI

A real-time monitoring dashboard for the 15-agent feature development workflow orchestration system.

## Overview

The monitoring UI provides live visibility into:
- **5 workflow phases** — Code Generation → Build → Deployment → Testing → Finalization
- **15 sub-agents** — Parallel code generators, builders, testers, deployers
- **Real-time metrics** — Tasks completed, agents running, failure rates
- **Live logs** — Per-agent activity stream with error visibility
- **Status updates** — Orchestrator message feed

## Architecture

### Component Structure

```
WorkflowDashboard (client)
├── DashboardHeader (overall progress, timing)
├── RealTimeMetrics (task/agent counters)
├── PhaseContainer (per phase)
│   └── AgentCard (per agent)
│       ├── TaskList (per agent)
│       ├── LogViewer (per agent)
│       └── ErrorPanel (if failed)
├── GlobalStatusReport (message stream)
└── ConnectionStatus (WebSocket/polling status)
```

### Data Flow

1. **Server Component** (`page.tsx`) — Initializes WorkflowProvider
2. **Client Component** (`WorkflowDashboard.tsx`) — Fetches initial state via `/api/orchestrator/{id}/status`
3. **WebSocket** — Real-time updates via `/api/orchestrator/ws`
4. **Polling Fallback** — Automatic fallback if WebSocket unavailable
5. **React Context** — Distributes updates to child components

### State Management

Uses React Context (`WorkflowContext`) with `useState` hooks:
- No external state library (per CLAUDE.md)
- Fine-grained updates via context actions
- Subscription-based log storage (last 50 logs per agent)
- Message feed (last 100 messages)

## Usage

### Access the Dashboard

```
http://localhost:3000/dashboard/orchestration?orchestrationId=igv-20250612-a7f3k
```

### Features

#### Overall Progress
- Circular progress indicator (0-100%)
- Elapsed time counter
- Estimated total duration
- Workflow status badge

#### Phase Monitoring
- 5 collapsible phase cards
- Phase status (pending/running/completed/failed)
- Per-phase progress bar
- Agent count per phase
- Click to expand/collapse agents

#### Agent Monitoring
- Agent name, role, and status
- Progress bar with percentage
- Elapsed time and estimated remaining
- Expandable tasks section
- Expandable logs section
- Error panel (if failed)

#### Tasks
- Task name and description
- Status indicator (dot color)
- Completion percentage
- Duration
- Error icon (if failed)

#### Logs
- Auto-scrolling to latest entry
- Color-coded by level (info/warn/error/debug)
- Timestamp and message
- Max 50 logs per agent
- Scrollable container with custom scrollbar

#### Status Updates
- Live message feed from orchestrator
- Color-coded by severity (low/medium/high/critical)
- Reverse chronological order
- Last 100 messages retained

#### Connection Status
- Banner showing connection state
- Pulsing indicator during reconnection
- Automatic reconnection after 3 seconds

## API Contract

### GET /api/orchestrator/{id}/status

Fetches initial workflow state.

**Response:**
```typescript
{
  orchestrationId: string;
  startedAt: ISO8601;
  estimatedDuration: number; // ms
  overallProgress: number; // 0-100
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  phases: PhaseStatus[];
  metrics: WorkflowMetrics;
  lastUpdated: ISO8601;
}
```

### WebSocket wss://api.example.com/api/orchestrator/ws

Real-time updates with message types:
- `workflow_status` — Overall progress update
- `agent_update` — Single agent status change
- `task_update` — Single task status change
- `log_entry` — New log from agent
- `message` — Orchestrator status message

**Message Format:**
```typescript
{
  type: 'workflow_status' | 'agent_update' | ...;
  data: { ... };
  timestamp: ISO8601;
}
```

### Polling Fallback

If WebSocket unavailable, automatic polling every 2 seconds:
```
GET /api/orchestrator/{id}/status
```

## Styling

### Design System Integration

All styles use breakDown design system CSS variables:

| Token | Usage |
|-------|-------|
| `--bg-page` | Page background |
| `--surface-panel` | Headers, sidebars |
| `--surface-card` | Cards, containers |
| `--accent` | Primary (keyword purple) |
| `--accent-highlight` | Active/highlight (function yellow) |
| `--signal-success` | Completed (green) |
| `--signal-error` | Failed (red) |
| `--font-sans` | UI text (Space Grotesk) |
| `--font-mono` | Data, logs (JetBrains Mono) |

### CSS Modules

Each component has its own module:
- `WorkflowDashboard.module.css` — Main layout
- `DashboardHeader.module.css` — Header styling
- `PhaseContainer.module.css` — Phase cards
- `AgentCard.module.css` — Agent cards
- `TaskList.module.css` — Task rows
- `LogViewer.module.css` — Log container
- `RealTimeMetrics.module.css` — Metric cards
- `StatusIndicator.module.css` — Status dots
- etc.

### Responsive Design

- **1024px+** — 2-column layout (phases + status feed)
- **768px+** — 1-column stacked layout
- **Mobile** — Full-width, single column

## Extending the Dashboard

### Adding New Metrics

1. Update `WorkflowMetrics` type in `types/workflow-orchestration.ts`
2. Update mock data generator in `app/api/orchestrator/[id]/status/route.ts`
3. Add metric card to `RealTimeMetrics.tsx`
4. Style in `RealTimeMetrics.module.css`

### Adding Custom Agent Status

1. Update `AgentStatusType` union in types
2. Add CSS class in `AgentCard.module.css` (e.g., `.custom`)
3. Update StatusIndicator color mapping
4. Update mock data

### Adding New Message Types

1. Update `MessageType` union in types
2. Update GlobalStatusReport styling (add color variant)
3. Update API route message handling

### Hooking Into Real Orchestrator

1. Replace mock data in `route.ts` with actual API call:
   ```typescript
   const response = await apiClient.get(`/orchestrator/${orchestrationId}/status`);
   return NextResponse.json(response.data);
   ```

2. Implement WebSocket endpoint at `/api/orchestrator/ws`

3. Update backend to send `WebSocketMessage` objects

## Performance Considerations

### Optimizations

- **Virtual scrolling** — Long log lists use auto-scroll, not virtual scroll (50 log limit)
- **Memoization** — Components use `useCallback` for event handlers
- **Grid layout** — CSS Grid for efficient agent cards rendering
- **Debounced updates** — Batch WebSocket updates per 100-500ms (optional)

### Limits

- Max 50 logs per agent
- Max 100 orchestrator messages
- Max 15 agents per workflow
- Max 5 phases

## Testing

### Mock Data

The dashboard includes a built-in mock data generator. To use:

1. Access `/dashboard/orchestration` with any orchestrationId
2. Mock API returns realistic workflow data
3. No real backend required for UI testing

### Testing with Real Data

1. Set up WebSocket endpoint on backend
2. Configure environment variable:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```
3. Update `WorkflowDashboard.tsx` WebSocket URL construction

## Troubleshooting

### Dashboard Not Updating

1. Check browser console for WebSocket errors
2. Verify backend is serving `/api/orchestrator/ws`
3. Check network tab for polling requests (if WebSocket unavailable)
4. Verify `orchestrationId` parameter matches workflow

### Logs Not Appearing

1. Check that backend is sending `log_entry` messages
2. Verify logs are being added to agent state
3. Check browser DevTools → Application → Local Storage for debug flag

### UI Looks Wrong

1. Verify `colors_and_type.css` is loaded (check `<head>`)
2. Verify `data-theme` attribute on `<html>` element
3. Clear browser cache and reload
4. Check for CSS module import errors in console

## Files

```
breakdown-ui/
├── app/(dashboard)/orchestration/
│   ├── page.tsx                    ← Entry point (server)
│   └── orchestration.module.css
│
├── components/orchestration/
│   ├── WorkflowDashboard.tsx       ← Main client component
│   ├── DashboardHeader.tsx
│   ├── RealTimeMetrics.tsx
│   ├── PhaseContainer.tsx
│   ├── AgentCard.tsx
│   ├── TaskList.tsx
│   ├── LogViewer.tsx
│   ├── ErrorPanel.tsx
│   ├── GlobalStatusReport.tsx
│   ├── StatusIndicator.tsx
│   ├── ConnectionStatus.tsx
│   └── *.module.css (12 files)
│
├── lib/context/
│   └── WorkflowContext.tsx         ← State management
│
├── types/
│   └── workflow-orchestration.ts   ← Type definitions
│
└── app/api/orchestrator/
    └── [id]/status/route.ts        ← Status API endpoint
```

## Future Enhancements

- [ ] Export logs to CSV
- [ ] Pause/resume workflow controls
- [ ] Retry failed agents
- [ ] Custom filter/search
- [ ] Phase timeline view
- [ ] Agent dependency graph
- [ ] Performance metrics chart
- [ ] Deployment rollback UI
- [ ] Slack/email notifications
- [ ] WebSocket compression

## License

Part of the breakDown project. See root LICENSE.
