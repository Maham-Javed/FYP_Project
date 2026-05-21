# Backend Architecture & Structure

This document explains the organization, functionality, and connection logic of the Node.js / Express backend for the AI-Based Candidate Recruitment System.

---

## 1. Folder Structure

To ensure modularity and scalability, the backend follows a decoupled **Service-Repository-Controller** architecture.

```text
backend/
├── src/
│   ├── app.js                        # Express application setup & global error registration
│   ├── config/
│   │   ├── env.js                    # Boot-time Zod environment validator (New)
│   │   └── supabase.js               # Supabase client initialization (anon + admin)
│   ├── controllers/
│   │   ├── application.controller.js # Application workflow (apply, status, rematch)
│   │   ├── embedding.controller.js   # Embedding management (generate, check status)
│   │   └── interview.controller.js   # Request dispatcher and controller (Refactored)
│   ├── middlewares/
│   │   ├── auth.js                   # JWT verification & role-based access control
│   │   ├── rateLimiter.js            # General API + AI-specific rate limits
│   │   ├── errorHandler.js           # Express global error handler & HTTP exceptions (New)
│   │   ├── logger.js                 # Microsecond-precision hrtime performance logger (New)
│   │   └── validate.js               # Generic Zod validation middleware (New)
│   ├── repositories/                 # Supabase query abstraction layer (New)
│   │   └── interview.repository.js   # 16-method decoupled DB operations repository
│   ├── routes/
│   │   ├── application.routes.js     # /api/applications/* endpoints
│   │   ├── embedding.routes.js       # /api/embeddings/* endpoints
│   │   ├── matching.routes.js        # /api/matching/* endpoints
│   │   ├── interview.routes.js       # Secured candidate interview endpoints
│   │   └── interview.validation.js   # Declarative Zod schemas (New)
│   ├── services/
│   │   ├── aiService.js              # Interview AI (question generation, answer evaluation)
│   │   ├── embedding.service.js      # Vector embedding generation & storage (HuggingFace)
│   │   └── matching.service.js       # Semantic similarity engine & threshold logic
│   └── utils/
│       ├── llmClient.js              # LLM provider wrapper (Groq/OpenAI)
│       └── prompts/                  # Interview prompt templates
│           └── interviewPrompts.js
├── .env                              # Environment variables
├── package.json                      # Dependencies & scripts
└── server.js                         # Server entry point
```

---

## 2. Directory Breakdown

### `config/`
- **Purpose**: Server and third-party configuration files.
- **Key Modules**:
  - `env.js`: Fast Zod validation of `process.env` immediately at boot. Halts startup on incorrect or missing keys.
  - `supabase.js`: Exports Supabase `supabaseAnon` and `supabaseAdmin` clients.

### `routes/`
- **Purpose**: Defines the HTTP endpoints, chains verification middlewares, and applies validation schemas.
- **Rules**: No business logic or input parsing is allowed here.
- **Payload Boundaries**: Route definitions register explicit Zod schemas inside `interview.validation.js` using the generic `validate` middleware to parse client inputs before hitting controllers.

### `middlewares/`
- **Purpose**: Intercepts requests to enforce security, perform schema validations, track performance, and handle operational errors.
- **Key Middlewares**:
  - `auth.js` (`verifyAuth` / `requireRole`): Decodes Supabase JWT tokens and verifies candidate or recruiter roles.
  - `validate.js`: Parses client payloads against Zod validation definitions, rejecting malformed requests immediately with a 400 status.
  - `errorHandler.js`: The Express Global Error Handler. It catches operational exceptions and formats standard JSON responses.
  - `logger.js`: Custom lightweight middleware tracking request pipelines down to microsecond latency using `process.hrtime`, logging colorized terminal status codes.
  - `rateLimiter.js`: Protects AI-intensive endpoints from API abuse.

### `controllers/`
- **Purpose**: Acts as the dispatcher layer handling incoming REST requests.
- **Rules**:
  - Extracts parameters and delegates database operations immediately to the `repositories/` layer.
  - Coordinates complex flows using the `services/` layer.
  - **Zero Boilerplate**: Controllers do not contain `try/catch` wrappers or inline database logic. Any error is forwarded via `next(err)` to be processed globally.

