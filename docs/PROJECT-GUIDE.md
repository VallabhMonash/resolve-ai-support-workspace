# Resolve: the project recipe and revision guide

Start here when returning to the project or preparing for an interview. This guide explains the idea, the order of work and why each step matters. STATUS.md is the record of what is actually finished. The other specifications contain the exact implementation rules.

## What are we making?

Resolve is a website for support staff at ParcelDesk, a fictional order-management company. Staff can manage customer problems, keep help articles and use AI to understand tickets and draft replies using those articles. All customer information is made up for the project.

Imagine this ticket: “My CSV upload fails with an invalid UTF-8 error. I cannot import orders.”

The finished application will let a support agent:
1. Open and assign the ticket.
2. Ask AI for a short summary, category and suggested priority.
3. Find the relevant CSV help article and ask AI to draft a reply with sources.
4. Read those sources, edit the reply and save it in the application.
5. Separately ask AI to find similar past tickets through our controlled search tool.
6. Resolve the ticket and see its history.

A saved reply stays inside Resolve; this version does not send emails. AI suggestions stay under the support agent's control.

## The ingredients and their jobs

| Ingredient | Its job in ordinary language |
|---|---|
| React | Builds the screens and responds to clicks. |
| TypeScript | Helps catch mistakes by describing the kinds of values our code expects. |
| Vite | Runs the frontend during development and builds its deployable files. |
| Apollo Client | Sends GraphQL requests from React and manages the returned data. |
| Node.js | Runs our backend JavaScript outside the browser. |
| GraphQL | Defines what information the frontend can request and what changes it can ask the backend to make. A query reads; a mutation changes something. |
| GraphQL Yoga | Receives GraphQL requests and connects them to our backend functions. |
| PostgreSQL | Stores accounts, tickets, articles and other application data. |
| Drizzle | Helps our TypeScript backend describe tables and write database queries. |
| pgvector | Adds storage and similarity comparison for embedding vectors to PostgreSQL. |
| Ollama | Runs downloaded AI models on the Mac. |
| Cloudflare Workers AI | Runs hosted AI models so the online demo works without the Mac. |
| Neon | Hosts our PostgreSQL database on its free plan. |
| Vercel | Hosts the frontend and Node backend function on its free Hobby plan. |
| Jenkins | Later checks our code and deploys it automatically from the Mac. |

Everything must fit free resource limits. Quotas and sleeping services can temporarily interrupt the hosted demo.

## The AI ingredients: three different jobs

**Tokenizer:** converts text into small units called tokens. Tokens may be whole words, word pieces or punctuation. Our code counts tokens to keep inputs within model limits and split long articles into chunks. The tokenizer itself does not choose the article chunks or write answers.

**Embedding model:** converts a passage into a list of numbers representing its meaning. Think of these as coordinates on a meaning map. Similar passages tend to have nearby coordinates. Our selected models return 768 numbers per passage; that size comes from their design.

**LLM:** reads text and produces text or structured decisions. It can summarise a ticket, suggest its category, write a reply or request a tool. It normally receives the original retrieved passages, not their embedding numbers.

**Vector search:** our database compares the embedding numbers to find nearby passages. This is the similarity step.

**RAG:** retrieval-augmented generation. We first retrieve relevant help text, then give that text to the LLM so it can draft an answer with sources. This helps ground answers in our documentation; quality still needs testing.

**Tool calling:** the LLM requests a named function with arguments, such as searching for three similar tickets. Our backend checks the request and permissions, runs the search and returns safe results. The model does not get unrestricted database access.

### Local versus hosted

| Job | On the Mac | On the hosted service |
|---|---|---|
| Run generation models | Ollama runs Qwen 3 4B | Cloudflare runs Llama 3.1 for structured output and Qwen 3 30B for tool calls, as validated in M0 |
| Create embeddings | EmbeddingGemma through Ollama | BGE Base through Cloudflare |
| Tokenize text | Bundled Qwen tokenizer for local budgeting; Ollama also tokenizes model inputs | Cloudflare uses its models' tokenizers internally; our hosted adapter must respect their limits |
| Control the application | Our code owns prompts, retrieval, validation and tool execution | Our code owns the same workflow, using a provider adapter to translate requests and responses |

