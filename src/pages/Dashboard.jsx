import React from 'react';
import Sidebar from '../components/Sidebar';
import JobCard from '../components/JobCard';

const Dashboard = () => {
  const recruiterStr = localStorage.getItem('xenon_recruiter');
  const recruiter = recruiterStr ? JSON.parse(recruiterStr) : { firstName: 'John' };
  
  const jobs = JSON.parse(localStorage.getItem('xenon_jobs') || '[]');

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#111', marginBottom: '20px' }}>
          Welcome Back, {recruiter.firstName}
        </h1>
        
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', marginBottom: '40px' }}/>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '30px',
          animation: 'slideIn 0.5s ease-out'
        }}>
          {jobs.length > 0 ? (
            jobs.map((job, index) => (
              <JobCard 
                key={index}
                id={index}
                title={job.title}
                applied={job.applied}
                shortlisted={job.shortlisted}
                topScorer={job.topScorer}
              />
            ))
          ) : (
            <p style={{ color: 'var(--text-light)' }}>No jobs posted yet! Click "Add New Job" to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
