# Resolve learning journal

## 2026-09-25 — Local LLM capabilities and embeddings

### Problem and intended behaviour

Resolve needs a local, zero-cost AI profile that can turn an unstructured support ticket into validated structured fields, request one controlled read-only function, and create retrieval vectors for a custom RAG pipeline. The application will own prompts, validation, retrieval, permissions, citations and tool execution; Ollama only runs the selected models.

### AI coding assistance used

The owner used Codex to interpret the frozen AI contract, select reproducible capability checks, construct Ollama requests and explain their outputs. The context supplied included the ParcelDesk CSV-import example, the required category taxonomy, the `findSimilarTickets` contract and the 768-dimensional embedding requirement.

Accepted suggestions included explicit category definitions in the structured-output prompt, a bounded JSON schema, one native tool declaration, and EmbeddingGemma's separate query/document prefixes.

### Mistake or limitation found

The initial structured-output request returned valid JSON but incorrectly labelled a manual CSV import failure as `SYNC`. JSON schema constrained the output's shape but did not teach the model the product taxonomy. The prompt was corrected with explicit definitions, including the rule that manual CSV import is `IMPORT_EXPORT`, and the rerun returned the expected category.

The exercise also showed that a tool request is not tool execution. Qwen selected `findSimilarTickets` and generated arguments, but the future Node.js service remains responsible for validation, authenticated workspace scope and database access.

### Work completed by the owner

The owner installed and activated the pinned Node/npm versions, installed Ollama, downloaded both selected models, ran the real structured-output request, refined and reran the prompt, ran the native tool-call request, generated query/document embeddings twice, and inspected `ollama ps` immediately after the warm embedding request.

No application code or evaluation labels were reviewed in this entry.

### Reproducible checks and observations

- `curl http://localhost:11434/api/version` returned Ollama `0.34.4`.
- `ollama list` showed the pinned Qwen and EmbeddingGemma model tags and digests.
- `POST /api/chat` with a JSON schema returned valid structured classification output; the refined run selected `IMPORT_EXPORT` and `HIGH`.
- `POST /api/chat` with the single function definition returned a native `findSimilarTickets` request with a limit of 3.
- `POST /api/embed` returned two numeric, nonzero, unit-normalised vectors of 768 dimensions each.
- The embedding request measured 17,889.66 ms cold and 77.49 ms warm.
- `ollama ps` showed EmbeddingGemma assigned to 100% GPU execution and using approximately 679 MB.

### Owner explanation

The embedding model does not write the answer. It converts the ticket query and knowledge-base passages into vectors. Resolve compares those vectors to retrieve relevant passages, then gives the ticket and retrieved evidence to Qwen so it can draft an answer with citations.

### Next learning exercise

During the remaining M0 work, the owner will verify tokenizer packaging and the selected Node/Vercel dependency path. This item remains pending and is not recorded as completed.

The tokenizer portion was subsequently completed and is recorded in the 2026-09-26 entry below. The Node/Vercel dependency path remains pending.

## 2026-09-26 — Local Qwen tokenizer packaging

### Problem and intended behaviour

Resolve must count tokens and enforce model input limits without downloading tokenizer files during an application request. Token counts also provide the future RAG chunking and prompt-budget boundaries.

### AI coding assistance used

Codex explained the role of model-matched tokenization, identified the official `@huggingface/tokenizers` package and supplied a small compatibility script. The owner received the exact Qwen model revision, expected tokenizer checksum, offline test and packaging inspection commands.

### Mistake or limitation found

An npm dry run warned that no `.npmignore` file existed and that `.gitignore` was used for file exclusion. Resolve is a private application and is not being published as an npm library, so the warning did not justify adding an unnecessary publish configuration file. The dry-run manifest was inspected directly instead.

This check proves npm packaging includes the assets. It does not prove Vercel serverless file tracing includes them; that remains a separate M0 check.

### Work completed by the owner

The owner installed and pinned `@huggingface/tokenizers@0.2.0`, downloaded the Qwen tokenizer files and licence from a pinned model revision, verified their checksums, created the compatibility script, and ran the online, network-denied and packaging checks.