Both embedding models output 768 numbers, but they learned different meaning maps. A query and the documents it searches must use the same embedding model and settings. Changing models requires regenerating stored embeddings.

### The two AI flows to remember

Preparing documentation:

```text
Help article → our code splits it into chunks using token counts
             → embedding model converts each chunk into numbers
             → database stores the text and numbers together
```

Answering a ticket:

```text
Ticket → embedding model converts the search query into numbers
       → database finds similar article chunks
       → LLM reads the ticket and original retrieved text
       → draft reply with sources → support agent reviews it
```

Classifying a ticket can go directly to the LLM. It does not always need retrieval or embeddings.

## The recipe: what each phase adds

Only M0 is complete as of the last recorded milestone. M1–M8 below describe planned work.

### M0 — Check the ingredients before cooking (complete)

**Goal:** prove that the laptop, libraries and free services can do the required jobs.

**Steps:** pin Node and package versions → run local models → test structured output, native tool requests and embeddings → test offline tokenizer loading → deploy a small GraphQL function → test Neon vector storage and hosted Cloudflare AI → record results.

**Ready when:** the real components pass the capability checks. We reached this point; the public page is still a small compatibility page.

**What we learned:** correct-looking JSON can contain a wrong category; model loading can make a first request slow; an output limit can cut off a tool request; downloaded model weights and tokenizer files have different jobs.

**Interview explanation:** “I validated the local and free hosted architecture before building the product, including real tool calls and vector storage. I recorded observed timings and limitations.”

### M1 — Build the kitchen and control access (next)

**Goal:** make a working application foundation where users can sign in safely.

**Steps:** create the React and Node/GraphQL structure → define database tables → add migrations and sample data → implement login/logout and roles → give visitors isolated temporary demo workspaces → test access boundaries.

A **migration** is a recorded database structure change. A **seed** inserts repeatable sample data. A **session** lets the server recognise a signed-in user. A **workspace** groups one team's data.

**Ready when:** a clean setup builds, sample data can be loaded again without duplicates, and a user cannot read or change another workspace's data. Production settings must reject test-only modes.

**Concept to explain:** browser asks → GraphQL receives → backend checks identity and permission → database query runs → response goes back. The server decides which workspace the user belongs to.

### M2 — Make the support desk usable

**Goal:** let people manage tickets through real React screens.

**Steps:** build inbox and ticket pages → add search and filters → create and assign tickets → add comments and saved replies → record changes → handle two people editing the same ticket.

**Ready when:** ticket workflows work on desktop and mobile, browser tests cover failures as well as success, and users still cannot cross workspace boundaries.

**Concept to explain:** how a button or filter becomes a GraphQL request, a database operation and an updated screen. Add one filter yourself to practise this path.

### M3 — Prepare the help library for search

**Goal:** give the system reliable documentation to retrieve.

**Steps:** let managers write/edit/archive articles → split articles into chunks → generate and store embeddings → implement similarity search and a keyword-search comparison → keep old or incomplete article indexes out of results.

**Ready when:** searches use current, fully indexed articles, retrying indexing does not duplicate data, and local/hosted embedding profiles never mix.

**Concept to explain:** why embedding a document makes meaning-based search possible, and why editing an article or changing embedding models requires updating its search data.

### M4 — Connect AI to the support workflow

**Goal:** make the AI features work inside the application.

**Steps:** implement local/hosted adapters → add summary and classification → retrieve documentation and draft cited replies → add controlled similar-ticket tool calling → handle limits, failures and repeated clicks → collect feedback and AI run information.

An **adapter** translates our application's common request into the format a particular provider expects.

**Ready when:** real local models complete the AI actions, sources and tool arguments are checked, and ordinary ticket work remains usable when AI fails. Hosted equivalents must pass before the public-demo milestone finishes.

**Concept to explain:** trace one reply from ticket to retrieval to prompt to validated answer. Trace one tool request through validation, database execution and the returned result.

### M5 — Measure whether it works well

**Goal:** produce honest evidence of quality, reliability and speed.

**Steps:** prepare and review questions reserved for testing → compare retrieval and answer approaches → review answers manually → repeat measurements → simulate traffic → measure one database improvement → check browser behaviour and accessibility.

A **held-out question** is saved for final testing instead of being used to adjust the system. A **baseline** is the simpler approach we compare against. **p95 latency** is the time within which 95% of measured requests finished.

