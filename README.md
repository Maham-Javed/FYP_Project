# Xenon: AI-Ready Recruitment Platform

Welcome to the **Xenon Project**, a modern, responsive, and dynamic web application tailored for streamlining the recruitment process. Xenon connects recruiters with top talent through automated candidate pipelines, role-based dashboards, and AI-ready interview features.

## 🚀 Project Overview

Xenon provides an end-to-end recruitment workflow. It allows recruiters to post and manage jobs while enabling candidates to browse, apply, and complete automated interviews. The platform is designed with a sleek, modern UI, utilizing glassmorphism and subtle micro-animations to create a premium user experience.

### Key Features
- **Role-Based Workflows**: Dedicated dashboards for both Candidates and Recruiters.
- **Job Management**: Recruiters can create, edit, and track job postings.
- **Automated Interview Pipeline**: A candidate-facing interface for answering timed interview questions.
- **Scoring & Evaluation**: Recruiters can view top-scoring candidates and access detailed breakdown views of CV matches and interview scores.
- **Real-Time Data**: Integrated with Supabase for fast, secure, and persistent data storage.

## 🛠️ Technology Stack

- **Frontend**: React.js powered by Vite for lightning-fast development and optimized production builds.
- **Backend**: Node.js with Express (Foundation set up for upcoming AI integration).
- **Database & Auth**: Supabase (PostgreSQL) handling user authentication, session management, and persistent data storage.
- **Styling**: Vanilla CSS utilizing custom properties (CSS variables) for easy theming and consistent design.

## 📂 Project Structure

```
d:\Xenon-Project\
├── .env                  # Frontend Environment Variables (Supabase Config)
├── index.html            # Main HTML template
├── package.json          # Frontend Dependencies and Scripts
├── vite.config.js        # Vite Bundler Configuration
│
├── backend/              # Express Backend Server
│   ├── .env              # Backend Environment Variables
│   ├── server.js         # Entry Point
│   ├── package.json      # Backend Dependencies
│   └── src/
│       ├── app.js        # Express App Configuration
│       ├── config/       # Supabase and other configs
│       ├── middlewares/  # Auth & Rate Limiting
│       ├── services/     # AI Logic Stubs
│       └── utils/        # LLM Clients & Prompts
│
└── src/                  # React Frontend
    ├── assets/           # Images, icons, etc.
    ├── components/       # Reusable UI components (Sidebar, JobCard)
    ├── pages/            # Page-level components (Dashboards, Auth, Jobs)
    ├── App.jsx           # Main App Routing
    ├── main.jsx          # React DOM Render Entry
    ├── index.css         # Global Styles & Theming
    └── supabaseClient.js # Supabase Initialization
```

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)
- A Supabase Project (with `jobs` table configured)

### 1. Clone & Install
Navigate to the project root and install the dependencies for both the frontend and backend:

```bash
npm install          # Installs frontend dependencies
cd backend
npm install          # Installs backend dependencies
cd ..
```

### 2. Environment Configuration
Ensure you have the following environment variables set up:

**Frontend (`.env` in root):**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (`backend/.env`):**
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=5000
```

*Note: The project is already connected to an active Supabase instance.*

### 3. Running the Project Locally
You can run both the frontend and backend concurrently from the root directory using the custom dev script:

```bash
npm run dev
```
- The **Frontend** (Vite) will typically run on `http://localhost:5173`.
- The **Backend** (Express) will run on `http://localhost:5000`.

## 🧹 Code Quality

The project utilizes `eslint` to maintain code quality. To run the linter and find unused variables or imports:

```bash
npm run lint
```

Standard comments have been added throughout the `src/` and `backend/` directories to ensure the codebase remains maintainable and easy to onboard new developers.

---
*Built with ❤️ for next-generation recruitment.*
