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

## Tokenizer compatibility check

The project pins `@huggingface/tokenizers` version `0.2.0` and stores the Qwen tokenizer assets locally under `assets/tokenizers/qwen3-4b-instruct-2507`.

The assets are pinned to Qwen model revision `f50518eb58dfc750271b273fc113bdfc16ec2280`. The SHA-256 checksum of `tokenizer.json` is:

`aeb13307a71acd8fe81861d94ad54ab689df773318809eed3cbe794b4492dae4`

A Node 24 compatibility script encoded the ParcelDesk CSV example into 12 integer token IDs and decoded them back to the exact original text. The same check passed under macOS `sandbox-exec` with all network access denied.

`npm pack --dry-run` included the licence, tokenizer configuration and 11,422,654-byte tokenizer file. The resulting package was 2,102,746 bytes compressed and 11,545,859 bytes unpacked.

| Check | Result |
|---|---|
| Node 24 tokenizer loading | Passed |
| Encode/decode round trip | Passed |
| Runtime network required | No |
| Local assets included in npm package | Passed |
| Model asset licence retained | Passed |

## Node backend compatibility check

The local backend compatibility harness pins and imports:

| Package | Version |
|---|---|
| `graphql-yoga` | `5.24.1` |
| `graphql` | `17.0.2` |
| `drizzle-orm` | `0.45.3` |
| `pg` | `8.23.0` |

On Node `24.21.0`, GraphQL Yoga executed an injected GraphQL request and returned HTTP 200 with the expected response. Drizzle generated a parameterised PostgreSQL query containing an explicit `workspace_id = $1` predicate and the expected workspace UUID parameter. The `pg` pool and Drizzle client were instantiated without opening a database connection; real database connectivity remains a separate Neon/Docker check.

The production dependency audit reported zero known vulnerabilities after the compatibility dependencies were installed.

## Vercel Hobby compatibility check

The Vercel API reported the active `vallabh-shelars-projects` account plan as `hobby`. The repository was linked to the free Vercel project `resolve-ai-support-workspace` without enabling a paid plan or trial.

A local Vercel build using the Node 24 runtime completed in approximately 2 seconds. The generated output measured 7.0 MB, including a 6.9 MB GraphQL function bundle, below Vercel's 250 MB uncompressed function limit. Its function manifest recorded:

- runtime `nodejs24.x`;
- 90-second maximum duration;
- all three pinned Qwen tokenizer assets in `filePathMap`.

Local routing checks confirmed:

- `POST /api/graphql` returned GraphQL JSON with HTTP 200;
- `/tickets/example` returned the SPA entry document with HTTP 200;
- `/api/not-a-function` returned HTTP 404 rather than the SPA document.

The initial catch-all rewrite also served the SPA for unknown `/api/*` paths. The rewrite was corrected with an API-excluding negative lookahead and all three routes were retested.

The public Hobby compatibility deployment is available at `https://resolve-ai-support-workspace.vercel.app`. The deployed GraphQL function reported Node `24.20.0`, which satisfies the repository's `24.x` engine constraint, and successfully loaded the packaged Qwen tokenizer to reproduce the expected 12-token count.

Observed public requests immediately after deployment:

| Request | HTTP result | Total latency |
|---|---:|---:|
| First GraphQL tokenizer request | 200 | 1,687.84 ms |
| Immediate repeated request | 200 | 671.22 ms |
| SPA route | 200, HTML | Not recorded |
| Unknown API route | 404, text | Not recorded |

These are two compatibility observations, not a latency benchmark or customer-impact claim.

Vercel initially blocked later deployments because the existing Git commit author email did not match the verified Vercel account email. The repository-local Git email was changed to the already verified Vercel email, without altering global Git configuration, and a new commit deployed successfully.

Vercel CLI `59.16.0` introduced known vulnerabilities through its development-only transitive dependency tree when installed in the repository. It was removed from `package.json` and `package-lock.json`, restoring a zero-vulnerability project audit. M0 used the exact external invocation `npx --yes vercel@59.16.0`; this CLI limitation must be rechecked before Jenkins is implemented. Do not run `npm audit fix --force`, which proposed unrelated CLI downgrades.

The attempted automatic GitHub connection did not succeed. This does not affect authenticated CLI deployments and avoids creating a duplicate automatic deployment path before the Jenkins milestone.

## Local memory-pressure check

The Mac reported 16 GiB of physical memory. With the current development applications open and no Ollama model loaded, `memory_pressure -Q` reported 57% system-wide free memory.

Qwen and EmbeddingGemma were then loaded together with a five-minute keep-alive:

| Model | Ollama memory | Processor | Context |
|---|---:|---|---:|
| `qwen3:4b-instruct-2507-q4_K_M` | 3.2 GB | 100% GPU | 4,096 |
| `embeddinggemma:300m` | 679 MB | 100% GPU | 2,048 |

With both models resident, system-wide free memory was 26%, macOS reported zero throttled pages, and both requests completed. The short Qwen request measured 2,234.00 ms total with 2,077.65 ms model loading; the embedding request measured 1,092.83 ms total with 1,054.55 ms model loading and returned 768 dimensions.

This is a point-in-time development-machine observation, not a sustained stress test. Both models were explicitly unloaded after measurement.

## M0 checks still pending

- Neon Free pooled Node connection and `pgvector` extension check when credentials exist.
- Cloudflare Free generation, structured output, native tool calling, embeddings, quotas and token-limit checks when credentials exist.

These pending checks do not invalidate the completed local model evidence and do not yet establish hosted readiness.