### Reproducible checks and observations

- `npm run compat:tokenizer` encoded the CSV example into 12 integer token IDs and decoded the exact original text.
- The same command passed under `sandbox-exec` with all network access denied.
- `tokenizer.json` matched SHA-256 `aeb13307a71acd8fe81861d94ad54ab689df773318809eed3cbe794b4492dae4`.
- `npm pack --dry-run --json` listed all three tokenizer assets.
- The dry-run package measured 2,102,746 bytes compressed and 11,545,859 bytes unpacked.

### Owner explanation

The tokenizer converts text into the same integer token units expected by Qwen. Resolve uses those counts to split documents and keep prompts inside configured limits; the tokenizer itself does not generate an answer or run the LLM.

### Next learning exercise

Verify the Node/Vercel dependency and packaging path separately. This remains pending and is not recorded as completed.

## 2026-09-26 — Node, GraphQL and Vercel compatibility

### Problem and intended behaviour

Resolve needs one Node 24 backend dependency set that can execute GraphQL, generate safe PostgreSQL queries, run as a Vercel Function on the free Hobby plan, package local tokenizer assets, and serve an SPA without sending unknown API paths to the browser application.

### AI coding assistance used

Codex checked current package and platform documentation, selected stable compatible versions, supplied a backend compatibility harness, created the Vercel entrypoint and routing fixture, and interpreted local and hosted results. The owner installed the packages, authenticated Vercel and verified the Hobby plan before a project was created.

### Mistakes or limitations found

The first SPA catch-all also returned the HTML application for an unknown `/api/*` request. A negative-lookahead rewrite excluded the API namespace; the real GraphQL path continued to return JSON, the client route returned HTML and the unknown API route returned 404.

Vercel blocked two deployments because the Git commit author did not match the verified Vercel identity. The repository-local email was aligned with the existing verified account email, a new commit was made, and the next deployment reached `READY`. Global Git identity was not changed.

Installing Vercel CLI as a development dependency introduced CLI-only audit findings, including high and critical transitive findings. Downgrading did not resolve them. The CLI was removed from the project dependency tree, restoring a zero-vulnerability audit; the exact CLI version was invoked externally for M0 and must be reassessed before Jenkins.

### Work completed by the owner

The owner inspected the published Node engine and peer-dependency requirements, installed the exact backend packages, created and ran the backend compatibility harness, logged into Vercel and confirmed the active team was on Hobby.

Codex completed the large build-manifest inspection, live routing checks, deployment diagnosis, safe repository-local identity correction, production smoke test and evidence updates after the owner explicitly requested that work be performed directly.

### Reproducible checks and observations

- `npm run compat:backend` executed GraphQL successfully and generated a parameterised workspace-scoped SQL query.
- `npm audit` reported zero known vulnerabilities after Vercel CLI was removed from the repository dependency tree.
- `npx --yes vercel@59.16.0 build --prod --yes` produced a 7.0 MB build with a 6.9 MB function bundle and mapped all tokenizer files.
- The public GraphQL function ran on Node `24.20.0` and returned a tokenizer count of 12.
- The first post-deployment GraphQL request measured 1,687.84 ms; the immediate repeat measured 671.22 ms.
- A client-side route returned the SPA document with HTTP 200, while an unknown API route returned HTTP 404.

### Owner explanation

The same GraphQL Yoga instance can receive a Web `Request` locally and inside Vercel's Node Function runtime. Vercel packages the handler and its dependencies, while `includeFiles` adds non-code tokenizer assets that automatic code tracing cannot infer reliably.

### Next learning exercise

Explain why every database query must receive workspace scope from authenticated server context rather than accepting a model- or browser-supplied workspace ID. The real database isolation implementation remains an M1 task.

### Local resource observation

With both selected Ollama models loaded together, Qwen used 3.2 GB and EmbeddingGemma used 679 MB with 100% GPU assignment. System-wide free memory changed from 57% before loading to 26% with both models resident, with zero throttled pages reported. Both models were stopped after the measurement.
