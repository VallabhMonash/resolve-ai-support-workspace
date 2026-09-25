# Handoff for the implementing model and owner

## Do not reopen settled decisions

Resolve v1 is defined in docs/00-SCOPE.md. Use React/TypeScript, Vite/Apollo, Node/GraphQL Yoga, PostgreSQL/Drizzle/pgvector, custom AI services, Ollama locally, Cloudflare hosted, Vercel/Neon free and local Jenkins later.
Do not add Next.js, a Python AI service, LangChain, Redis, paid infrastructure, Kubernetes, SSO or a second deployment pipeline. Routine library compatibility fixes are allowed within the architecture.

Read STATUS.md first in resumed turns. Read only the relevant detailed specs after the overview. Update progress with actual commands/results, not a percentage guessed from generated files.
Before writing a feature, identify its scope ID, GraphQL operation, data invariants and acceptance check. Build small vertical slices so the owner can review working behaviour.

## Decisions still requiring measurement, not redesign

Exact package versions, provider capability confirmation, tokenizer packaging, model latency, retrieval thresholds, actual dataset scores, service regions/account credentials and final resume numbers are determined in the assigned milestones.
Selected models are defaults subject to a free-capability check. If a model changes, retain the same application contract and write the evidence/reason.
Do not invent repo URLs, project IDs, model measurements or deployment success.

## Learning workflow

For each AI milestone:
1. Explain the concept in a short paragraph using a ParcelDesk example.
2. Build a small runnable example alongside the real implementation, without a duplicate production code path.
3. Ask the owner to modify one small piece; provide the expected observation and a verification command.
4. Record what the owner actually completed. Do not claim they reviewed code or labels just because time passed.
5. Continue independent implementation while owner exercises are pending; required review remains pending for final claims.

Keep docs/LEARNING-JOURNAL.md with:
- Problem and intended behaviour.
- AI coding assistance used (tool/model when known), context supplied and suggestions accepted.
- A mistake/limitation found and how it was checked.
- Code the owner changed or explained.
- Reproducible command and observed outcome.

The journal is evidence for “used AI to get real things done.” Avoid estimated hours saved without a timed comparison.

## Expected final repository evidence

Runnable setup/teardown, safe environment template, migrations/fixtures, schema and generated operation types, UI screenshots, deterministic test reports, real AI evaluation manifests/reviews, local performance reports, hosted smoke/cold-start results, Jenkinsfile and pipeline evidence, learning journal, demo guide and measured resume bullets.

## Scope or dependency failure handling

When a free service is unavailable, preserve local progress and report the exact failed capability. A failed online step does not mean the application is finished. A provider-specific workaround must stay free and preserve capability; larger changes need the owner's decision.
Do not use a paid trial as a temporary workaround. Do not replace live AI with recorded output without explicit labelling and an unresolved feature status.
When specifications conflict, use frozen scope first, then architecture/data/AI/API contracts; fix the inconsistency in documents and record the reason before continuing.

## Suggested first coding message

Read the project handoff and implement M0 followed by M1. Carry out routine decisions autonomously, preserve all zero-spend constraints, and keep STATUS.md updated. Explain the meaningful decisions and provide the first runnable local slice with verification evidence. Do not change the scope or claim model/hosting tests passed unless you ran them.

