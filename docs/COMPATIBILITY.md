# Compatibility and capability evidence

This document records measured M0 evidence for Resolve. A capability is marked as passed only when it was exercised against the real component. Unrun cloud and packaging checks remain pending.

## Local environment

Evidence collected on 2026-09-25 in Australia/Melbourne.

| Component | Version or configuration | Evidence state |
|---|---|---|
| Computer | Apple MacBook Air with M3 and 16 GB RAM | Owner reported |
| Architecture | Apple Silicon (`arm64`) | Observed locally |
| Node.js | `24.21.0` | Owner ran `node --version` after activating fnm |
| npm | `11.19.0` | Owner ran `npm --version` |
| Version manager | fnm | Active Node resolved from the fnm multishell path |
| Ollama | `0.34.4` | Ollama version endpoint and CLI output |
| Docker | `28.3.3` | Local CLI output |
| Docker Compose | `2.39.2-desktop.1` | Local CLI output |
| Java | `21.0.5` LTS | Local CLI output; intended for Jenkins later |

The repository pins Node `24.x` and npm `11.19.0` in `package.json`, with the exact local Node version in `.node-version`.

## Local AI profile

| Purpose | Model | Ollama digest | Download size |
|---|---|---|---|
| Generation | `qwen3:4b-instruct-2507-q4_K_M` | `0edcdef34593` | 2.5 GB |
| Embeddings | `embeddinggemma:300m` | `85462619ee72` | 621 MB shown by `ollama list` |

EmbeddingGemma uses asymmetric retrieval preprocessing:

- Query: `task: search result | query: {content}`
- Document: `title: {title or none} | text: {content}`

These formats follow the EmbeddingGemma model card and will be owned by the future embedding profile adapter rather than supplied by users.

## Structured-output check

The real Qwen model received a synthetic ParcelDesk ticket describing a CSV import failure caused by invalid UTF-8. Ollama was given a JSON schema for category, priority, rationale and summary.

The first prompt produced valid schema-shaped JSON but classified the issue as `SYNC`. Adding explicit category definitions and stating that manual CSV import is not synchronisation produced the expected `IMPORT_EXPORT` category and `HIGH` priority.

Measured refined run:

| Measurement | Result |
|---|---:|
| Total latency | 3,934.56 ms |
| Model-load time | 8.35 ms |
| Prompt tokens | 162 |
| Output tokens | 103 |
| Schema-valid output | Passed |
| Expected category and priority | Passed |

This proves transport-level structured generation and one expected semantic result. It is not an accuracy benchmark; repeatable evaluation belongs to M5.

## Native tool-call check

Qwen received one native function definition:

`findSimilarTickets({ query: string, limit: integer 1..3 })`

For a CSV UTF-8 import issue, the model returned an empty text response and a native `tool_calls` entry with:

- name: `findSimilarTickets`
- query: `CSV order import fails with an invalid UTF-8 error`
- limit: `3`

Measured run:

| Measurement | Result |
|---|---:|
| Total latency | 4,402.42 ms |
| Model-load time | 2,344.02 ms |
| Prompt tokens | 224 |
| Generated tokens | 37 |
| Correct native tool name | Passed |
| Schema-shaped arguments | Passed |
| Configured limit respected | Passed |

This test proves that the selected local model can request the function. It did not execute a search. The future Node.js service must validate the exact name and arguments, derive workspace scope from the authenticated session, execute the read-only database query and return only safe results to the model.

## Embedding check

The real EmbeddingGemma model embedded one formatted search query and one formatted knowledge-base document in a single request with truncation disabled.

| Measurement | Cold run | Warm run |
|---|---:|---:|
| Vector count | 2 | 2 |
| Dimensions per vector | 768, 768 | 768, 768 |
| All values numeric | Passed | Passed |
| Query vector norm | 1.00000010 | 1.00000010 |
| Document vector norm | 0.99999983 | 0.99999983 |
| Total latency | 17,889.66 ms | 77.49 ms |
| Model-load time | 17,655.38 ms | 8.19 ms |
| Input tokens | 51 | 51 |

The vectors are finite, nonzero and effectively unit-normalised. The warm request was approximately 231 times faster than the cold request for this two-input test.

Immediately after the warm run, `ollama ps` reported:

| Field | Result |
|---|---|
| Model memory | 679 MB |
| Processor assignment | 100% GPU |
| Context | 2,048 tokens |
| Keep-alive | Approximately 4 minutes remaining when observed |

The processor value means Ollama assigned model execution entirely to the GPU; it is not a measurement of continuous GPU utilisation.

## M0 checks still pending

- Package and tokenizer version selection and tokenizer-asset packaging.
- Node/GraphQL Yoga/Drizzle/`pg` compatibility under the selected Vercel runtime.
- Vercel Hobby GraphQL handler, CLI deployment and same-origin SPA rewrite checks.
- Neon Free pooled Node connection and `pgvector` extension check when credentials exist.
- Cloudflare Free generation, structured output, native tool calling, embeddings, quotas and token-limit checks when credentials exist.
- Memory-pressure observation with the normal development toolset open.

These pending checks do not invalidate the completed local model evidence and do not yet establish hosted readiness.
