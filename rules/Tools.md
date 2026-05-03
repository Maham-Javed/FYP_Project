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

## 4. GPT Engine / Large Language Model (Planned)

- **Role**: Dynamic Interviewer and Answer Evaluator.
- **Why it is used**:
  - Traditional systems use hardcoded questions and exact-match string checks, which are rigid and easily bypassed. 
  - An LLM (like OpenAI's GPT-3.5/4) can dynamically generate domain-specific questions based on the candidate's resume and accurately score open-ended technical answers by understanding semantic context.
- **Alternatives Considered**: Dialogflow, traditional rule-based chatbots.
- **Justification for Viva**: Rule-based bots cannot gauge the "quality" or "depth" of an answer. If a candidate explains a concept using different phrasing than expected, a rule-based bot fails them. GPT understands natural language semantics, providing an adaptive, human-like evaluation critical for an "AI-Based" Recruitment System.

---

## Update Rules

> **IMPORTANT: Auto-Update Mechanism**
> Whenever a new significant technology or library is adopted:
> 1. Add it as a new numbered section in this document.
> 2. Detail its **Role** and **Why it is used**.
> 3. Provide **Alternatives Considered** and a strong **Justification** for why it beat the alternatives.
> 
> *This file must remain up to date to ensure all team members can technically defend the system's architectural choices.*
