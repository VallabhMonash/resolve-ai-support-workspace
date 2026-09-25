# Database design

PostgreSQL with pgvector. UUID primary keys, timestamptz timestamps, text enums enforced by database constraints and corresponding GraphQL enums. Drizzle owns the schema and versioned SQL migrations; explicit parameterised SQL is allowed for vector search, full-text search and measured optimisations.

## Tables

| Table | Required fields and constraints |
|---|---|
| workspaces | id, slug unique, name, next_ticket_number default 1, kind OWNER/DEMO/TEMPLATE, expires_at nullable, created_at |
| users | id, workspace_id FK, email nullable, display_name, role MANAGER/AGENT, password_hash nullable, active; unique(workspace_id,email); demo assignment identities cannot log in |
| sessions | id, token_hash unique, user_id FK, csrf_token_hash, expires_at, created_at |
| tickets | id, workspace_id FK, number, title, description, status, category, priority, assignee_id nullable, created_by, version default 1, created_at, updated_at, resolved_at nullable; unique(workspace_id,number) |
| comments | id, workspace_id, ticket_id, author_id, kind INTERNAL_NOTE/REPLY, body, ai_run_id nullable, created_at |
| ticket_events | id, workspace_id, ticket_id, actor_id, event_type, before_json, after_json, created_at |
| articles | id, workspace_id, title, current_version_id nullable, archived_at nullable, version, created_at, updated_at |
| article_versions | id, article_id, workspace_id, version_number, title, body, content_hash, created_by, created_at; unique(article_id,version_number) |
| indexing_jobs | id, workspace_id, article_version_id, profile_id, status PENDING/RUNNING/READY/FAILED/SUPERSEDED, next_chunk, total_chunks, lease_token nullable, lease_expires_at nullable, error_code nullable, updated_at; unique(article_version_id,profile_id) |
| chunks | id, workspace_id, article_version_id, ordinal, text, text_hash, start_offset, end_offset, token_count, profile_id, embedding vector(768); unique(article_version_id,profile_id,ordinal) |
| ai_runs | id, workspace_id, ticket_id, actor_id, action, idempotency_key, input_hash, ticket_version, state RUNNING/SUCCEEDED/INSUFFICIENT_EVIDENCE/FAILED, provider, model, profile_id nullable, prompt_version, output_json nullable, error_code nullable, started_at, completed_at, expires_at, timings_json, usage_json; unique(workspace_id,actor_id,action,idempotency_key) |
| ai_citations | id, workspace_id, ai_run_id, article_version_id, chunk_id nullable, source_label, title_snapshot, excerpt_snapshot; source must have been in that run's retrieval context |
| ai_feedback | id, workspace_id, ai_run_id, user_id, helpful boolean, note nullable, created_at; unique(ai_run_id,user_id) |
| quota_buckets | key, window_start, count, expires_at; unique(key,window_start), updated atomically |
| provider_leases | id, owner_run_or_job_id, expires_at; concurrency acquisition/release in transactions |

Composite FK/unique pairs enforce that comments/ticket actors/assignees belong to the same workspace. Shared template articles are the only explicit cross-workspace read path; citation policy validates that exception. Manager insights cannot aggregate another workspace.

Use application-generated UUIDs so a ticket and its event can be created atomically. Allocate ticket numbers using a transaction-safe workspace counter (workspaces.next_ticket_number), not MAX(number)+1.

## State rules

Any ticket status may transition to another listed status; entering RESOLVED sets resolved_at, leaving clears it. Always increment ticket version and append an event for field changes. Comments also increment ticket version/updated_at to invalidate stale AI context.
Resolution time, if reported later, means created_at to the latest resolved_at; do not call it staff time saved.

Draft generation never changes ticket state or posts a reply automatically. saveReply may reference aiRunId only when it belongs to the same workspace/ticket. User-edited text is saved as the actual reply; the original AI draft remains attached to its run.

Saving an article version increments articles.version and changes current_version_id transactionally. Mark incomplete old-version jobs SUPERSEDED. Old versions remain for historical citations but are excluded from new retrieval. Archive excludes all versions from retrieval.

## Indexing and embeddings

Both initial profiles produce 768-dimensional embeddings, but their semantic spaces are different. profile_id identifies provider/model/version, dimensions, normalisation, pooling/prefix rules and chunking version. Never compare vectors from different profiles, even when dimensions match.

A READY current-version job is required before its chunks enter retrieval. Indexing writes chunks idempotently by ordinal in small batches. A database lease prevents overlapping Continue requests. External embedding calls occur outside a DB transaction; commit batch progress only if the same lease/job/version is still current. A crash before commit may repeat inference but must not duplicate chunks. A crashed/expired lease can be reclaimed.

Use exact cosine search initially; the small corpus does not require approximate HNSW indexes. Keep full-text search as the retrieval baseline. Do not claim a vector-index speedup without implementing and measuring it.

## Initial indexes

- tickets(workspace_id, updated_at DESC, id DESC)
- tickets(workspace_id, status, updated_at DESC, id DESC)
- tickets(workspace_id, assignee_id, updated_at DESC, id DESC)
- comments(workspace_id, ticket_id, created_at, id)
- ticket_events(workspace_id, ticket_id, created_at, id)
- article_versions(article_id, version_number DESC)
- chunks(workspace_id, profile_id, article_version_id)
- GIN full-text index for ticket title/description and chunk text using English configuration
- ai_runs(workspace_id, started_at DESC), sessions(token_hash), expiry indexes for cleanup

Measure added index effects on representative local queries; avoid an index for every filter combination.

## Pagination contract

Opaque Base64URL cursor encodes updatedAt + id for ticket lists, createdAt + id for comments/events, and updatedAt + id for articles. Validate cursor structure and tie it to filters client-side; backend ordering is deterministic. Use keyset comparison and LIMIT first+1. Lists are eventually consistent when items change between pages; no claim of a snapshot.

## Cleanup and seed safety

Seed CLI refuses production unless explicit target/environment flags match. It is idempotent on stable synthetic fixture IDs.
Demo cleanup deletes expired workspaces with bounded cascades, invalidates sessions first, and runs on demo entry with a small limit plus an owner CLI. Logical expiry is enforced immediately even before deletion. Rate-limit counters must survive session resets until their own window expires.
Delete expired quota buckets/leases and retain AI run logs for 30 days. Owner article versions referenced by retained replies/citations remain; snapshots prevent broken evidence after permitted pruning.
Return storage-capacity errors gracefully. No background daemon or required cron service.

