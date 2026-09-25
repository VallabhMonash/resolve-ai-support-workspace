# Frozen scope — Resolve v1

## Purpose and learning goal

Build a credible junior full-stack AI portfolio project whose owner can explain and reproduce it. Primary evidence: React/TypeScript, Node.js, GraphQL, LLM integration, embeddings, custom RAG, structured outputs, controlled function calling, evaluations. Secondary evidence: PostgreSQL/ORM/transactions/indexes, session authentication/RBAC, automated browser testing and Jenkins.

This is LLM application engineering using existing models. It is not foundation-model training, fine-tuning or an autonomous multi-agent system.

## Product setting

ParcelDesk is a fictional order-management SaaS. Its documentation covers CSV imports, exports, account access, user permissions and order synchronisation. All tickets, customers and documentation are synthetic. No real customer data is needed.

Example demonstration: open a CSV encoding failure → summarise/classify → retrieve the import guide → draft a cited reply → inspect sources → edit and save the reply → assign/resolve the ticket. A separate button demonstrates an actual model-requested findSimilarTickets tool call.

## Required features

| ID | Feature | Boundary |
|---|---|---|
| F01 | Login/logout and scoped sessions | Seeded manager/agent accounts, plus isolated visitor demo sessions |
| F02 | Ticket inbox | Search, status/category/priority/assignee filters, cursor pagination, stable ordering |
| F03 | Ticket workflow | Create, view, assign, edit status/priority/category, comments and saved replies |
| F04 | Ticket history | Show who changed state and when; detect stale edits |
| F05 | Knowledge base | Manager creates/edits English Markdown or plain text, versions, archives, indexes |
| F06 | LLM summary/classification | One action returns summary, category, priority and rationale; human applies suggestions |
| F07 | RAG reply generation | Retrieve passages, draft with source references, show evidence and missing-evidence state |
| F08 | Controlled tool calling | One read-only findSimilarTickets tool; validated arguments; visible results |
| F09 | Insights | Real workspace counts plus AI run/error/latency/feedback summaries; separate benchmark report |
| F10 | Tests/evaluations | Deterministic software tests, browser tests, held-out AI evaluation, local load testing |
| F11 | Free hosted demonstration | Vercel + Neon + Cloudflare, with quotas and live AI |
| F12 | Jenkins | Local, repository-defined pipeline with test gates and Vercel deployment |
| F13 | Portfolio evidence | Reproducible reports, screenshots/demo instructions, measured resume bullet templates |

## Roles and public demo

Manager: all ticket actions plus knowledge-base writing/indexing and access to own workspace's insights.
Agent: ticket actions, AI actions, read knowledge base and own workspace insights; cannot edit/index documentation.
Visitor: receives a temporary isolated workspace and agent permissions through Enter demo. The demo has synthetic agent identities for assignment; they are not logins. A read-only shared, published knowledge corpus is accessible to demo workspaces.

Public demo contains 20 seed tickets and up to 30 shared articles. Owner workspace also contains seeded tickets and editable copies of the corpus. Visitors can add at most 10 tickets and 50 comments per session. Demo lasts 24 hours, then data is eligible for deletion. Cap active demo workspaces at 50. Manager credentials are never published.

One-click demo need not expose manager-only editing to anonymous visitors. Demonstrate manager functionality in the local demo/video and through the owner's login.

## Scope limits

- One support product, English text, three ticket statuses: OPEN, IN_PROGRESS, RESOLVED.
- Four categories: IMPORT_EXPORT, ACCESS, SYNC, OTHER. Three priorities: LOW, NORMAL, HIGH.
- No email sending/receiving: a saved reply is an in-app conversation entry.
- No file attachments, PDF parsing, OCR, website crawling, external customer integrations or URL ingestion.
- No billing, subscriptions, organisation invitations, password reset/email verification, OAuth/OIDC/JWT or enterprise SSO in v1. Use secure opaque cookie sessions; do not claim OAuth experience from this project.
- No Java/Spring/JPA, Azure services, Terraform, Kubernetes, C++, native mobile app or desktop app.
- No Redis, queue service, vector SaaS, LangChain, agent framework, paid observability, continuous training or multi-agent orchestration.
- No WebSockets/GraphQL subscriptions, streaming-token UI or permanent background workers. Use ordinary request/response operations and resumable indexing.
- No full Selenium stack. Use Playwright for automated browser coverage; do not claim Selenium.
- No production SLA, guaranteed cold-start elimination, unlimited free cloud AI or claim of real customer adoption.
- No duplicated GitHub Actions deployment pipeline. Jenkins is the final CI/CD implementation.

These omissions keep effort on the user's chosen gaps. Adding any omitted feature is a future version decision.

## Size and resource budgets

Seed corpus: 30 articles, each <= 12,000 characters. Article write limit: 50 KiB UTF-8 per request. Ticket title <= 160 characters, description <= 6,000, comment <= 4,000. Default page size 20, maximum 50.
Hosted demo database operating target: < 200 MB, leaving headroom under Neon's current 0.5 GB free storage. This is a capacity target, not measured usage.
Large benchmark fixtures stay local and are never seeded into the public database.

## Completion rule

M0–M8 are required. Any failed gate stays visible. Provider model selection may change only to another free model satisfying the same feature contract, with a recorded compatibility result. Resource limits may be tightened as routine configuration; feature removal, paid services or architectural expansion requires an explicit scope decision.

