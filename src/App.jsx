import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import HireSignup from './pages/HireSignup';
import RoleSignup from './pages/RoleSignup';
import PostJob from './pages/PostJob';
import JobDetails from './pages/JobDetails';
import EditJob from './pages/EditJob';
import Candidates from './pages/Candidates';
import TopScorers from './pages/TopScorers';
import CandidateDetails from './pages/CandidateDetails';
import Dashboard from './pages/Dashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateJobDetail from './pages/CandidateJobDetail';

function App() {
  return (
    <Router>
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
