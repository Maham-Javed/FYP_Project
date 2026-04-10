# 🚀 Xenon 

Xenon is a modern, responsive, React-based web application orchestrating the entire lifecycle of hiring and interviewing. Featuring two fully-synchronized ecosystems (Recruiter & Candidate portals), Xenon is designed to act as a robust local environment for frictionless, modern HR pipelines powered by simulated automated AI interview concepts.

## ✨ Core Features

### 🏢 Recruiter Portal
- **Dashboard Overview:** Comprehensive visual matrix of active job listings, showing live application counts, shortlist numbers, and top scorers.
- **Job Management:** Post rich job descriptions including required skills, qualifications, and experience limits. Edit existing jobs or completely delete them across all networks seamlessly via aggressive cascading data deletion sweeps.
- **Candidate Pool Analysis:** A dynamic master table displaying live applicants pulling natively from Candidate submissions. Advanced multi-select interactive filtering by Job Role and Experience levels.
- **Top Scorers Tracking:** Dedicated pages to single out elite candidates from interview phases based on performance tracking tags.

### 💼 Candidate Portal
- **Role Search & Discovery:** Interactive live-search bar and tag-based pill filtering (Experience, Location, Skills) to find perfectly matching opportunities.
- **Application Flow:** Complete native tracking. Seamless authentication overlay with CV upload processing combined with synchronized backend local data storage that physically updates Recruiter tracking boards live.
- **Application Tracking Dashboard:** Active `Applied Jobs` control panel that tracks candidate status pipelines dynamically (Applied / Shortlisted / Accepted / Rejected).
- **Automated AI Interview Environment:** Simulates a robust, interactive, and timed interview testing process featuring:
  - Strict pagination (10 dynamic questions split efficiently into paginated chains).
  - 5:00-minute ticking countdown timers seamlessly synced per question.
  - Final post-game scoring analytics screen gracefully sliding into view outlining duration, success rates, and overall generalized performance results.

## 🛠️ Technology Stack
- **Framework:** [React 18](https://reactjs.org/) & [Vite](https://vitejs.dev/)
- **Routing:** Component scaffolding handled completely via `react-router-dom`
- **Iconography:** Beautiful embedded vector shapes via `react-icons`
- **State/Database Simulation:** Complex browser-based persistent environment securely routing real-time interconnected JSON objects via `window.localStorage`.
- **CSS Architecture:** Vanilla customizable CSS targeting global design aesthetic consistency using `:root` variables for tailored HSL styling (`--primary-color: #9C89F8`, deep glassmorphism aesthetics) and custom CSS keyframe animations for elegant screen transitions (`slideInRight`, `slideDown`).

## ⚙️ Running Locally

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd Xenon-Project
   ```

2. **Install all generic core dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

The application will cleanly boot to a stylized landing page representing the entrance gates where you can elect to cleanly jump into the session as either a Hiring Recruiter or a Talent Candidate! Navigate back and forth securely while the app accurately mimics production-level database dependencies using the DOM local storage tree exclusively.
