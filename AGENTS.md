# Implementation instructions

This project is Resolve. Follow README.md and docs/00-SCOPE.md. These documents implement the user's agreed scope, not a suggestion to expand it.

- Keep required resource spending at zero. Never activate a paid plan, trial-dependent service, paid API or paid overage. Do not treat a quota failure as permission to upgrade.
- Build the agreed React/TypeScript, Node.js/GraphQL, PostgreSQL, RAG, structured-output, tool-calling and Jenkins work. Do not substitute a static/mock-only product.
- Use docs/07-IMPLEMENTATION.md in order; record evidence in STATUS.md. M0 validates deployment/model assumptions early.
- Default to routine implementation decisions without repeatedly seeking approval. New features or unavoidable changes to the frozen constraints need an explicit decision.
- Keep domain services independent of Vercel and AI providers. Provider API differences belong in adapters.
- All database and tool access is scoped to the authenticated workspace. Never trust a model-supplied workspace, user, URL, SQL statement or role.
- Real-model evaluations are separate from deterministic CI. Mock results are never evidence of model quality.
- Never invent benchmark outcomes, users, business impact, code coverage, latency or accuracy. Preserve failed runs and test conditions.
- Reuse ordinary npm scripts in local development and Jenkins. Do not create duplicate production deployment paths.
- Protect credentials; do not print environment files, tokens, passwords, session cookies or database URLs. Only safe public values may have a VITE_ prefix.
- Use the skill appropriate to actual implementation work where required by the active session. This planning package neither selects Sites hosting nor creates .openai/hosting.json; the user selected Vercel.
- No autonomous subagents unless the user or applicable higher-level instructions explicitly authorise delegation.
- No app code was written during planning. Do not mistake the GraphQL design contract or proposed targets for implemented behaviour.
- Preserve a short learning journal using docs/08-HANDOFF.md; supply a small owner exercise without blocking unrelated implementation.

