# GraphQL and HTTP contract

The schema in contracts/schema.graphql is the source of truth. Generate server resolver types and client typed operations from it. The numeric prefixes of this API file and AI file intentionally group the two contracts.

## HTTP behaviour

POST /api/graphql accepts one JSON GraphQL operation. Enforce origin/content type/CSRF and query limits from the architecture spec.
GET /api/graphql may expose a local-only development IDE; disable IDE in production. GET query execution is not needed for v1.
GET /api/health and /api/ready are separate JSON endpoints.
Frontend routes rewrite to index.html only after static files and /api routes are handled.

Return GraphQL errors with extensions.code plus requestId, and retryAfterSeconds when relevant. Authentication/validation transport errors use suitable HTTP 400/401/403/429; execution errors may follow GraphQL HTTP semantics. Frontend handles both HTTP and GraphQL errors.

Codes: UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, BAD_USER_INPUT, CONFLICT, RATE_LIMITED, AI_BUSY, AI_QUOTA_EXCEEDED, AI_TIMEOUT, PROVIDER_UNAVAILABLE, MODEL_OUTPUT_INVALID, INDEX_NOT_READY, CAPACITY_REACHED, INTERNAL_ERROR.
Expected failed inference after a run has been created returns an AiRun in FAILED state with errorCode; precondition/auth/quota failures before a run exists return GraphQL errors. Never leak raw DB/provider details.

## Mutation semantics

- login/enterDemo set the session cookie and a separate readable CSRF cookie. Store its hash in sessions. Client sends its value in the CSRF header for authenticated mutations; compare hash server-side. Both cookies rotate/expire together. The CSRF cookie grants no login access. Origin checks apply independently.
- logout invalidates session and clears both cookies.
- createTicket uses OPEN status and generates its number transactionally.
- updateTicket omission means unchanged; explicit null clears only nullable assigneeId. Null for title/status/category/priority/description is BAD_USER_INPUT. GraphQL input permits optional fields but service validation enforces this.
- addNote/saveReply atomically append a comment, increment ticket version and append activity. saveReply accepts only a same-ticket/same-workspace successful draft run reference.
- saveArticle with no id creates; with id requires expectedVersion. Existing content is immutable, so writes produce new article_versions rows.
- archiveArticle requires manager and matching version.
- startIndexing verifies current version and returns an existing matching job or creates one. FAILED can resume from stored progress after the cause is corrected.
- processIndexingBatch claims a lease and processes at most 4 chunks within the request deadline; return progress. A held lease returns AI_BUSY. READY is idempotent; SUPERSEDED cannot be resumed.
- classifyTicket/draftReply/findRelatedTickets validate expectedVersion before starting and save ticketVersion. Ticket changes during inference do not silently rewrite context; UI shows stale result.
- AI operations wait for completion/error within the request deadline. aiRun(id) lets a client recover a completed result after a connection interruption; it does not start background work.
- recordAiFeedback is an upsert per user/run; restrict to the same workspace. Note <= 500 characters.

## Query semantics

me is null when anonymous; all other domain queries require a session.
assignees includes active identities only from that workspace. No password/email/session fields are exposed.
Lists first in 1..50; invalid cursors/contradictory assigneeId and unassignedOnly yield BAD_USER_INPUT.
recentAiRuns is capped at 10 per ticket, newest first; no unbounded nested list.
Article reads permit published shared-template documents to active demo users. Historical articleVersion reads require own-workspace access or an allowed demo corpus version; no arbitrary global lookup.
insights uses ticket counts at query time; AI counts/latency/feedback use a fixed trailing seven-day UTC interval. SUCCEEDED, FAILED and INSUFFICIENT_EVIDENCE counts are separate. Latency percentiles use completed successful actions only, with sample count; failures/timeouts are counted separately, not silently lost.
Sensitive/internal database IDs do not constitute authorisation.

## Representative operation

```graphql
query TicketDetail($id: ID!) {
  ticket(id: $id) {
    id number title description status category priority version
    assignee { id displayName }
    comments(first: 20) {
      edges { node { id kind body createdAt author { id displayName } } }
      pageInfo { endCursor hasNextPage }
    }
  }
}
```

Use a dedicated typed operation per view/action; request only displayed fields. Verify list/detail query counts with request-scoped loaders.

