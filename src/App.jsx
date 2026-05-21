import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load route pages for optimal bundle splitting and performance
const Landing = lazy(() => import('./pages/Landing'));
const HireSignup = lazy(() => import('./pages/HireSignup'));
const RoleSignup = lazy(() => import('./pages/RoleSignup'));
const PostJob = lazy(() => import('./pages/PostJob'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const EditJob = lazy(() => import('./pages/EditJob'));
const Candidates = lazy(() => import('./pages/Candidates'));
const TopScorers = lazy(() => import('./pages/TopScorers'));
const CandidateDetails = lazy(() => import('./pages/CandidateDetails'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'));
const CandidateJobDetail = lazy(() => import('./pages/CandidateJobDetail'));
const CandidateJobApply = lazy(() => import('./pages/CandidateJobApply'));
const CandidateAppliedJobs = lazy(() => import('./pages/CandidateAppliedJobs'));
const CandidateInterviewInfo = lazy(() => import('./pages/CandidateInterviewInfo'));
const CandidateInterview = lazy(() => import('./pages/CandidateInterview'));
const CandidateInterviewScore = lazy(() => import('./pages/CandidateInterviewScore'));

// Premium, glassmorphic loading fallback screen matching dark-mode aesthetics
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#070712',
    backgroundImage: 'radial-gradient(circle at 50% 50%, #12102e 0%, #070712 100%)',
    color: '#c7d2fe',
    fontFamily: '"Outfit", "Inter", sans-serif',
    flexDirection: 'column',
    gap: '20px'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: '3px solid rgba(199, 210, 254, 0.1)',
      borderTop: '3px solid #6366f1',
      borderRight: '3px solid #a855f7',
      borderRadius: '50%',
      animation: 'xenon-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite'
    }} />
    <style>{`
      @keyframes xenon-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <div style={{ 
      fontSize: '0.95rem', 
      fontWeight: 500, 
      letterSpacing: '2px', 
      textTransform: 'uppercase',
      opacity: 0.8,
      textShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
    }}>
      Loading Xenon Platform...
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/hire-talent" element={<HireSignup />} />
            <Route path="/find-role" element={<RoleSignup />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/edit-job/:id" element={<EditJob />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/top-scorers" element={<TopScorers />} />
            <Route path="/candidate-details" element={<CandidateDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate-job" element={<CandidateJobDetail />} />
            <Route path="/candidate-job-apply" element={<CandidateJobApply />} />
            <Route path="/candidate-applied-jobs" element={<CandidateAppliedJobs />} />
            <Route path="/candidate-interview-info" element={<CandidateInterviewInfo />} />
            <Route path="/candidate-interview" element={<CandidateInterview />} />
            <Route path="/candidate-interview-score" element={<CandidateInterviewScore />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
