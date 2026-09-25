# Decision record and external references

Prepared 10 September 2026. This is a design freeze, not a claim that providers or the app have been tested.

## Decisions

D01 — One support workspace product covers the user's priority gaps without separate projects.
D02 — Node.js runs all backend domain/GraphQL/AI orchestration code; GraphQL is its API contract.
D03 — Vite React SPA and GraphQL Yoga keep React and Node learning visible; no Next.js dependency.
D04 — Drizzle/PostgreSQL/pgvector provide ORM and data-layer evidence. Small-corpus vector search is exact initially.
D05 — Ollama and Cloudflare implement adapters; core RAG and tool code is shared. Profile-specific prompts/preprocessing and separate evaluation are expected.
D06 — Vercel Hobby replaces the earlier Render suggestion for this demo. Functions can still cold-start; Neon can sleep.
D07 — Native function calling is a bounded read-only workflow. No autonomous agent claims.
D08 — Manager/agent cookie sessions and scoped demo cover basic authentication/security. OAuth/OIDC/JWT remain outside v1.
D09 — Playwright is the one browser automation framework. Selenium is not claimed.
D10 — Jenkins is required late in the project, runs locally, and becomes the sole automatic deployment path.
D11 — All project resources stay free. Public quotas/cold starts are disclosed; no paid fallback.
D12 — Resume evidence comes from reproducible synthetic/local/hosted measurements with the environment labelled.
D13 — The public demo has isolated temporary tickets and read-only shared documentation; manager editing is available through private owner login/local demonstration.
D14 — Initial generation models: local Qwen3 4B instruct, hosted Llama 3.1 8B fast. Embeddings: local EmbeddingGemma 300M, hosted BGE base English. Verify functionality before reliance.
D15 — Article indexing uses resumable bounded requests; no permanent workers or cloud queue.
D16 — Planning only in this turn. No accounts, app dependencies, deployments, models or application implementation were created.

## External references

Use official docs to verify current syntax, model capability and plans during M0. Facts from sources below are limited to provider behaviour; design choices and targets are ours.

| Source | What it supports |
|---|---|
| [Vercel Hobby](https://vercel.com/docs/plans/hobby) | Personal/non-commercial free plan and usage limits |
| [Node 24 support](https://vercel.com/changelog/node-js-24-lts-is-now-generally-available-for-builds-and-functions) | Selected LTS runtime available on Vercel |
| [Standalone tokenizers](https://huggingface.co/blog/transformersjs-v4) | Lightweight model-tokenisation library |
| [Vercel Node runtime](https://vercel.com/docs/functions/runtimes/node-js) | JavaScript/TypeScript backend functions |
| [Vercel function limits](https://vercel.com/docs/functions/limitations) | Fluid Compute duration/resource constraints |
| [Vercel Fluid Compute](https://vercel.com/docs/fluid-compute) | Reduced cold starts, not zero guaranteed delay |
| [Vercel custom CI/CD](https://vercel.com/kb/guide/using-vercel-cli-for-custom-workflows) | CLI integration with CI providers |
| [Vercel staged deploy](https://vercel.com/docs/cli/deploy) / [promote](https://vercel.com/docs/cli/promote) | Build production candidate, verify, then assign production traffic |
| [Neon pricing](https://neon.com/pricing) | Current free storage/compute; account checks still required |
| [Neon extensions overview](https://neon.com/blog/ten-most-popular-postgres-extensions) | pgvector availability and Postgres extensions |
| [pgvector](https://github.com/pgvector/pgvector) | Vector dimensions, distance operators and search behaviour |
| [Cloudflare AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) | Free daily neurons, paid-model exclusions, selected model listing |
| [Cloudflare traditional function calling](https://developers.cloudflare.com/workers-ai/features/function-calling/traditional/) | Model requests a tool; application executes it |
| [Cloudflare JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/) | Structured generation support; model validation still required |
| [BGE base embeddings](https://developers.cloudflare.com/workers-ai/models/bge-base-en-v1.5/) | 768-dimensional embedding API and input limit |
| [Ollama Qwen3 4B instruct](https://ollama.com/library/qwen3:4b-instruct) | Initial compact local generation model |
| [Ollama EmbeddingGemma](https://ollama.com/library/embeddinggemma) | Local embedding model |
| [Ollama embeddings](https://docs.ollama.com/capabilities/embeddings) | Embedding API |
| [Ollama tool calling](https://docs.ollama.com/capabilities/tool-calling) | Native tool round-trip |
| [Ollama hardware support](https://docs.ollama.com/gpu) | Apple Metal GPU acceleration |
| [Jenkins macOS](https://www.jenkins.io/doc/book/installing/macos/) | Local Jenkins installation |
| [Effective agents](https://www.anthropic.com/engineering/building-effective-agents) | Start with simple workflows and evaluate before adding complexity |

Some direct Neon documentation responses could not be read by the web tool; verify extension installation in the real free project at M0. Model catalog presence does not prove every structured/tool feature on a particular account. No credentials or live model probes were available during planning.

## Filesystem note

The configured project path /Users/valla/Documents/ChatGPT/AI Full Stack did not exist at the beginning of this planning turn, so it was created for this handoff. A separate /Users/valla/Desktop/AI Full Stack directory contains a .git directory; it was not moved or modified. The owner can use the configured project folder for this plan. Before coding, inspect whether the intended repository is the Desktop checkout and consolidate deliberately without overwriting existing work.

The Azure planning reference was not found in the accessible project locations inspected. This handoff is self-contained rather than claiming to copy an unseen Azure template.

