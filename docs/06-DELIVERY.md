# Zero-spend deployment and Jenkins

## Selected topology

Vercel Hobby: compiled React SPA and Node.js GraphQL/health functions.
Neon Free: runtime PostgreSQL/pgvector; separate free projects for preview and production.
Cloudflare Workers AI Free: REST inference and embeddings called from Node. No separately deployed Worker, paid AI Gateway, Vectorize subscription or hosted GPU server is required.
GitHub personal repository: source and future Jenkins polling.
Jenkins: local macOS installation, one local build agent/executor. Ollama: native macOS. Local database: Docker Compose.

Do not buy a domain: use the provider's included domain. Do not enable Pro trials, paid models, paid overages or paid add-ons. Owner stores secrets in provider/Jenkins credential stores, not chat or git.

## Free-plan facts checked 10 September 2026

Vercel Hobby is intended for personal non-commercial projects. Function usage is limited and can pause features; Fluid Compute supports bounded Node requests and reduces, but does not eliminate, cold starts. Budget handlers for 90 seconds; application AI deadline is shorter.
Neon Free currently advertises 0.5 GB storage and 100 CU-hours per project per month. Scale-to-zero adds first-request latency. pgvector supplies vector operations in the database.
Cloudflare Free currently includes 10,000 neurons/day shared across selected model inference/embeddings; additional operations fail after the free limit. Some models require billing, so use the verified free model allowlist only.

