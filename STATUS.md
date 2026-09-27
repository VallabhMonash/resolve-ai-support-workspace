# Resolve status

## Current state

Planning and M0 compatibility validation are complete. The selected zero-spend local and hosted profiles passed real checks for Node/GraphQL/Drizzle, offline tokenization, structured generation, native tool calling, 768-dimensional embeddings, Vercel Hobby packaging, Neon Free PostgreSQL/pgvector and Cloudflare Workers AI Free. A compatibility-only Vercel deployment exists, but the Resolve application schema, authentication, product UI and benchmark suite have not been implemented.

## Milestone tracker

| Milestone | State | Evidence |
|---|---|---|
| M0 — compatibility and free-resource checks | Complete | [Compatibility evidence](docs/COMPATIBILITY.md) and [learning journal](docs/LEARNING-JOURNAL.md); all frozen local, packaging, free-hosting and provider checks passed |
| M1 — foundation and authentication | Not started | — |
| M2 — ticket workspace and React workflows | Not started | — |
| M3 — knowledge base and embeddings | Not started | — |
| M4 — LLM features, RAG and tool calling | Not started | — |
| M5 — evaluation, reliability and performance | Not started | — |
| M6 — public free deployment | Not started | — |
| M7 — Jenkins CI/CD | Not started | — |
| M8 — evidence and portfolio handoff | Not started | — |

## Next action

Begin M1 foundation and authentication using the frozen scope and contracts. Replace the compatibility fixture incrementally; do not treat the current public page as the completed Resolve application.

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

2026-09-26 / M0 / commit `a6cf563` plus deployed compatibility state / pinned GraphQL Yoga, GraphQL, Drizzle and `pg`; executed local GraphQL and SQL-generation harness; confirmed Vercel Hobby; built and deployed Node 24 GraphQL function; exercised packaged tokenizer and routing publicly / backend imports, GraphQL execution, parameterised workspace filter, 12-token hosted count, SPA fallback and API exclusion passed; production dependency audit reported zero vulnerabilities / Neon and Cloudflare pending; memory pressure recorded separately; Vercel CLI transitive audit limitation recorded / `api/graphql.mjs`, `scripts/check-backend-runtime.mjs`, `vercel.json`, `docs/COMPATIBILITY.md`, `docs/LEARNING-JOURNAL.md`, `https://resolve-ai-support-workspace.vercel.app` / verify remaining M0 provider checks.

2026-09-26 / M0 / commit `759ffff` plus local runtime state / measured 16 GiB Mac memory before and during simultaneous Qwen and EmbeddingGemma residency / both models ran with 100% GPU assignment; free memory changed from 57% to 26%; zero throttled pages; both requests passed / sustained stress testing not performed / `docs/COMPATIBILITY.md`, `docs/LEARNING-JOURNAL.md` / models unloaded; verify Neon and Cloudflare.

2026-09-27 / M0 / commit `12fa624` plus Cloudflare compatibility working tree / connected to Neon Free through the pooled endpoint with explicit TLS verification; exercised PostgreSQL 18.6, pgvector 0.8.6, temporary `vector(768)` storage and a real Drizzle query; called Cloudflare Workers AI Free for schema-shaped classification, native tool selection and two hosted embeddings; reran the full suite explicitly through fnm on Node 24.21.0 / all frozen M0 checks passed; two owner-run hosted sequences measured 2,336.60 ms and 2,958.68 ms; production dependency audit reported zero vulnerabilities / initial Cloudflare tool output was truncated at 160 tokens and correctly rejected; 512 tokens produced complete native calls; hosted timing is not a benchmark / `scripts/check-neon-runtime.mjs`, `scripts/check-cloudflare-ai.mjs`, `docs/COMPATIBILITY.md`, `docs/LEARNING-JOURNAL.md` / close M0 and begin M1 foundation and authentication.
