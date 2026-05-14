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
    "role": "candidate",
    "name": "John Doe",
    "company_name": ""
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
    "passing_threshold": 70,
    "similarity_threshold": 65
  }
  ```
  > **New field**: `similarity_threshold` (0–100) sets the minimum AI match percentage for auto-selecting candidates. Defaults to 60 if omitted.
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
      "location": "Remote",
      "similarity_threshold": 65
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

## 3. Application Workflow (AI-Powered)

### POST `/api/applications/apply`
- **Method**: POST
- **Description**: Submits an application for a specific job. **Triggers the full AI matching pipeline**: generates embeddings (if needed), computes cosine similarity, and auto-sets the status based on the recruiter's threshold.
- **Role**: Candidate only
- **Rate Limited**: Yes (10 requests / 15 min) — calls HuggingFace API
- **Request Format**:
  ```json
  {
    "job_id": "uuid"
  }
  ```
- **Response Format**:
  ```json
  {
    "message": "Application submitted! You have been selected for an interview based on your profile match.",
    "application": {
      "application_id": "uuid",
      "job_title": "Software Engineer",
      "status": "selected_for_interview",
      "match_score": 78.45,
      "threshold": 65,
      "created_at": "2026-05-14T18:00:00Z"
    }
  }
  ```
- **Validation**: Checks candidate existence, job existence, duplicate prevention, and resume data availability.
- **Error Cases**:
  - `403`: Not a registered candidate
  - `404`: Job not found
  - `409`: Already applied to this job
  - `422`: No resume/profile data uploaded

### GET `/api/applications/my-applications`
- **Method**: GET
- **Description**: Lists all applications for the authenticated candidate, including AI match scores.
- **Role**: Candidate only
- **Response Format**:
  ```json
  {
    "applications": [
      {
        "application_id": "uuid",
        "status": "selected_for_interview",
        "match_score": 78.45,
        "matched_at": "2026-05-14T18:00:00Z",
        "created_at": "2026-05-14T17:55:00Z",
        "jobs": {
          "job_id": "uuid",
          "title": "Software Engineer",
          "similarity_threshold": 65
        }
      }
    ]
  }
  ```

### GET `/api/applications/status/:applicationId`
- **Method**: GET
- **Description**: Gets detailed status and AI match results for a specific application.
- **Role**: Both (ownership validated — candidate must own the application, or recruiter must own the job)
- **Response Format**:
  ```json
  {
    "application": {
      "application_id": "uuid",
      "job_title": "Software Engineer",
      "status": "selected_for_interview",
      "match_score": 78.45,
      "threshold": 65,
      "matched_at": "2026-05-14T18:00:00Z",
      "match_metadata": {
        "model": "BAAI/bge-small-en-v1.5",
        "dimensions": 384,
        "threshold_applied": 65,
        "processed_at": "2026-05-14T18:00:00Z"
      },
      "created_at": "2026-05-14T17:55:00Z"
    }
  }
  ```

### POST `/api/applications/rematch/:applicationId`
- **Method**: POST
- **Description**: Re-triggers AI matching for an existing application. Forces re-generation of the job embedding. Useful after updating the job description or threshold.
- **Role**: Recruiter only (must own the job)
- **Rate Limited**: Yes
- **Response Format**:
  ```json
  {
    "message": "Application re-matched successfully.",
    "result": {
      "application_id": "uuid",
      "job_title": "Software Engineer",
      "new_status": "selected_for_interview",
      "match_score": 82.10,
      "threshold": 65
    }
  }
  ```

### GET `/api/applications/job/:jobId/candidates`
- **Method**: GET
- **Description**: Lists all applicants for a specific job, ranked by match score (highest first).
- **Role**: Recruiter only (must own the job)
- **Response Format**:
  ```json
  {
    "job": { "job_id": "uuid", "title": "Software Engineer", "threshold": 65 },
    "applicants": [
      {
        "application_id": "uuid",
        "status": "selected_for_interview",
        "match_score": 82.10,
        "candidates": {
          "candidate_id": "uuid",
          "users": { "name": "Jane Doe", "email": "jane@example.com" }
        }
      }
    ]
  }
  ```

### GET `/api/applications/recommended-jobs?limit=10`
- **Method**: GET
- **Description**: Returns AI-powered job recommendations for the candidate, ranked by profile similarity.
- **Role**: Candidate only
- **Rate Limited**: Yes
- **Response Format**:
  ```json
  {
    "recommendations": [
      {
        "job_id": "uuid",
        "title": "Backend Developer",
        "similarity_percentage": 85.20,
        "meets_threshold": true,
        "similarity_threshold": 60
      }
    ]
  }
  ```

### GET `/api/applications/top-candidates/:jobId?limit=20`
- **Method**: GET
- **Description**: Returns AI-ranked candidates for a job (includes candidates who haven't applied).
- **Role**: Recruiter only (must own the job)
- **Rate Limited**: Yes
- **Response Format**:
  ```json
  {
    "candidates": [
      {
        "candidate_id": "uuid",
        "user_id": "uuid",
        "similarity_percentage": 88.50,
        "meets_threshold": true,
        "similarity_threshold": 60
      }
    ]
  }
  ```

---

## 4. Embedding Management

### POST `/api/embeddings/job/:jobId`
- **Method**: POST
- **Description**: Generates (or refreshes) the vector embedding for a job description. Skips if content is unchanged (hash match).
- **Role**: Recruiter only (must own the job)
- **Rate Limited**: Yes
- **Response Format**:
  ```json
  {
    "message": "Job embedding generated successfully.",
    "job_id": "uuid",
    "title": "Software Engineer",
    "cached": false,
    "hash": "a1b2c3d4e5f6..."
  }
  ```

### POST `/api/embeddings/profile`
- **Method**: POST
- **Description**: Generates (or refreshes) the vector embedding for the candidate's own resume/profile.
- **Role**: Candidate only
- **Rate Limited**: Yes
- **Response Format**:
  ```json
  {
    "message": "Profile embedding generated successfully.",
    "candidate_id": "uuid",
    "cached": false,
    "hash": "f6e5d4c3b2a1..."
  }
  ```

### GET `/api/embeddings/status/:jobId/:candidateId`
- **Method**: GET
- **Description**: Checks whether vector embeddings exist for both a job and a candidate. Useful for the frontend to show a readiness indicator before applying.
- **Role**: Authenticated user
- **Response Format**:
  ```json
  {
    "job_id": "uuid",
    "candidate_id": "uuid",
    "job_embedding_ready": true,
    "profile_embedding_ready": false,
    "both_ready": false
  }
  ```

---

## 5. Matching Engine

### POST `/api/matching/batch/:jobId`
- **Method**: POST
- **Description**: Re-runs AI matching for ALL existing applications of a specific job. Processes sequentially to respect API rate limits. Useful after updating a job description or threshold.
- **Role**: Recruiter only (must own the job)
- **Rate Limited**: Yes
- **Response Format**:
  ```json
  {
    "message": "Batch matching complete: 5 succeeded, 0 failed.",
    "job": { "job_id": "uuid", "title": "Software Engineer" },
    "total": 5,
    "succeeded": 5,
    "failed": 0,
    "results": [
      { "application_id": "uuid", "status": "selected_for_interview", "match_score": 82.10, "success": true },
      { "application_id": "uuid", "status": "rejected", "match_score": 45.30, "success": true }
    ]
  }
  ```

### GET `/api/matching/preview/:jobId/:candidateId`
- **Method**: GET
- **Description**: Preview the similarity score between a specific job and candidate without creating or modifying any application record. Read-only operation for recruiter dashboards.
- **Role**: Recruiter only (must own the job)
- **Response Format**:
  ```json
  {
    "job": { "job_id": "uuid", "title": "Software Engineer" },
    "candidate_id": "uuid",
    "similarity_percentage": 72.15,
    "meets_threshold": true,
    "threshold": 65
  }
  ```

---

## 6. AI Interview System

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
- **Description**: Generates and fetches the next dynamic interview question using the AI engine.
- **Role**: Candidate only
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
    "next_action": "continue"
  }
  ```

### GET `/api/interviews/:id/results`
- **Method**: GET
- **Description**: Fetches final scores and result of the interview.
- **Role**: Candidate / Recruiter
- **Response Format**:
  ```json
  {
    "interview_id": "uuid",
    "total_score": 260,
    "result": "pass",
    "details": []
  }
  ```

---

## 7. Health Check

### GET `/api/health`
- **Method**: GET
- **Description**: Verifies backend connectivity.
- **Role**: Public
- **Response Format**:
  ```json
  {
    "status": "ok",
    "message": "Xenon AI Recruitment Backend",
    "version": "1.0.0",
    "timestamp": "2026-05-14T18:00:00Z"
  }
  ```

---

## Update Rules

> **IMPORTANT: Auto-Update Mechanism**
> Whenever a new feature or API is built in the `backend/src/routes` directory:
> 1. Add the new endpoint to the respective section (or create a new section).
> 2. Clearly define the **Method**, **Endpoint**, and **Description**.
> 3. Document the expected **Request/Response JSON format**.
> 4. Specify the required **Role** and whether the endpoint is **Rate Limited**.
> 
> *Ensure the Frontend dev team is notified whenever this document changes.*
