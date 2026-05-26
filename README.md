# breakDown-ui

Next.js 14+ web + PWA frontend for breakDown (privacy-first expense-splitting app).

## Getting Started

Read [`CLAUDE.md`](CLAUDE.md) for coding conventions and a quick-start reference of which docs to load for different tasks.

## Documentation Structure

- **[CLAUDE.md](CLAUDE.md)** — Coding conventions, server/client component patterns, testing strategy, quick-start reference
- **[architecture.md](architecture.md)** — System overview, server component flow, API route design
- **[unit-tests.md](unit-tests.md)** — Testing philosophy and patterns for Next.js
- **[deployment.md](deployment.md)** — Vercel, AWS, and GCP deployment

### Architecture Deep-Dives
- **[docs/architecture-deep-dives/server-components.md](docs/architecture-deep-dives/server-components.md)** — When and how to use server components
- **[docs/architecture-deep-dives/server-actions.md](docs/architecture-deep-dives/server-actions.md)** — Form submissions and mutations with server actions
- **[docs/architecture-deep-dives/api-routes.md](docs/architecture-deep-dives/api-routes.md)** — Middleware pattern for Java backend communication
- **[docs/architecture-deep-dives/state-management.md](docs/architecture-deep-dives/state-management.md)** — Client-side state with React hooks
- **[docs/architecture-deep-dives/data-fetching.md](docs/architecture-deep-dives/data-fetching.md)** — Server-side vs. client-side fetching patterns
- **[docs/architecture-deep-dives/authentication.md](docs/architecture-deep-dives/authentication.md)** — Auth flow with HTTP-only cookies

### Implementation Guides
- **[docs/implementation-guides/adding-a-page.md](docs/implementation-guides/adding-a-page.md)** — Create a new Next.js page
- **[docs/implementation-guides/adding-a-server-action.md](docs/implementation-guides/adding-a-server-action.md)** — Implement form submission with server action
- **[docs/implementation-guides/adding-an-api-route.md](docs/implementation-guides/adding-an-api-route.md)** — Create API route to Java backend
- **[docs/implementation-guides/adding-a-client-component.md](docs/implementation-guides/adding-a-client-component.md)** — Build interactive client component
- **[docs/implementation-guides/adding-form-validation.md](docs/implementation-guides/adding-form-validation.md)** — Client and server-side form validation
- **[docs/implementation-guides/fetching-data-server-side.md](docs/implementation-guides/fetching-data-server-side.md)** — Fetch data in server components

### Deployment
- **[docs/deployment-aws.md](docs/deployment-aws.md)** — AWS S3 + CloudFront deployment
- **[docs/deployment-gcp.md](docs/deployment-gcp.md)** — GCP Cloud Run deployment

### Reference
- **[docs/reference/api-contract.md](docs/reference/api-contract.md)** — ResponseStructure and domain types
- **[docs/reference/types-reference.md](docs/reference/types-reference.md)** — Complete TypeScript interface catalog
- **[docs/reference/design-tokens.md](docs/reference/design-tokens.md)** — Colors, spacing, typography
- **[docs/reference/component-inventory.md](docs/reference/component-inventory.md)** — Common components with props
- **[docs/reference/endpoint-index.md](docs/reference/endpoint-index.md)** — Backend endpoint catalog
- **[docs/reference/next-js-patterns.md](docs/reference/next-js-patterns.md)** — Common Next.js patterns and recipes

## Quick Links by Task

**New to the project?** Start with CLAUDE.md + docs/architecture-deep-dives/server-components.md + docs/architecture-deep-dives/server-actions.md (~1,500 words, <1 hour)

**Building a new page?** Use docs/implementation-guides/adding-a-page.md + docs/reference/component-inventory.md

**Adding an API integration?** Use docs/implementation-guides/adding-an-api-route.md + docs/reference/endpoint-index.md + docs/reference/api-contract.md

**Creating a form with submission?** Use docs/implementation-guides/adding-a-server-action.md + docs/implementation-guides/adding-form-validation.md

**Building interactive UI?** Use docs/implementation-guides/adding-a-client-component.md + docs/reference/component-inventory.md
