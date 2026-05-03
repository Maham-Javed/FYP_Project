# Backend Architecture & Structure

This document explains the organization, functionality, and connection logic of the Node.js / Express backend for the AI-Based Candidate Recruitment System.

---

## 1. Folder Structure

To ensure modularity and scalability, the backend follows an MVC-inspired Service-Controller architecture.

```text
backend/
├── src/
│   ├── app.js               # Express application setup
│   ├── config/              # Configuration files (Supabase setup, Env vars)
│   ├── controllers/         # Request handlers and response formatting
│   ├── middlewares/         # JWT Verification, Error Handling, Role validation
│   ├── routes/              # Express routing layer
│   ├── services/            # Core business logic and AI orchestration
│   └── utils/               # Helper functions (Loggers, Data formatters)
├── .env                     # Environment variables
├── package.json             # Project dependencies
└── server.js                # Server entry point
```

---

## 2. Directory Breakdown

### `routes/`
- **Purpose**: Defines the HTTP endpoints and maps them to specific controllers.
- **Rules**: No business logic is allowed here. Only route definitions and middleware chaining (e.g., Auth checks).
- **Example**: `router.post('/jobs', authMiddleware, requireRole('recruiter'), jobController.createJob)`

### `controllers/`
- **Purpose**: Acts as the middleman between routes and services.
- **Rules**: 
  - Extracts parameters from `req.body` and `req.params`.
  - Calls the corresponding function in the `services/` layer.
  - Returns structured HTTP responses (`res.status(200).json(...)`).
  - Does *not* write raw SQL or complex logic.

### `services/`
- **Purpose**: The core engine of the application. Contains all business rules, database calls, and AI integrations.
- **Rules**: 
  - Functions here should be reusable and decoupled from the Express `req/res` objects.
  - This layer communicates directly with Supabase and external APIs (like OpenAI).
- **Example**: `const createJob = async (jobData) => { ... // Calls Supabase to insert row }`

### `middlewares/`
- **Purpose**: Intercepts requests before they reach the controller.
- **Key Middlewares**:
  - `authMiddleware.js`: Verifies the Supabase JWT token.
  - `roleMiddleware.js`: Ensures Candidates cannot hit Recruiter endpoints and vice-versa.
  - `errorHandler.js`: Catches errors universally and formats the error JSON response.

---

## 3. How the Backend Connects to Supabase

The backend uses the official `@supabase/supabase-js` SDK to communicate with the database securely. 

1. **Configuration (`config/supabaseClient.js`)**:
   We initialize the client using the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `ANON_KEY` if relying entirely on user JWTs).
   
2. **Execution**:
   In the `services/` layer, queries are executed like so:
   ```javascript
   const { data, error } = await supabase
       .from('jobs')
       .insert([{ title: 'Dev', required_skill: 'Node' }]);
   ```

3. **Authentication Hand-off**:
   Because Supabase manages JWTs securely, the frontend sends the token in the `Authorization` header. Our backend `authMiddleware` decodes it via Supabase to ensure the request is valid before executing sensitive database writes.

---

## 4. Where AI Logic Will Be Added

The AI integrations are strictly encapsulated within the **`services/`** layer to maintain separation of concerns.

1. **AI Matching Engine (`services/matchingService.js`)**:
   - Triggered when a Candidate uploads a resume or views a job.
   - Extracts text, converts it to vectors (embeddings), and calls Supabase `pgvector` to run a similarity search against `job_embedding`.
   
2. **GPT Interview Module (`services/aiService.js`)**:
   - Triggered via the `POST /api/interviews/answer` route.
   - Accepts the candidate's answer and the question text.
   - Formats a strict prompt for the LLM (e.g., OpenAI API).
   - Parses the LLM's JSON response containing the `score` and `ai_feedback` to save back into Supabase.

---

## 5. Update Rules

> **IMPORTANT: Auto-Update Mechanism**
> Whenever the backend architecture is modified:
> 1. If a new architectural layer is added (e.g., `crons/`, `workers/`), update the **Folder Structure** and **Directory Breakdown**.
> 2. If the connection method to Supabase changes (e.g., moving to GraphQL or raw pg routing), update the **Supabase Connection** section.
> 3. If a new AI provider (e.g., Claude, local LLM) replaces GPT, document the shift in the **AI Logic** section.
> 
> *This documentation ensures new backend developers can immediately understand the data flow.*
