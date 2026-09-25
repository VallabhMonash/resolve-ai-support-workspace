# Resolve — implementation handoff

**Status: scope and design frozen; application implementation has not started.**
Prepared 10 September 2026 for a personal, non-commercial portfolio project.

Resolve is a support workspace for a fictional SaaS product called **ParcelDesk** (a small order-management application). Support staff manage tickets and documentation, then use an LLM to summarise/classify tickets, retrieve relevant documentation through a custom RAG pipeline, draft cited replies, and call one controlled ticket-search tool.

## Fixed stack

React + TypeScript + Vite + Apollo Client → Node.js + TypeScript + GraphQL Yoga → PostgreSQL + pgvector through Drizzle ORM.
Local inference: Ollama. Hosted inference: Cloudflare Workers AI.
Hosting: Vercel Hobby + Neon Free. Later CI/CD milestone: Jenkins on the owner's Mac.

**Zero required spending.** No paid plan, trial-dependent service, custom domain, paid model API, paid monitoring, or always-on rented Jenkins server. Hosted quotas can interrupt availability. A coding assistant's existing subscription is outside the application resource budget; the application must not depend on one.

## Read in this order

1. [Frozen scope](docs/00-SCOPE.md)
2. [Architecture and security](docs/01-ARCHITECTURE.md)
3. [Screens and interaction design](docs/02-UX.md)
4. [Database design](docs/03-DATA.md)
5. [GraphQL contract](contracts/schema.graphql) and [API semantics](docs/04-API.md)
6. [AI implementation specification](docs/04-AI.md)
7. [Evaluation and resume evidence](docs/05-EVALUATION.md)
8. [Free deployment and Jenkins](docs/06-DELIVERY.md)
9. [Milestones and completion checks](docs/07-IMPLEMENTATION.md)
10. [Coding handoff and learning guide](docs/08-HANDOFF.md)
11. [Decisions, source checks, and assumptions](docs/09-DECISIONS.md)

[STATUS.md](STATUS.md) records progress. [AGENTS.md](AGENTS.md) gives the implementing agent its operating rules.

## Definition of completion

All M0–M8 acceptance checks pass or have a specifically documented external blocker; blocked checks never count as passed. The owner can demonstrate the same core workflows locally and online with live AI, explain the RAG and tool code, reproduce evaluation results, and show a Jenkins test-gated deployment. No fabricated metrics or paid dependency is introduced.

## Next implementation prompt

> Read AGENTS.md, README.md, STATUS.md, and docs/08-HANDOFF.md. Implement Resolve according to the frozen scope and contracts. Start with M0 and then work through the milestones in order. Preserve the zero-spend requirement. Verify provider capabilities before relying on them; do not silently remove live AI or tool calling. Keep STATUS.md current, record test evidence, and include the learning exercise at each AI milestone. Do not redesign the product or add features. Application implementation is now authorised; ask only for genuinely missing credentials or an unavoidable scope/cost decision.

The prompt above is for a future coding turn; this handoff itself contains specifications, not a completed app.