### `repositories/` (Repository Pattern)
- **Purpose**: Decouples active database operations from controller classes.
- **Rules**:
  - Contains all direct database queries, mutations, insertions, and SDK interaction logic.
  - Simplifies testing and keeps controllers slim, clean, and database-agnostic.
  - `interview.repository.js` isolates 16 distinct database operations for complete separation of concerns.

### `services/`
- **Purpose**: Renders computational business rules and coordinates external API calls (Groq, HuggingFace).
- **Rules**:
  - Encapsulates isolated algorithms such as text hashing (MD5), exponential retry loops, LLM prompt formatting, and matching threshold checks.

---

## 3. Data Integration Patterns

### 3a. Centralized HTTP Exceptions
To secure clean and descriptive client error messaging, the system implements sub-classed HTTP Operational Errors defined inside `middlewares/errorHandler.js`:
* `AppError`: Base class formatting stacktraces and operational tags.
* `BadRequestError` (400): Standard code for invalid actions or parameters.
* `UnauthorizedError` (401): Missing or failed JWT tokens.
* `ForbiddenError` (403): Accessing a resource without proper roles.
* `NotFoundError` (404): Resource not found in Supabase.

### 3b. Repository Pattern Integration
Database interactions are isolated within the Repository class:
```javascript
// backend/src/repositories/interview.repository.js
static async getApplicationAndJob(applicationId, candidateId) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select(`
      application_id,
      candidate_id,
      status,
      jobs (job_id, title, passing_threshold)
    `)
    .eq('application_id', applicationId)
    .eq('candidate_id', candidateId)
    .single();

  if (error) return null;
  return data;
}
```

### 3c. Atomic Database Transactions (Supabase RPCs)
Multi-step writes are executed atomically inside the database using PL/pgSQL database-level functions:
* `start_interview_atomic`: Inserts a new row into the `interviews` table and updates the status of the corresponding application to `interviewing` in a single atomic transaction.
* `finalize_interview_atomic`: Updates the status of the interview to `completed`, records final metrics, and updates the application status (`accepted` or `rejected`) atomically.

These database stored procedures are invoked using Supabase RPC method wrapper functions within the repository class:
```javascript
// backend/src/repositories/interview.repository.js
static async startInterviewAtomic(applicationId, initialDifficulty) {
  const { data, error } = await supabaseAdmin
    .rpc('start_interview_atomic', {
      p_application_id: applicationId,
      p_initial_difficulty: initialDifficulty
    })
    .single();

  if (error) throw new Error(`Failed to atomically start interview: ${error.message}`);
  return data;
}
```

---

## 4. AI Service Architecture

The AI integrations are strictly encapsulated within the **`services/`** layer to maintain separation of concerns.

### 4a. Embedding Service (`services/embedding.service.js`)
- **Model**: `BAAI/bge-small-en-v1.5` (384 dimensions)
- **Features**: MD5 text content hashing, caching layers, and exponential backoff loops protecting against API rate-limits.

### 4b. Matching Service (`services/matching.service.js`)
- **Algorithm**: Cosine similarity via pgvector's `<=>` operator.
- **Purpose**: Computes vector distance on postgres, updates status automatically, and records decision metadata.

### 4c. Interview AI (`services/aiService.js`)
- **Provider**: Groq API (LLM inference)
- **Purpose**: Renders dynamic prompt parameters, executes adaptive interview question selection, and evaluates answers.

---

## 5. Running the Backend

```bash
# Install dependencies
cd backend
npm install

# Start in Development mode (includes watch routines)
npm run dev
```

---

## 6. Update Rules

> **IMPORTANT: Auto-Update Mechanism**
> Whenever the backend architecture is modified:
> 1. If a new architectural layer is added (e.g., repositories, crons), update the **Folder Structure** and **Directory Breakdown**.
> 2. Document any new middlewares or global error handlers in Section 3a.
> 3. Document new repository classes and database query models in Section 3b.
> 4. Keep this file updated to assure compliance with team structural principles.
