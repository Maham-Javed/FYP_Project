# Tools and Technologies

This document outlines the core technology stack used in the AI-Based Candidate Recruitment System. It provides clear justifications for each tool's selection to assist developers and serve as reference material for FYP (Final Year Project) vivas.

---

## 1. Supabase (Database & Authentication)

- **Role**: Primary Database (PostgreSQL), Auth Provider, and Vector Store.
- **Why it is used**:
  - **All-in-One Backend-as-a-Service**: Provides instant REST APIs, WebSockets for real-time updates, and highly secure JWT-based authentication without requiring us to build auth flows from scratch.
  - **pgvector Support**: Crucially, Supabase supports the Postgres `pgvector` extension natively. This is mandatory for storing AI embeddings and calculating cosine-similarity for our candidate matching engine.
- **Alternatives Considered**: Firebase, MongoDB, raw AWS RDS.
- **Justification for Viva**: Firebase is a NoSQL store which struggles with complex relational data (like candidates applying to jobs, taking interviews, and answering specific questions). MongoDB does not have built-in relational integrity. We chose Supabase because it gives us the robustness of standard SQL (Postgres), the ease of Firebase, and the native vector database capabilities required for our AI features.

---

## 2. React (Frontend)

- **Role**: User Interface and Client-Side Application.
- **Why it is used**:
  - Component-based architecture allows us to build reusable UI elements (e.g., Job Cards, Interview Timers).
  - Virtual DOM ensures high performance during dynamic updates, such as when the AI interview timer ticks or new questions load.
- **Alternatives Considered**: Vue.js, Angular, plain HTML/Vanilla JS.
- **Justification for Viva**: React is the industry standard for Single Page Applications (SPAs). It has a massive ecosystem, making it easier to integrate complex libraries (like Markdown renderers or specific charts for candidate scores). Compared to Vanilla JS, it vastly reduces UI bugs related to state mismanagement during the complex AI interview workflow.

---

## 3. Node.js with Express (Backend)

- **Role**: Custom API Server and AI Orchestrator.
- **Why it is used**:
  - Highly scalable asynchronous architecture (Event Loop), perfect for handling multiple concurrent candidates taking AI interviews simultaneously.
  - Uses JavaScript, allowing for a unified language across the entire stack (Frontend + Backend).
- **Alternatives Considered**: Python (Django/FastAPI), Java (Spring Boot).
- **Justification for Viva**: While Python is often preferred for AI, our system offloads the heaviest AI computation to external APIs (OpenAI/GPT) and Supabase (vector math). Node.js acts purely as a fast, asynchronous orchestrator. By using Node.js, we maintain stack uniformity (JavaScript end-to-end), significantly accelerating development speed and reducing context switching.

---

## 4. Groq API / LLM Engine (Active Integration)

- **Role**: Dynamic Interviewer and Answer Evaluator.
- **Why it is used**:
  - Traditional systems use hardcoded questions and exact-match string checks, which are rigid and easily bypassed. 
  - Groq LLMs (like `llama-3.3-70b-versatile` or `mixtral-8x7b-32768`) dynamically generate domain-specific questions based on the candidate's resume and candidate performance, scoring technical answers by understanding semantic context.
- **Alternatives Considered**: Dialogflow, traditional rule-based chatbots.
- **Justification for Viva**: Rule-based bots cannot gauge the "quality" or "depth" of an answer. If a candidate explains a concept using different phrasing than expected, a rule-based bot fails them. Groq provides ultra-fast LLM inference, allowing an adaptive, human-like evaluation critical for real-time interactive interview systems.

---

## 5. Zod (Declarative Schema & Environment Validation)

- **Role**: Backend Payload Boundary Security and Boot-Time Configuration Validation.
- **Why it is used**:
  - Validates client-submitted payloads at the Express route layer before reaching database layers.
  - Parses and validates system environment variables (`process.env`) instantly at server boot, preventing silent configuration crashes.
- **Alternatives Considered**: Joi, express-validator, manual boot checks.
- **Justification for Viva**: Cluttering business logic with manual type or URL checks is anti-pattern. Zod handles validations declaratively, guaranteeing runtime type-safety for both routes and environment keys while supplying unified parsing failure schemas.

---

## 6. Vite Route Code-Splitting (React.lazy / Suspense)

- **Role**: Frontend Bundle Optimization & User Experience.
- **Why it is used**:
  - Compiles route entrypoints into split, dynamic, asynchronous javascript chunks.
  - Defers dashboard loads until navigated, decreasing initial loading footprint.
- **Alternatives Considered**: Monolithic static imports.
- **Justification for Viva**: Compiling single monolithic frontend bundles results in long initial load delays. Dynamic chunks defer load weights, yielding sub-second initial load speeds while maintaining high-performance dark-theme transitional screens.

---

## 7. React Error Boundary Component (UI Resiliency)

- **Role**: Frontend Route Fault Tolerance & Crash Recovery.
- **Why it is used**:
  - Captures runtime errors or route asset load failures (such as internet dropping during dynamic route load).
  - Renders a gorgeous glassmorphic fallback screen with micro-animations and a manual reload trigger, preventing blank screens or system hangs.
- **Alternatives Considered**: Raw browser crashes (blank tab screens).
- **Justification for Viva**: In highly dynamic apps utilizing lazy-loaded routing, any asset loading block breaks React's render tree. An Error Boundary protects the client runtime, ensuring complete system recovery and professional UX even under network failures.

---

## 8. Pl/pgSQL Atomic Transactions (Supabase RPCs)

- **Role**: Database Transactional Integrity & State Atomicity.
- **Why it is used**:
  - Groups sequential database writes (e.g. creating an interview + changing application status; completing interview + accepting/rejecting application) into single SQL functions.
  - Executes atomically on Postgres, guaranteeing database rollbacks if intermediate writes fail.
- **Alternatives Considered**: Sequential client-side await updates.
- **Justification for Viva**: Executing sequential writes across separate REST connections runs high risks of partial database updates if internet connection drops midway. Moving these writes into database-level SQL RPCs (`start_interview_atomic`, `finalize_interview_atomic`) maintains perfect transaction consistency (ACID principles).

---

## 9. Custom high-resolution hrtime Logger (Performance Auditing)

- **Role**: Microsecond API Performance Tracking.
- **Why it is used**:
  - Tracks server request execution cycles and latency down to precise fractions of a millisecond.
  - Generates colored terminal status logs for fast debugging.
- **Alternatives Considered**: Morgan middleware, standard `console.log`.
- **Justification for Viva**: Standard loggers can slow down event loops or rely on heavy external dependencies. A custom zero-dependency `process.hrtime` middleware gives us exact performance measurements at no cost, allowing recruiters to visually verify the speed of AI integrations.

---

## Update Rules

> **IMPORTANT: Auto-Update Mechanism**
> Whenever a new significant technology or library is adopted:
> 1. Add it as a new numbered section in this document.
> 2. Detail its **Role** and **Why it is used**.
> 3. Provide **Alternatives Considered** and a strong **Justification** for why it beat the alternatives.
> 
> *This file must remain up to date to ensure all team members can technically defend the system's architectural choices.*
