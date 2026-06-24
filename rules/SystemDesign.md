# System Design & Architecture

## A. High-Level Architecture
The AI-Based Candidate Recruitment System follows a modern, scalable **Three-Tier Architecture** with integrated AI service modules. This decouples the user interface, business logic, and data layers. In this refactored structure, a dedicated **Repository Layer** abstracts all direct database interactions, keeping controllers highly modular.

```mermaid
flowchart TD
    subgraph Client ["Frontend Layer"]
        UI[React Application]
        EB[React Error Boundary]
        LS[React.lazy & Suspense Loader]
        
        UI --> EB
        EB --> LS
    end

    subgraph API ["Backend Layer"]
        EnvV[Env Validator Zod]
        Node["Node.js / Express Server"]
        
        EnvV -->|Boot-Time check| Node
        
        subgraph Middlewares ["Validation, Exception & Logging Layer"]
            AL[API Performance Logger]
            Zod["Zod Payload Validator"]
            GE["Global Error Handler"]
        end
        subgraph Services ["Service Layer"]
            ES["EmbeddingService<br/>(HuggingFace)"]
            MS["MatchingService<br/>(pgvector cosine)"]
            AIS["AIService<br/>(Groq LLM)"]
        end
        subgraph Repositories ["Data Access Layer (Repository)"]
            IR["InterviewRepository"]
            RPC["PL/pgSQL RPC Transactions<br/>(start_interview_atomic / finalize_interview_atomic)"]
        end
    end

    subgraph External ["External AI Providers"]
        HF["HuggingFace Inference API<br/>BAAI/bge-small-en-v1.5"]
        Groq["Groq API<br/>LLM Inference"]
    end

    subgraph Data ["Database & Auth Store"]
        Supa["Supabase PostgreSQL"]
        PGV["pgvector Extension<br/>HNSW Indexes"]
        Auth["Supabase Auth<br/>JWT Management"]
    end

    LS <-->|REST API JSON| Node
    LS <-->|Direct Auth| Auth
    Node <--> Middlewares
    Middlewares <--> Services
    Node <--> Repositories
    Services <--> Repositories
    IR --> RPC
    
    ES <-->|REST POST| HF
    AIS <-->|REST POST| Groq
    
    RPC <-->|Atomic ACID Queries| Supa
    IR <-->|Store/Fetch Vectors| PGV
    MS <-->|RPC Cosine Similarity| PGV
    IR <-->|CRUD Operations| Supa
    Auth <-->|Session Verification| Node
```

---

## B. Component Breakdown

### 1. Frontend (React with Vite)
- **Responsibility**: Handles user interaction, state management, and view rendering.
- **Key Features**: 
  - Role-based dynamic dashboards for Candidates and Recruiters.
  - Interactive job application and interview UI.
  - **Dynamic Route Code-Splitting**: Pages are lazy-loaded via `React.lazy` and wrapped in a premium dark-mode, glassmorphic loading screen utilizing dynamic conic-spin animations to minimize initial bundle sizes.
  - **Resilient React Error Boundary**: Integrates custom Error Boundary wrappers targeting route failure chunks (caused by patchy networks or sudden disconnections) and client crashes, providing high-quality visual fallbacks and immediate reload recovery prompts.

### 2. Backend Layer (Express)
- **Responsibility**: Orchestrates API workflows, validates configurations, records audits, sanitizes request parameters, and handles runtime failures.
- **Key Features**:
  - **Boot-Time Environment Variable Validator**: Restricts boot-up sequences using a declarative Zod env schema to check type-safety and formatting on all critical API keys and URLs, outputting clear, detailed errors and exit codes on missing fields.
  - **Custom performance-hrtime Request Logger**: Seamlessly intercepts Express requests to track performance down to microsecond decimals via `process.hrtime`, logging styled status codes in terminal.
  - **Zod Declarative Validation**: Intercepts payloads at the route layer, protecting logic from invalid or malformed data schemas.
  - **Global Error Handling**: Express middleware intercepts all thrown operational errors (`BadRequestError`, `ForbiddenError`, `NotFoundError`), responding to the client with unified, standard structures.

### 3. Repository Layer (Data Access Isolation)
- **Responsibility**: Encapsulates all query commands, mutations, stored procedure executions, and Supabase database interactions.
- **Key Features**:
  - Exposes 16 clean repository methods to the controller layer.
  - **PL/pgSQL Stored Procedure RPC Transactions**: Moves sequential client-side database awaits into secure, single Postgres transactional SQL procedures (`start_interview_atomic`, `finalize_interview_atomic`), safeguarding ACID guarantees.
  - Completely separates direct SQL/Supabase operations from REST controllers.

### 4. AI Service Layer
- **Embedding Service**: Generates dense 384-dimensional vector embeddings locally using `@xenova/transformers` (`Xenova/bge-small-en-v1.5`), eliminating API latency. Implements content-hashing (MD5) to avoid redundant CPU operations, and is pre-warmed on server boot.
- **Matching Engine**: Coordinates cosine similarity via Postgres pgvector operators, automatically updating application workflow flags.
- **Interview AI (Groq API)**: Orchestrates adaptive question prompts and parses technical feedback scores using fast LLM inference engines, backed by offline deterministic algorithms during outages.

---

## C. Data Flow Diagrams

