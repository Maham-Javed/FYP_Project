# Backend Architecture & Structure

This document explains the organization, functionality, and connection logic of the Node.js / Express backend for the AI-Based Candidate Recruitment System.

---

## 1. Folder Structure

To ensure modularity and scalability, the backend follows an MVC-inspired Service-Controller architecture.

```text
backend/
├── src/
│   ├── app.js                        # Express application setup & route registration
│   ├── config/
│   │   └── supabase.js               # Supabase client initialization (anon + admin)
│   ├── controllers/
│   │   ├── application.controller.js # Application workflow (apply, status, rematch)
│   │   └── embedding.controller.js   # Embedding management (generate, check status)
│   ├── middlewares/
│   │   ├── auth.js                   # JWT verification & role-based access control
│   │   └── rateLimiter.js            # General API + AI-specific rate limits
│   ├── routes/
│   │   ├── application.routes.js     # /api/applications/* endpoints
│   │   ├── embedding.routes.js       # /api/embeddings/* endpoints
│   │   └── matching.routes.js        # /api/matching/* endpoints
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

### `routes/`
- **Purpose**: Defines the HTTP endpoints and maps them to specific controllers.
- **Rules**: No business logic is allowed here. Only route definitions and middleware chaining (e.g., Auth checks).
- **Route Groups**:
  - `application.routes.js` — Core application workflow (apply, status, recommendations)
  - `embedding.routes.js` — Explicit embedding management (generate, check readiness)
  - `matching.routes.js` — Batch re-matching and preview scores

### `controllers/`
- **Purpose**: Acts as the middleman between routes and services.
- **Rules**: 
  - Extracts parameters from `req.body` and `req.params`.
  - Validates inputs and ownership (candidate owns application, recruiter owns job).
  - Calls the corresponding function in the `services/` layer.
  - Returns structured HTTP responses (`res.status(200).json(...)`).
  - Does *not* write raw SQL or complex logic.
- **Files**:
  - `application.controller.js` — 7 endpoint handlers for the application workflow
  - `embedding.controller.js` — 3 endpoint handlers for embedding management

### `services/`
- **Purpose**: The core engine of the application. Contains all business rules, database calls, and AI integrations.
- **Rules**: 
  - Functions here should be reusable and decoupled from the Express `req/res` objects.
  - This layer communicates directly with Supabase and external APIs (HuggingFace, Groq).
- **Files**:
  - `embedding.service.js` — Generates vector embeddings via HuggingFace Inference API, stores them in pgvector columns, uses MD5 content hashing to avoid redundant API calls.
  - `matching.service.js` — Orchestrates the matching pipeline: ensures embeddings exist, calls the `match_candidate_to_job` Postgres function, evaluates thresholds, updates application status.
  - `aiService.js` — Interview AI logic (question generation, answer evaluation via LLM).

### `middlewares/`
- **Purpose**: Intercepts requests before they reach the controller.
- **Key Middlewares**:
  - `auth.js` (`verifyAuth`): Verifies the Supabase JWT token via `supabase.auth.getUser()`.
  - `auth.js` (`requireRole`): Ensures Candidates cannot hit Recruiter endpoints and vice-versa by checking `user_metadata.role`.
  - `rateLimiter.js` (`apiLimiter`): 100 requests per 15 minutes per IP (global).
  - `rateLimiter.js` (`aiLimiter`): 10 requests per 15 minutes per IP (AI-intensive endpoints only).

---

## 3. How the Backend Connects to Supabase

The backend uses the official `@supabase/supabase-js` SDK to communicate with the database securely. 

1. **Configuration (`config/supabase.js`)**:
   Two clients are initialized:
   - `supabase` (anon key): For user-scoped operations, respects RLS policies.
   - `supabaseAdmin` (service role key): For background AI processing that must bypass RLS (embedding storage, match score updates).
   
2. **Execution**:
   In the `services/` layer, queries are executed like so:
   ```javascript
   const { data, error } = await supabaseAdmin
       .from('jobs')
       .update({ job_embedding: vectorString, embedding_text_hash: hash })
       .eq('job_id', jobId);
   ```

3. **RPC Calls (Vector Operations)**:
   Postgres functions are called via Supabase RPC:
   ```javascript
   const { data, error } = await supabaseAdmin.rpc('match_candidate_to_job', {
       p_candidate_id: candidateId,
       p_job_id: jobId
   });
   ```

4. **Authentication Hand-off**:
   The frontend sends the Supabase JWT in the `Authorization` header. The backend `verifyAuth` middleware decodes it via `supabase.auth.getUser(token)` to validate the request before executing sensitive operations.

---

## 4. AI Service Architecture

The AI integrations are strictly encapsulated within the **`services/`** layer to maintain separation of concerns.

### 4a. Embedding Service (`services/embedding.service.js`)
- **Provider**: HuggingFace Inference API (free tier)
- **Model**: `BAAI/bge-small-en-v1.5` (384 dimensions)
- **Triggered when**:
  - Recruiter creates or updates a job posting
  - Candidate uploads or updates their CV
  - Candidate applies to a job (ensures both embeddings exist)
- **Key Features**:
  - Content-hash deduplication (MD5): skips API call if text unchanged
  - Retry logic with exponential backoff (handles 429 rate limits, 503 cold starts)
  - Text normalization pipeline (lowercase, collapse whitespace, remove non-semantic chars)

### 4b. Matching Service (`services/matching.service.js`)
- **Purpose**: Orchestrates the decision pipeline during job applications
- **Flow**:
  1. Calls `EmbeddingService.ensureEmbeddings()` to guarantee vectors exist
  2. Calls `match_candidate_to_job()` Postgres function for cosine similarity
  3. Compares result against recruiter's `similarity_threshold`
  4. Updates application status to `selected_for_interview` or `rejected`
  5. Stores `match_score`, `matched_at`, and `match_metadata`

### 4c. Interview AI (`services/aiService.js`)
- **Provider**: Groq API (for LLM inference)
- **Purpose**: Generates dynamic interview questions and evaluates candidate answers
- **Triggered via**: `POST /api/interviews/answer` route
- **Flow**: Formats a strict prompt → sends to LLM → parses JSON response → saves score and feedback

### Provider Separation
| Concern | Provider | Model | Why |
|---------|----------|-------|-----|
| **Embeddings** (vectors) | HuggingFace | `BAAI/bge-small-en-v1.5` | Free, 384d, production-quality |
| **LLM Inference** (chat) | Groq | LLM models | Fast inference, interview Q&A |

> **Note**: Groq does NOT provide embedding models. HuggingFace handles all vector generation.

---

## 5. Running the Backend

```bash
# Install dependencies
cd backend
npm install

# Production mode
npm start

# Development mode (auto-reload via nodemon)
npm run dev
```

The server starts on port 5000 by default (configured in `.env`).

---

## 6. Environment Variables

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project API URL |
| `SUPABASE_ANON_KEY` | Public anon key for user-scoped operations |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for background AI processing (bypasses RLS) |
| `PORT` | Server port (default: 5000) |
| `HF_API_TOKEN` | HuggingFace Inference API token for embedding generation |
| `GROQ_API_KEY` | Groq API key for LLM inference (interview AI) |

---

## 7. Update Rules

> **IMPORTANT: Auto-Update Mechanism**
> Whenever the backend architecture is modified:
> 1. If a new architectural layer is added (e.g., `crons/`, `workers/`), update the **Folder Structure** and **Directory Breakdown**.
> 2. If the connection method to Supabase changes (e.g., moving to GraphQL or raw pg routing), update the **Supabase Connection** section.
> 3. If a new AI provider replaces HuggingFace or Groq, document the shift in the **AI Service Architecture** section.
> 4. If new routes or controllers are added, update the **Folder Structure** tree.
> 
> *This documentation ensures new backend developers can immediately understand the data flow.*
