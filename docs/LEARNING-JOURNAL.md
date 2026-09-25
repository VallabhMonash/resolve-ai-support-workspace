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
