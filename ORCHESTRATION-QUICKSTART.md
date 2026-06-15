# Orchestration Monitoring UI — Quick Start

Get the workflow monitoring dashboard running in 5 minutes.

## Prerequisites

- Node.js 18+
- Next.js 15+ installed
- breakDown-ui project set up locally

## Step 1: Files Already Created

All files have been generated and placed in your project:

```
✅ Types:       types/workflow-orchestration.ts
✅ Context:     lib/context/WorkflowContext.tsx
✅ Page:        app/(dashboard)/orchestration/page.tsx
✅ Components:  components/orchestration/*.tsx (12 files)
✅ Styles:      components/orchestration/*.module.css (12 files)
✅ API Route:   app/api/orchestrator/[id]/status/route.ts
✅ Docs:        ORCHESTRATION-MONITORING.md
```

## Step 2: Start the Dev Server

```bash
cd breakdown-ui
npm run dev
```

## Step 3: Access the Dashboard

Open in browser:
```
http://localhost:3000/dashboard/orchestration
```

Or with explicit orchestration ID:
```
http://localhost:3000/dashboard/orchestration?orchestrationId=igv-20250612-a7f3k
```

## What You'll See

1. **Dashboard Header** — Overall progress (35%), elapsed time, estimated duration
2. **Real-Time Metrics** — 5 cards showing running/completed agents, tasks, failure rate
3. **Phase Container** (Code Generation) — 2 agents, all tasks completed
   - Agent 1: Backend Code Generator (100%, 4 tasks done)
   - Agent 2: Frontend Code Generator (100%, 3 tasks done)
4. **Phase Container** (Build Pipeline) — 2 agents, currently running
   - Agent 3: Backend Build Agent (75% progress, running tests)
   - Agent 4: Frontend Build Agent (55% progress, building)
5. **Phase Containers** (Deployment, Testing, Finalization) — Pending, collapsed
6. **Live Status Feed** — Orchestrator messages (right sidebar)
7. **Connection Status** — Banner (hidden if connected)

## Interacting with the UI

### Expand/Collapse Phases
- Click phase header to toggle agents visibility
- Phases show progress bar and agent count

### Expand/Collapse Agent Details
- Click "Tasks" or "Logs" section header in agent card
- Only one section can be expanded at a time

### View Agent Logs
- Click agent card's "Logs" section
- Logs auto-scroll to latest entry
- Color-coded by level: info (blue), warn (orange), error (red), debug (gray)

### Monitor Metrics
- Check real-time cards at top for running/completed agents
- Failure rate turns orange if >10%

## With Real Backend

To connect to your actual orchestration backend:

### 1. Update API Route

Edit `app/api/orchestrator/[id]/status/route.ts`:

```typescript
// Replace mock data generator with:
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orchestrationId = params.id;
  const response = await apiClient.get(`/orchestrator/${orchestrationId}/status`);
  return NextResponse.json(response.data);
}
```

### 2. Create WebSocket Endpoint

Create `app/api/orchestrator/ws/route.ts`:

```typescript
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const orchestrationId = request.nextUrl.searchParams.get('orchestrationId');
  
  // Return 101 Switching Protocols for WebSocket upgrade
  // Forward connection to Java backend WebSocket
  // Handle message forwarding in both directions
  
  // Implementation depends on your WebSocket library
  // (e.g., ws, socket.io, native Node.js WebSocket)
}
```

### 3. Update WorkflowDashboard.tsx

Change WebSocket URL construction (line ~75):

```typescript
// From:
const wsUrl = `${protocol}://${typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/api/orchestrator/ws?orchestrationId=${orchestrationId}`;

// To:
const wsUrl = `${protocol}://${process.env.NEXT_PUBLIC_API_URL || 'localhost:8080'}/orchestrator/ws?orchestrationId=${orchestrationId}`;
```

## Environment Variables

No required env vars for demo mode. For production:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## Customizing the Demo

Edit `app/api/orchestrator/[id]/status/route.ts` function `generateMockWorkflowStatus()`:

```typescript
// Change estimated duration (in milliseconds)
estimatedDuration: 900000, // 15 minutes

// Change phase progress
progress: 100, // 0-100

// Add more agents
agents: [
  { agentId: 'agent-1', ... },
  { agentId: 'agent-2', ... },
]

// Add more tasks per agent
tasks: [
  { taskId: 'task-1', taskName: 'Generate models', ... },
  { taskId: 'task-2', taskName: 'Generate services', ... },
]

// Adjust logs
logs: [
  { level: 'info', message: 'Starting build...' },
  { level: 'warn', message: 'Memory usage high' },
]
```

## Styling Customization

All colors and fonts use breakDown design system. To customize:

### Change Color Scheme

Edit `colors_and_type.css` (in design skill):
```css
--accent: #c586c0;           /* Keyword purple */
--accent-highlight: #dcdcaa; /* Function yellow */
--signal-success: #a6e3a1;   /* Green */
--signal-error: #f48771;     /* Red */
```

### Change Fonts

Edit `colors_and_type.css`:
```css
--font-sans: 'Space Grotesk', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Change Component Spacing

Edit any `.module.css` file:
```css
padding: var(--space-lg);   /* 16px */
gap: var(--space-md);       /* 12px */
margin: var(--space-xl);    /* 20px */
```

## Troubleshooting

### "Cannot find module" errors

Run:
```bash
npm install
npm run build
```

### Dashboard looks broken (wrong colors/fonts)

1. Check that fonts are loading:
   ```
   DevTools → Application → Fonts → Look for Space Grotesk, JetBrains Mono
   ```

2. Check design system CSS is loaded:
   ```
   DevTools → Elements → <html> → Check for data-theme attribute
   ```

3. Verify CSS modules are imported:
   ```
   DevTools → Elements → <head> → Look for orchestration-*.css
   ```

### WebSocket connection fails

1. Check browser console for WebSocket error messages
2. Verify backend is running on expected port
3. Check CORS headers if backend is on different origin
4. App will automatically fall back to polling every 2 seconds

### Mock data not updating

Mock data is static. To simulate updates:

1. Edit `generateMockWorkflowStatus()` to return different values based on timestamp
2. Or implement real WebSocket endpoint on backend
3. Or modify `WorkflowDashboard.tsx` to simulate updates with `setInterval`

## Next Steps

1. ✅ UI is ready to monitor workflows
2. ⏭️ Connect to your orchestration backend
3. ⏭️ Add pause/resume workflow controls
4. ⏭️ Add export logs feature
5. ⏭️ Add Slack notifications for failures

## File Structure Reference

```
breakdown-ui/
├── app/
│   ├── (dashboard)/orchestration/
│   │   ├── page.tsx
│   │   └── orchestration.module.css
│   └── api/orchestrator/[id]/status/route.ts
│
├── components/orchestration/
│   ├── WorkflowDashboard.tsx
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
│   └── WorkflowContext.tsx
│
├── types/
│   └── workflow-orchestration.ts
│
├── ORCHESTRATION-MONITORING.md      (Full documentation)
└── ORCHESTRATION-QUICKSTART.md      (This file)
```

## Support

For issues or questions:
1. Check `ORCHESTRATION-MONITORING.md` for detailed docs
2. Review component JSDoc comments
3. Check browser console for error messages
4. Verify API endpoint is returning correct data shape

Happy monitoring! 🎉
