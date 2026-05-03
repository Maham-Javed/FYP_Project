# API Documentation

This document outlines the core backend API endpoints for the AI-Based Candidate Recruitment System. All endpoints (except public/auth routes) require a valid Supabase JWT in the `Authorization` header.

---

## 1. Authentication & Users

### POST `/api/auth/register`
- **Method**: POST
- **Description**: Registers a new user (Candidate or Recruiter).
- **Role**: Public
- **Request Format**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "role": "candidate", // or "recruiter"
    "name": "John Doe",
    "company_name": "" // Only required for recruiters
  }
  ```
- **Response Format**:
  ```json
  {
    "user": { "id": "uuid", "role": "candidate" },
    "token": "jwt_token"
  }
  ```

---

## 2. Jobs Management

### POST `/api/jobs`
- **Method**: POST
- **Description**: Creates a new job posting.
- **Role**: Recruiter only
- **Request Format**:
  ```json
  {
    "title": "Software Engineer",
    "description": "Develop scalable systems...",
    "required_skill": "React, Node.js",
    "experience_level": "Mid",
    "location": "Remote",
    "qualification": "Bachelors",
    "positions": 3,
    "interview_difficulty": "Medium",
    "passing_threshold": 70
  }
  ```
- **Response Format**:
  ```json
  {
    "job_id": "uuid",
    "message": "Job created successfully"
  }
  ```

### GET `/api/jobs`
- **Method**: GET
- **Description**: Retrieves a list of available jobs.
- **Role**: Candidate / Recruiter (Recruiters see only their own jobs, Candidates see all open jobs).
- **Request Format**: None (Optional query params like `?experience_level=Mid`)
- **Response Format**:
  ```json
  [
    {
      "job_id": "uuid",
      "title": "Software Engineer",
      "location": "Remote"
      // ...other details
    }
  ]
  ```

### GET `/api/jobs/:id`
- **Method**: GET
- **Description**: Get details of a specific job.
- **Role**: Both
- **Request Format**: URL Parameter `id`
- **Response Format**: Job Object JSON.

---

## 3. Application Workflow

### POST `/api/applications`
- **Method**: POST
- **Description**: Submits an application for a specific job.
- **Role**: Candidate only
- **Request Format**:
  ```json
  {
    "job_id": "uuid"
  }
  ```
- **Response Format**:
  ```json
  {
    "application_id": "uuid",
    "status": "pending",
    "message": "Application submitted successfully"
  }
  ```

### GET `/api/applications`
- **Method**: GET
- **Description**: Lists applications. Candidates see their applied jobs. Recruiters see candidates applied to their jobs.
- **Role**: Both
- **Request Format**: None
- **Response Format**: Array of Application Objects.

### PATCH `/api/applications/:id/status`
- **Method**: PATCH
- **Description**: Updates application status (e.g., Reject or Accept).
- **Role**: Recruiter only
- **Request Format**:
  ```json
  {
    "status": "rejected" // 'accepted', 'interviewing', 'rejected'
  }
  ```
- **Response Format**: Success status message.

---

## 4. AI Interview System

### POST `/api/interviews/init`
- **Method**: POST
- **Description**: Initializes the AI interview session for an application.
- **Role**: Candidate only
- **Request Format**:
  ```json
  {
    "application_id": "uuid"
  }
  ```
- **Response Format**:
  ```json
  {
    "interview_id": "uuid",
    "status": "in_progress"
  }
  ```

### GET `/api/interviews/:id/question`
- **Method**: GET
- **Description**: Generates and fetches the next dynamic interview question using the GPT engine.
- **Role**: Candidate only
- **Request Format**: URL parameter `id` (Interview ID)
- **Response Format**:
  ```json
  {
    "question_id": "uuid",
    "question_text": "How does Node.js handle asynchronous operations?",
    "sequence_number": 1
  }
  ```

### POST `/api/interviews/answer`
- **Method**: POST
- **Description**: Submits an answer to the current question for AI evaluation.
- **Role**: Candidate only
- **Request Format**:
  ```json
  {
    "question_id": "uuid",
    "candidate_response": "Node uses the event loop...",
    "time_taken_seconds": 45
  }
  ```
- **Response Format**:
  ```json
  {
    "score": 85,
    "ai_feedback": "Good answer. Mentioning libuv would make it better.",
    "next_action": "continue" // or "complete"
  }
  ```

### GET `/api/interviews/:id/results`
- **Method**: GET
- **Description**: Fetches final scores and result of the interview.
- **Role**: Candidate / Recruiter
- **Request Format**: URL parameter `id`
- **Response Format**:
  ```json
  {
    "interview_id": "uuid",
    "total_score": 260,
    "result": "pass",
    "details": [ /* List of questions and scores */ ]
  }
  ```

---

## Update Rules

> **IMPORTANT: Auto-Update Mechanism**
> Whenever a new feature or API is built in the `backend/src/routes` directory:
> 1. Add the new endpoint to the respective section (or create a new section).
> 2. Clearly define the **Method**, **Endpoint**, and **Description**.
> 3. Document the expected **Request/Response JSON format**.
> 4. Specify the required **Role** to avoid security loopholes.
> 
> *Ensure the Frontend dev team is notified whenever this document changes.*
