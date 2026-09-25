# Evaluation and resume evidence

No results exist at planning time. All counts below are required test design or proposed targets, not achieved metrics.

## Datasets

Create 30 original ParcelDesk articles covering the four categories. Stable fixture IDs and a versioned manifest record hashes and provenance (synthetic, owner reviewed).
Create 40 development tickets/questions used to tune prompts and retrieval threshold.
Create a separate held-out set of 100 tickets: 25 per category. Within this set, 70 have answerable documentation questions, 20 deliberately lack sufficient documentation, and 10 are adversarial/ambiguous tool/prompt cases. All 100 have reviewed category labels; priority labels require the documented rubric and ambiguity notes.
Write expected source article IDs and supporting spans for answerable cases. Derive relevant chunk IDs from spans for each profile so different tokenisation does not invalidate labels. Never insert evaluation answers into the retrieval corpus.
Deduplicate/paraphrase-check dev/test cases; changing prompts after inspecting test failures requires a new version and disclosure, not quietly calling the reused test set held out.

Synthetic generation can help draft cases; the owner reviews labels and source support before publishing quality results. If review is pending, mark the results provisional.

## AI measurements

| Metric | Definition |
|---|---|
| Category accuracy | Correct predicted category / all labelled cases; invalid/failed predictions count incorrect |
| Macro F1 | Mean per-category F1; include confusion matrix and class counts |
| Hit@5 | Answerable queries with at least one relevant chunk among top 5 / all answerable queries |
| Recall@5 | Retrieved relevant chunks / all relevant chunks per query, then average; distinct from Hit@5 |
| Supported-answer rate | Answers whose substantive claims are supported by their cited passages / completed ANSWER outputs, manually reviewed |
| Unsupported-answer rate | Completed ANSWER outputs with at least one unsupported material claim / completed ANSWER outputs |
| Answer coverage | ANSWER outputs / answerable cases; prevents improving support rate merely by refusing everything |
| Correct abstention | Appropriate insufficient-evidence outcomes / unanswerable cases; provider failures do not count as correct abstention |
| JSON validity | Valid first responses / generation attempts; also report final success after bounded repair |
| Tool success | Correct permitted tool request, execution and summary / tool cases; report invalid/unauthorised attempts |
| Latency | Per-action median/p95 and substep durations; include failures/timeouts separately |

Always show numerator/denominator and sample size. Report Wilson 95% intervals for proportions where feasible, especially small hosted samples. Do not present model-reported confidence as measured accuracy.

Run keyword retrieval vs vector retrieval on the same questions/corpus/profile version.
Run no-context generation vs RAG using the same generation model, token caps and question set.
Repeat local model evaluation three times for variability; retain all runs and aggregate. Hosted evaluation uses the same 100 cases split across daily quotas; if only a subset is complete, label its exact size and do not extrapolate a full-set score. Record model/date because hosted versions may change between batches.

Manual answer review: use a rubric (supported/correct, partially supported, unsupported, appropriate abstention); blind reviewers to baseline/RAG labels if practical. One owner review is acceptable with the limitation stated. Automated citation-ID validity is never substituted for factual support.

## Proposed release targets

Targets guide iteration; they are not resume claims:
- Category accuracy >= 80% and vector Hit@5 >= 80% on the held-out dataset.
- Supported-answer rate >= 85%, answer coverage >= 70% on answerable cases, correct abstention >= 80%.
- No successful cross-workspace access or forbidden tool execution in deterministic negative tests.
- >= 95% final structured-output validity across completed generation cases.

If targets fail, keep measured results, investigate on a development set, and document limitations. Do not hide failures, redefine denominators, or upgrade to a paid model. Before M8 complete, either meet targets or explicitly record the remaining quality limitation and agree the claim/display scope with the owner.

## Software and frontend verification

Vitest: domain invariants, Zod schemas, citation-map checks, pagination, idempotency/quota concurrency, role denial.
Integration tests: real disposable local Postgres, migrations, transactions, stale-version conflicts, two-workspace isolation, indexing resume/supersession.
Provider adapters: recorded/redacted fixtures for deterministic tests plus separate real compatibility tests.
Playwright: 8 required flows — demo isolation, login/logout, create/filter/open ticket, assignment/status, stale update, manager article/index, cited reply edit/save, AI unavailable/quota state.
Use mock inference for deterministic browser/CI tests; label it test-only. Additional hosted live smoke checks verify actual inference separately.
Record pass counts; code coverage is supporting information, not a substitute for tested behaviours.

Lighthouse: run five times on a production build with a fixed viewport/throttling configuration and browser version; report median performance/accessibility and LCP/CLS. First load versus repeat load distinguished. No universal score guaranteed.

## Backend and database benchmarks

Seed local benchmark databases with 1,000 and 10,000 tickets and a fixed comment distribution. Store generator seed and total rows. Do not upload these fixtures to Neon.
Use autocannon against real GraphQL HTTP requests, with valid local sessions, for read-heavy operations: ticket list, filtered list and detail with comments/assignee.
Warm up 20 seconds; measure 60 seconds at concurrency 1, 5, 10, 20; repeat three times. Record achieved requests/sec (not just configured concurrency), p50/p95/p99, error rate, CPU and memory. Disable expensive per-request debug logging.
Separate AI latency tests; do not load-test paid/quota-limited provider endpoints. The API throughput workload excludes AI explicitly.
Application API quotas may be disabled ONLY in a dedicated local benchmark environment bound to loopback; refuse that setting on hosted/production runs. Benchmark concurrency is not real user count.

Compare SQL plans, query counts and timings before/after one justified index or DataLoader optimisation on identical fixtures/load. Run variants sequentially, with Ollama/Jenkins stopped, and record warm/cold cache differences. Keep EXPLAIN ANALYZE artifacts. Never delete safety/production indexes just to create an exaggerated comparison; use a dedicated baseline migration/query variant.

Hosted checks: a few individual cold/warm requests after inactivity, recording Vercel region, Neon region, network conditions and AI state. Local results must not be labelled hosted performance.

## Artifact format

Create evaluation/results/<run-id>/ with manifest.json, cases.jsonl, summary.json, review.csv and report.md; export final charts as SVG/PNG from measured data. Manifest includes git commit, date, machine, Node/browser versions, prompt/corpus/dataset hashes, model IDs/digests, tokenizer/profile, settings, workload, failures, cache state and environment.
Store deployment/Jenkins reports separately under evidence/ci/ and browser artifacts under evidence/ui/. Never commit secrets or uncontrolled raw infrastructure logs.
The /evaluation page consumes a sanitised committed report JSON, clearly timestamped. It does not generate synthetic success numbers.

## Resume templates — fill only after measurement

- Built an LLM-powered React/TypeScript support workspace with a Node.js GraphQL API and custom PostgreSQL/pgvector RAG pipeline, achieving [X]% Hit@5 across [N] held-out support questions.
- Evaluated cited LLM replies against a no-context baseline, reducing unsupported-answer rate from [A]% to [B]% across [N] manually reviewed synthetic cases, with [C]% answer coverage.
- Implemented validated structured outputs and permission-scoped LLM tool calling, passing [N] workflow/security cases and achieving [X]% tool-task success on [M] evaluation cases.
- Optimised GraphQL data access using [measured change], reducing p95 latency from [A] to [B] ms at [R] requests/sec under local simulated load.
- Built Jenkins pipelines for type checks, integration/browser tests and Vercel deployments, recording [T]-minute median pipeline runs and blocking deployment on failing checks.

Choose 3–4 strongest truthful bullets. Do not claim customers, production scale, reduced staff time, training an LLM, enterprise SSO or Selenium from this project.