### AI Matching Pipeline (Candidate Applies to Job)
```mermaid
sequenceDiagram
    participant C as Candidate (React)
    participant B as Backend (Express)
    participant ES as EmbeddingService
    participant HF as HuggingFace API
    participant MS as MatchingService
    participant DB as Supabase Postgres

    C->>B: POST /api/applications/apply { job_id }
    B->>B: Validate JWT, role, ownership, duplicates
    B->>DB: INSERT application (status: pending)
    B->>MS: processApplicationMatch()

    MS->>ES: ensureEmbeddings(jobId, candidateId)
    ES->>DB: Check embedding_text_hash
    
    alt Hash changed or missing
        ES->>DB: Fetch job/profile text
        ES->>ES: normalizeText() -> hashText()
        ES->>ES: local Xenova Model(bge-small-en-v1.5)
        ES->>DB: UPDATE embedding + hash
    else Hash unchanged
        ES-->>MS: cached: true
    end

    MS->>DB: RPC match_candidate_to_job()
    DB-->>MS: { similarity_percentage, meets_threshold }

    alt score >= threshold
        MS->>DB: UPDATE status = selected_for_interview
        MS-->>B: { status: selected_for_interview, score: 78.45 }
    else score < threshold
        MS->>DB: UPDATE status = rejected
        MS-->>B: { status: rejected, score: 45.30 }
    end

    B-->>C: 201 { application, match result }
```

### Dynamic Interview Pipeline (With Repository, Atomic RPCs, and Error Boundary)
```mermaid
sequenceDiagram
    participant C as Candidate (Frontend)
    participant EB as ErrorBoundary
    participant L as Performance Logger
    participant B as Controller (Express)
    participant R as Repository Layer
    participant RPC as Postgres RPC (PL/pgSQL)
    participant AI as Groq API
    participant DB as Supabase DB

    Note over C: Boot Zod Env Check complete
    C->>EB: Render page route
    EB->>C: Render active view
    
    C->>L: POST /api/interviews/start { application_id }
    L->>B: Forward Request (Timer start)
    Note over B: Zod Schema Validation
    B->>R: resolveCandidateId(userId)
    R-->>B: candidateId
    B->>R: getApplicationAndJob(applicationId, candidateId)
    R-->>B: application details
    
    B->>B: Check status & duplicates
    
    B->>R: startInterviewAtomic(appId, initialDifficulty)
    R->>RPC: rpc('start_interview_atomic')
    RPC->>DB: INSERT interview & UPDATE status (Atomic)
    DB-->>R: Return transaction status
    R-->>B: Saved interview details
    
    B->>AI: Request Dynamic Question (Seq 1)
    AI-->>B: Question object (text & keywords)
    B->>R: saveGeneratedQuestion(interviewId, question)
    R-->>B: Saved question
    B-->>L: Return 201 Response
    L-->>C: Forward 201 Response (Log Method, Status, Latency in ms)
```

---

## D. Separation of Concerns

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Routing** | Directs HTTP traffic. Chains Zod validation and Auth middlewares. | `router.post('/start', verifyAuth, requireRole('candidate'), validate(startInterviewSchema), controller.startInterview)` |
| **Middlewares** | Validates payloads, handles authentication tokens, and formats global errors. | `validate(schema)` parses input bodies; `globalErrorHandler` catches thrown custom exceptions. |
| **Controller** | Processes endpoints, delegates queries to repositories, coordinates services, returns responses. | `InterviewController.startInterview()` — slim methods without try/catch boilerplate. |
| **Repository** | Pure database CRUD execution. Communicates directly with Supabase Postgres. | `InterviewRepository.createInterview(appId, initialDifficulty)` |
| **Service** | Handles business logic (Hashing, prompt-formatting, external LLM calls). | `AIService.getNextQuestion(title, difficulty, topic)` |

---

## E. Performance Optimizations

| Optimization | Implementation |
|-------------|---------------|
| **Vite Code Splitting** | `React.lazy()` dynamically compiles route chunks to avoid rendering heavy initial bundles. |
| **Glassmorphic Suspense** | Sleek animated spinners themed to Xenon's dark mode aesthetics run during dynamic route transitions. |
| **React Error Boundary** | Catches dynamic asset loading failures and renders a premium recovery window. |
| **Zod Boot Env Validator** | Ensures no missing configs or invalid API credentials trigger cryptic server failures. |
| **hrtime Performance Logger** | In-house microsecond request audit tracker mapping request pipeline latency. |
| **Atomic SQL Transactions** | Encapsulates sequential mutations inside PG pl/pgsql functions to guarantee database consistency. |
| **Embedding Deduplication & Pre-warming** | MD5 content hashing combined with boot-time pre-warming guarantees 0 API latency and saves CPU cycles. |
| **HNSW Indexes** | Sub-linear vector search on both `job_embedding` and `profile_embedding` using HNSW graphs. |
| **Pre-generated Embeddings** | Embeddings generated when jobs are created/updated, not during application. |
| **Cached Vectors** | During application, stored embeddings are reused — no API call needed. |

---

## F. Update Rules

> **IMPORTANT: Auto-Update Mechanism**
> Whenever the architecture changes:
> 1. Update the **High-Level Architecture** diagram to visually represent the new node.
> 2. Document the new layer under the **Separation of Concerns** matrix.
> 3. Add any new data caching or load optimization techniques to Section E.
