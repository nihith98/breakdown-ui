# breakDown-ui

React Native 0.79 + Expo SDK 55 frontend codebase for Breakdown (expense-splitting app).

## Getting Started

Read [`CLAUDE.md`](CLAUDE.md) for coding conventions and a quick-start reference of which docs to load for different tasks.

## Documentation Structure

- **[CLAUDE.md](CLAUDE.md)** — Coding conventions, dependency injection patterns, testing strategy, quick-start reference
- **[architecture.md](architecture.md)** — System overview, layer diagram, state ownership
- **[unit-tests.md](unit-tests.md)** — Testing philosophy and patterns
- **[deployment.md](deployment.md)** — Build pipeline (EAS, expo export, GitHub Actions)

### Architecture Deep-Dives
- **[docs/architecture-deep-dives/component-structure.md](docs/architecture-deep-dives/component-structure.md)** — Component hierarchy, Expo Router layouts, screen tree
- **[docs/architecture-deep-dives/state-management.md](docs/architecture-deep-dives/state-management.md)** — Zustand + TanStack Query interaction, cache invalidation
- **[docs/architecture-deep-dives/api-integration.md](docs/architecture-deep-dives/api-integration.md)** — HTTP layer, token refresh, error handling

### Implementation Guides
- **[docs/implementation-guides/adding-a-query.md](docs/implementation-guides/adding-a-query.md)** — TanStack Query hook template with examples
- **[docs/implementation-guides/adding-a-store.md](docs/implementation-guides/adding-a-store.md)** — Zustand store template
- **[docs/implementation-guides/adding-a-screen.md](docs/implementation-guides/adding-a-screen.md)** — Full screen scaffolding with example
- **[docs/implementation-guides/adding-a-component.md](docs/implementation-guides/adding-a-component.md)** — Design system component template

### Deployment
- **[docs/deployment-aws.md](docs/deployment-aws.md)** — AWS S3 + CloudFront deployment
- **[docs/deployment-gcp.md](docs/deployment-gcp.md)** — GCP Cloud Storage + CDN deployment

### Reference
- **[docs/reference/api-contract.md](docs/reference/api-contract.md)** — ResponseStructure and domain types
- **[docs/reference/types-reference.md](docs/reference/types-reference.md)** — Complete TypeScript interface catalog
- **[docs/reference/design-tokens.md](docs/reference/design-tokens.md)** — Colors, spacing, typography, durations
- **[docs/reference/component-inventory.md](docs/reference/component-inventory.md)** — All ~18 components with props and variants
- **[docs/reference/endpoint-index.md](docs/reference/endpoint-index.md)** — Backend endpoint catalog

## Quick Links by Task

**New to the project?** Start with CLAUDE.md + docs/architecture-deep-dives/component-structure.md + docs/architecture-deep-dives/state-management.md (~1,500 words, <1 hour)

**Building a new screen?** Use docs/implementation-guides/adding-a-screen.md + docs/reference/component-inventory.md + docs/reference/design-tokens.md

**Adding an API integration?** Use docs/implementation-guides/adding-a-query.md + docs/reference/endpoint-index.md + docs/reference/api-contract.md + docs/reference/types-reference.md

**Creating a component?** Use docs/implementation-guides/adding-a-component.md + docs/reference/component-inventory.md + docs/reference/design-tokens.md
