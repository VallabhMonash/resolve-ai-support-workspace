# Resolve status

## Current state

Planning is complete and M0 compatibility validation is in progress. Node/npm and backend dependencies are pinned; the tokenizer works offline and inside a deployed Vercel function; and real structured-output, native tool-call and embedding checks have passed locally. A compatibility-only Vercel Hobby deployment exists, but the Resolve application, database and benchmark suite have not been implemented.

## Milestone tracker

| Milestone | State | Evidence |
|---|---|---|
| M0 — compatibility and free-resource checks | In progress | [Compatibility evidence](docs/COMPATIBILITY.md) and [learning journal](docs/LEARNING-JOURNAL.md); local AI, tokenizer, Node backend and Vercel checks passed; Neon, Cloudflare and memory checks remain pending |
| M1 — foundation and authentication | Not started | — |
| M2 — ticket workspace and React workflows | Not started | — |
| M3 — knowledge base and embeddings | Not started | — |
| M4 — LLM features, RAG and tool calling | Not started | — |
| M5 — evaluation, reliability and performance | Not started | — |
| M6 — public free deployment | Not started | — |
| M7 — Jenkins CI/CD | Not started | — |
| M8 — evidence and portfolio handoff | Not started | — |

## Next action

Verify Neon Free pooled connectivity and `pgvector`, Cloudflare Free AI capabilities and local memory pressure with the normal development tools open. Do not treat the compatibility-only public page as the completed Resolve application.

## External inputs needed during implementation

- Owner-created Vercel Hobby, Neon Free and Cloudflare Free accounts, with necessary credentials configured securely.
- An available personal GitHub repository for the future code and Jenkins polling.
- Owner-chosen manager login credentials for the persistent workspace.
- Owner review of synthetic evaluation labels and a sample of generated answers.

These inputs do not prevent local scaffolding, deterministic tests, documentation or local database work. Do not ask the owner to paste secrets into chat.

## Evidence log format

Date / milestone / commit or file state / commands / passed checks / failed or skipped checks / artifact paths / next action.


## Planning verification

See [planning review](docs/PLAN-REVIEW.md). Local document links and basic GraphQL contract checks passed; runtime/schema compilation and all implementation tests remain future work.

## Evidence log

2026-09-25 / M0 / working tree after commit `3f354f7` / pinned Node 24.21.0 and npm 11.19.0; exercised Ollama version, structured chat, native tool request, query/document embeddings and processor inspection / local structured output, tool request and 768-dimensional embeddings passed / tokenizer, package, Vercel, Neon and Cloudflare checks pending / `docs/COMPATIBILITY.md`, `docs/LEARNING-JOURNAL.md` / owner performs remaining tokenizer and Node/Vercel compatibility checks.

2026-09-26 / M0 / working tree after commit `237eda7` / pinned `@huggingface/tokenizers@0.2.0`; verified Qwen asset checksums; ran encode/decode online and with network denied; inspected npm dry-run manifest / 12-token round trip and local asset packaging passed / Node/Vercel, Neon and Cloudflare checks pending / `scripts/check-tokenizer.mjs`, `assets/tokenizers/qwen3-4b-instruct-2507`, `docs/COMPATIBILITY.md`, `docs/LEARNING-JOURNAL.md` / owner performs the remaining dependency and hosted checks.

2026-09-26 / M0 / commit `a6cf563` plus deployed compatibility state / pinned GraphQL Yoga, GraphQL, Drizzle and `pg`; executed local GraphQL and SQL-generation harness; confirmed Vercel Hobby; built and deployed Node 24 GraphQL function; exercised packaged tokenizer and routing publicly / backend imports, GraphQL execution, parameterised workspace filter, 12-token hosted count, SPA fallback and API exclusion passed; production dependency audit reported zero vulnerabilities / Neon, Cloudflare and memory-pressure checks pending; Vercel CLI transitive audit limitation recorded / `api/graphql.mjs`, `scripts/check-backend-runtime.mjs`, `vercel.json`, `docs/COMPATIBILITY.md`, `docs/LEARNING-JOURNAL.md`, `https://resolve-ai-support-workspace.vercel.app` / verify remaining M0 provider checks.