**Ready when:** results can be reproduced, failures and sample counts are visible, and local/hosted/test-only results are clearly labelled.

**Concept to explain:** what each metric measures, what it is compared with and what its limits are. Resume numbers must come from these results.

### M6 — Put the full demo online for free

**Goal:** let someone use the complete website while the Mac and Ollama are off.

**Steps:** configure Vercel, Neon and Cloudflare → load hosted sample data and matching embeddings → secure manager access → enable isolated visitor demos → check quotas/storage → publish the evaluation report → test the live workflows.

**Ready when:** a fresh browser can manage tickets, generate a cited reply and make a real tool call within the free setup. Record first-request and repeat-request latency. Any unfinished hosted evaluation remains visibly pending.

**Concept to explain:** what runs in the browser, on Vercel, in Neon and on Cloudflare, and how limits affect availability.

### M7 — Automate checks and deployment

**Goal:** deploy changes only after the required checks pass.

**Steps:** run Jenkins locally → let it check GitHub for changes → install dependencies and run checks → deploy previews or production as appropriate → prove a failing test blocks release → practise returning to an earlier working deployment.

**Ready when:** successful and blocked releases are recorded, rollback works and pipeline timings are measured. Jenkins cannot run while its Mac is off.

**Concept to explain:** CI checks changes automatically; CD deploys changes after those checks pass. Explain a deliberately failed test using its Jenkins logs.

### M8 — Package the project so someone else can assess it

**Goal:** make the project easy to demonstrate, revise and discuss in interviews.

**Steps:** finish outstanding reviews → refresh screenshots → write demo instructions → reproduce key measurements → document limits → write measured resume bullets → practise explaining the architecture.

**Ready when:** features connect to tests and evidence, published reports contain no unexplained placeholders, and you can demonstrate and explain the work yourself.

**Concept to explain:** the problem, your design choices, one failure you fixed, the measured results and what you would improve next.

## M0 revision: what happened and why it matters

| What happened | Plain-language lesson |
|---|---|
| Qwen returned a valid response with the wrong category | Correct structure does not guarantee correct meaning. We clarified the category definitions. |
| Embeddings were much slower on the first request | Loading model weights into memory takes time. Later requests can reuse the loaded model. |
| We tested the tokenizer with networking blocked | The tokenizer files were truly local; a request did not depend on downloading them. |
| We checked tokenizer files inside the Vercel package | A file existing on a laptop does not automatically mean it will exist after deployment. |
| An unknown API URL initially returned the webpage | Frontend fallback routing was catching backend paths. We excluded the API paths. |
| Cloudflare returned incomplete tool text | Our output allowance was too small. Increasing it let the provider return the complete native tool call; we kept validation. |
| Both embedding models returned 768 numbers | Equal size lets us share a database column shape, but does not make the meaning maps interchangeable. |

The historical learning journal contains exact commands, versions, timings and troubleshooting details. Use this guide first for understanding, then consult that journal for evidence.

## Interview answers to practise

**What is Resolve?** “I am building a support workspace where agents manage tickets and use AI to summarise issues and draft replies grounded in help articles.”

**What did you build yourself?** “The project uses existing models. Our application code controls the user workflow, prompts, retrieval, permissions, validation, citations and tool execution.” Update this answer with completed implementation only; M0 currently proves capabilities.

**Why RAG?** “The model needs relevant product documentation. We retrieve passages first and supply them as evidence for its answer, then test whether that improves quality.”

**What does tool calling add?** “It lets the model request a controlled operation. Our backend validates the request and runs it with the signed-in user's permissions.”

**What can you claim today?** “M0 proved the selected local and free hosted components can support the planned features. The full product and its quality benchmarks still need implementation.”

## Which document should I open?

- **This guide:** understand and revise the project.
- **[STATUS.md](../STATUS.md):** see what is finished and the immediate next action.
- **[Learning journal](LEARNING-JOURNAL.md):** revisit what happened, what you changed and what was observed.
- **[Compatibility evidence](COMPATIBILITY.md):** inspect exact M0 versions and measurements.
- **[Implementation specification](07-IMPLEMENTATION.md):** check precise completion requirements while coding.

As each phase is completed, update its explanation with the real implementation, a short runnable example and the evidence observed. Future work must stay described as planned until it is done.
