# Implementation milestones

Work sequentially. Each milestone ends with runnable evidence, a STATUS.md update and a short explanation. The implementing agent should continue authorised work without asking for approval for every routine step.

## M0 — verify the constraints first

Deliver docs/COMPATIBILITY.md with exact dependency/runtime versions, account plan checks, model tests and timings.
- Inspect repository and preserve existing changes. Pin supported Node LTS (24 baseline), npm and package versions.
- Verify Vercel can run the chosen GraphQL handler, Drizzle/pg, tokenizers and CLI deployment method inside Hobby limits. Test same-origin SPA routing with /api excluded.
- Verify free Neon pgvector extension and pooled connection from Node when credentials are available.
- Run local selected model: summary JSON, one native tool call, query/document embeddings (assert 768 dimensions and model preprocessing). Check Mac RAM and response times with development tools open.
- Run the same capability tests on Cloudflare Free when credentials exist. Confirm no paid model/account dependency and hosted token limits.
- Verify tokenizer assets can be packaged; record exact generation/embedding profile.
Pass: local capabilities demonstrated; externally dependent checks either passed with evidence or clearly pending. Do not claim hosted readiness until they pass. Missing credentials do not prevent M1–M5 local work.
No public production app, extra feature, or paid service needed.

## M1 — foundation, schema and sessions

Create Vite React client, Node GraphQL Yoga local/Vercel entrypoints, strict TS, npm scripts, codegen, Docker Compose pgvector DB, Drizzle schema/migrations and .env.example.
Implement session login/logout, manager/agent roles, scoped repository context, origin/CSRF checks, demo creation/caps/cleanup and seed CLI.
Pass: clean checkout installation/build; migrations and seed repeat without duplicates; authentication and two-workspace negative tests; production config rejects mock AI and benchmark mode.
Learning: explain browser → GraphQL → service → SQL and why session scope is server-derived.

## M2 — ticket workspace

Build landing/login, inbox, filters/cursors, create ticket, detail, comments/replies, assignments/status/category/priority and activity. Implement version conflicts and request-scoped DataLoaders.
Pass: required ticket workflows work on desktop/mobile; Playwright covers success/empty/error/conflict states; no cross-workspace nested-query leaks.
Learning: owner adds one filter using the documented pattern and explains its GraphQL input/SQL query.

## M3 — knowledge base and retrieval

Build article reader/editor/version/archive UI; implement bounded resumable indexing, exact vector retrieval and full-text baseline. Create 30 synthetic articles and 40 development cases; no held-out tuning.
Pass: changed/archived versions excluded, partial indexes never queried, batch retry is idempotent, two profiles never mix, source provenance intact.
Learning: owner chunks/indexes a new short article and explains why re-embedding is required after a profile change.

## M4 — complete AI workflow

Implement adapters, summary/classification, RAG draft + citations, single tool workflow, quota/lease/idempotency, stale-draft handling, feedback and insights.
Pass: actual local LLM completes all three user AI actions; schema/citation/tool restrictions pass deterministic tests; provider failures/quota leave ticket functions usable. Hosted equivalents pass before M6 completion.
Learning: owner changes one prompt, inspects retrieved context, adds a failure example and explains the full native tool-call round trip.

## M5 — evaluation, performance and robustness

Prepare/review 100 held-out cases; create CLI runner and result manifests, run local baselines/comparisons, manual answer review, three repetitions, load tests and one measured data-access optimisation. Run browser/accessibility checks and fix material failures.
Pass: raw/summary reports reproducible; denominators/failures visible; local vs hosted vs mock labelled; no numbers presented as real customer impact. Report unresolved quality targets honestly.
Learning: owner reproduces one metric and explains the baseline and denominator.

## M6 — complete public free demonstration

Finish any M0 external checks. Configure preview/production Vercel + Neon + Cloudflare, seed/index per environment, live model checks, secure manager login and anonymous isolated demo, storage/usage checks. Publish sanitised /evaluation report.
Pass: open public URL in a fresh browser with laptop Ollama stopped; demo ticket CRUD, cited RAG and actual tool call work; all cloud components on free plans; secrets absent from bundles; cold/warm latency recorded. Complete hosted evaluation over quotas, or mark still pending for M8.
Learning: explain which code is unchanged between local and hosted and which provider behaviour differs.

## M7 — Jenkins

Implement docs/06-DELIVERY.md pipeline on local Jenkins, tests/artifacts, polling, credentials, test-gated Vercel preview/main release, rollback rehearsal. Disable duplicate Git deployment.
Pass: successful pipeline recorded; intentional failing test blocks deployment and production SHA stays unchanged; rollback tested; laptop-off behaviour documented. Capture at least five pipeline runs for timing.
Learning: owner diagnoses and fixes a deliberate failing test through Jenkins logs.

## M8 — portfolio handoff

Complete outstanding real-model test/review checks, refresh screenshots and public report, reproduce key benchmark commands, create demo walkthrough, architecture explanation, learning journal and 3–4 measured resume bullets explicitly naming LLM/RAG where supported.
Pass: all required features trace to tests/evidence; no unlabelled placeholders in the public report; limitations stated; owner can explain prompts/retrieval/embeddings/tool execution and CI. No fabricated claims. Owner review items stay pending until actually reviewed.

## Standard commands to implement

npm run dev — local client/API; npm run build — client and API build validation.
npm run lint; npm run typecheck; npm run codegen; npm run codegen:check.
npm run db:migrate; npm run db:seed; npm run db:cleanup — explicit target-safe operations.
npm run test:unit; npm run test:integration; npm run test:e2e.
npm run ai:check -- --provider <profile> — real capability checks.
npm run kb:index -- --target <local|preview|production> — bounded resumable ingestion.
npm run eval:run -- --profile <profile> --split <dev|test> — real evaluations with explicit dataset/run manifest.
npm run eval:report -- --run <id>; npm run bench:api; npm run bench:web.
npm run verify — lint, types, codegen, deterministic tests and build; no paid/live AI calls.
npm run deploy:preview; npm run deploy:production — wrappers used by Jenkins with target checks.

Commands are specified interfaces to build, not commands that already exist.

## Traceability

F01 → M1 auth/isolation tests.
F02–F04 → M2 integration/browser tests.
F05 → M3 version/indexing tests.
F06–F08 → M4 real capability tests + M5 evaluation.
F09 → M4 DB-derived insights + M5 published report.
F10 → M1–M5 test suites.
F11 → M6 laptop-off live demo.
F12 → M7 failed-gate and rollback evidence.
F13 → M8 reproducible report and owner walkthrough.