References: [Vercel Hobby](https://vercel.com/docs/plans/hobby), [function limits](https://vercel.com/docs/functions/limitations), [Neon pricing](https://neon.com/pricing), [Cloudflare pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).

Free-tier terms may change. Recheck at M0 and before deployment. A zero-cost configuration does not promise uninterrupted availability forever. If a provider requires payment for the selected capability, stop that external step and continue local work; never silently incur costs.

## Environment contract

Server-only:
- APP_ENV=local|test|preview|production
- APP_ORIGIN (canonical allowed browser origin); additionally allow only the exact HTTPS deployment URL supplied by trusted Vercel VERCEL_URL metadata for candidate/preview testing, never a wildcard *.vercel.app
- DATABASE_URL (pooled hosted runtime URL)
- DATABASE_DIRECT_URL (migration/owner CLI only; omit from browser and ordinary runtime if unnecessary)
- SESSION_IP_HASH_SECRET
- AI_PROVIDER=ollama|cloudflare|mock (mock rejected in preview/production)
- OLLAMA_BASE_URL (loopback by default; never a visitor-supplied URL)
- GENERATION_MODEL / EMBEDDING_MODEL / EMBEDDING_PROFILE_ID
- CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN
- AI_DAILY_ACTION_LIMIT / AI_DAILY_PROVIDER_ATTEMPT_LIMIT
- DEMO_ENABLED / MAX_ACTIVE_DEMOS
- BENCHMARK_MODE=false (must refuse true outside dedicated local benchmark)
- bootstrap credentials supplied to the one-time owner CLI, never persisted in a committed env file

Jenkins-only: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, preview/production migration credentials, test-owner credentials. Separate credential scopes/stages. Vercel tokens must not enter browser build environment.
Client: VITE_GRAPHQL_PATH=/api/graphql and non-secret display configuration only.
Create a documented .env.example with placeholders in M1 and ignore real environment files, .vercel state, database volumes and raw private artifacts.

## Deploy sequence

1. M0: validate free account settings, model capability and a minimal temporary preview if credentials are available. Document missing external inputs without pretending success.
2. M6: create Neon extensions and run reviewed migrations against preview. Seed fictional data using the target-checked CLI. Index the corpus using the hosted embedding profile within daily allowance.
3. Configure Vercel Node runtime, SPA fallback that excludes /api, safe headers, origin, and secrets. Deploy a preview via CLI.
4. Run HTTP health/readiness and browser smoke tests plus one real generation/embedding/tool workflow. Verify demo isolation and invalid-origin requests.
5. Migrate production explicitly using backward-compatible SQL, seed/index its corpus, build with production environment, deploy immutable candidate and verify before assigning it to production traffic using the CLI workflow supported by the current Hobby plan.
6. Publish the final URL only after verified. No account/resource creation is performed by this planning package.

For preview authentication during testing use the provider-supported protected-preview access configured securely if needed; do not disable protections broadly to make tests pass.

## Jenkins milestone

Install Jenkins LTS and a supported JDK through the documented macOS method; pin versions. Prefer a separate local build-agent process under a dedicated label, with controller executors disabled. One build executor and sequential jobs suit 16 GB RAM. Bind Jenkins locally; no public inbound tunnel is required.
SCM polling (e.g. every 5 minutes while Jenkins is running) triggers jobs. Owner may also run manually. Laptop sleep pauses pipelines, not the deployed app.
Use a committed declarative Jenkinsfile, small plugin set (Pipeline, Git, Credentials Binding, JUnit and necessary report handling). Keep logs and last 10 builds with bounded artifact retention. Disable concurrent builds for the deployment job.

Stages:
1. Checkout exact revision; npm ci.
2. Lint + typecheck + GraphQL codegen consistency.
3. Start disposable local test DB; run migrations and unit/integration tests.
4. Build and run deterministic Playwright tests with mock inference against the local production build.
5. Archive JUnit/browser reports; all earlier failures block deployment.
6. On trusted owner branches only, use Vercel CLI to create a preview; run safe preview smoke tests. Do not grant deployment/DB secrets to untrusted PR code.
7. On main only, explicitly gated production release: reviewed forward migration, production-target build/candidate, smoke tests and release to production traffic. Confirm exact build SHA in release evidence.
8. Always clean up ephemeral test resources and credentials/environment files.

Use the documented staged production sequence: vercel pull --environment=production, vercel build --prod, vercel deploy --prebuilt --prod --skip-domain, smoke-test the returned immutable URL, then vercel promote <deployment-url>. Preview uses its own environment/build. A preview artifact must not be promoted with production credentials assumed to change retroactively. Verify this sequence in M0/M6 against the current Hobby account. If an account restriction prevents staged release, record the blocker and obtain a specific change decision; do not bypass the agreed checks. See [Vercel deploy](https://vercel.com/docs/cli/deploy) and [promote](https://vercel.com/docs/cli/promote).
[CLI custom workflows](https://vercel.com/kb/guide/using-vercel-cli-for-custom-workflows), [Jenkins macOS](https://www.jenkins.io/doc/book/installing/macos/).

At M7 Jenkins becomes the sole automated production deployment path. Disconnect/disable automatic Vercel Git deployments for this project; no second GitHub Actions deployment. Failed tests must be demonstrated to leave the production SHA unchanged.

Do not run full live LLM evaluations on every push; they consume time/quotas and are nondeterministic. A manual local evaluation stage may archive real-model results separately.
Measure total pipeline duration, stage duration, pass counts and failed-gate behaviour over at least five runs, including an intentional test failure on a demonstration branch.

## Migrations and rollback

No auto-migrate on request/startup. Migration CLI uses direct DB access and an advisory lock. Expand/contract, additive changes for v1. Preview and production never share credentials/data.
Rollback application to the previous known deployment; do not automatically reverse database migrations or delete user data. Rehearse rollback with an additive migration and record SHA/evidence. Retain a local secure pg_dump before risky owner-approved data changes.
Jenkins secrets are masked and scoped; no shell tracing around credentials.

## When allowances run out

Show AI quota message with retry-after/reset if known, preserve ticket UI, never pretend a stored example is live inference. Database/service quota failures show an honest unavailable state. Publish a recorded local walkthrough alongside the live URL to explain the product when free hosting is unavailable; it is supplemental evidence, not a replacement for implementing live deployment.

