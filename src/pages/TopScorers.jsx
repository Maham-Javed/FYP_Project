import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiX, FiLogOut } from 'react-icons/fi';

const MOCK_CANDIDATES_BASE = [
  { name: 'Asma Javed', email: 'AsmaJaved@gmail.com', experience: '1-2 Year', score: 85 },
  { name: 'Farhan', email: 'Farhan@gmail.com', experience: '2-4 Years', score: 90 },
  { name: 'Waqas', email: 'Waqas@gmail.com', experience: '4-5 Years', score: 65 },
  { name: 'Aqsa Arfan', email: 'AqsaArfan@gmail.com', experience: '1 Year', score: 78 },
  { name: 'Osama', email: 'Osama@gmail.com', experience: '3 Year', score: 50 },
  { name: 'Bisma Shaid', email: 'BismaShaid@gmail.com', experience: '1-2 Year', score: 95 },
  { name: 'Laraib', email: 'Laraib@gmail.com', experience: '2-4 Years', score: 60 },
];

const EXPERIENCES = ['1-2 Year', '2-4 Years', '4-5 Years', '1 Year', '3 Year'];

const TopScorers = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedExps, setSelectedExps] = useState([]);

  // Recruiter credentials
  const recruiterStr = localStorage.getItem('xenon_recruiter');
  const recruiter = recruiterStr ? JSON.parse(recruiterStr) : { firstName: 'John', lastName: 'Doe', email: 'johndoe@unilever.com' };
  const initials = `${recruiter.firstName[0] || ''}${recruiter.lastName[0] || ''}`.toUpperCase();
  const fullName = `${recruiter.firstName} ${recruiter.lastName}`;

  useEffect(() => {
    // Load jobs
    const loadedJobs = JSON.parse(localStorage.getItem('xenon_jobs') || '[]');
    setJobs(loadedJobs);

    // Mapped candidates filtering via threshold
    if (loadedJobs.length > 0) {
      const allMapped = MOCK_CANDIDATES_BASE.map((cand, index) => {
        const assignedJob = loadedJobs[index % loadedJobs.length];
        
        // Parse the threshold (e.g., '75%' -> 75)
        let thresholdVal = 0;
        if (assignedJob.threshold) {
          thresholdVal = parseInt(assignedJob.threshold.replace(/[^0-9]/g, '')) || 0;
        }

        return {
          ...cand,
          jobPosition: assignedJob.title || 'Untitled Job',
          threshold: thresholdVal
        };
      });

      // Filter only those who scored >= their assigned job's threshold
      const qualifiers = allMapped.filter(c => c.score >= c.threshold);
      setTopCandidates(qualifiers);
    } else {
      setTopCandidates([]); // No Top scorers if no jobs posted
    }
  }, []);

  const toggleJobFilter = (jobTitle) => {
    setSelectedJobs(prev => 
      prev.includes(jobTitle) ? prev.filter(j => j !== jobTitle) : [...prev, jobTitle]
    );
  };

  const toggleExpFilter = (exp) => {
    setSelectedExps(prev => 
      prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]
    );
  };

  const handleCloseFilters = () => {
    setSelectedJobs([]);
    setSelectedExps([]);
  };

  // Filter Logic
  const filteredCandidates = topCandidates.filter(cand => {
    const jobMatch = selectedJobs.length === 0 || selectedJobs.includes(cand.jobPosition);
    const expMatch = selectedExps.length === 0 || selectedExps.includes(cand.experience);
    return jobMatch && expMatch;
  });

  return (
    <div className="dashboard-layout">
      {/* Filter Sidebar */}
      <div className="sidebar-mobile" style={{
        width: '280px',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        background: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 30px', marginBottom: '30px' }}>
          <div style={{ 
            width: '40px', height: '40px', border: '1px solid #ddd', 
            borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontWeight: 'bold', fontSize: '18px', color: '#111'
          }}>
            Xr
          </div>
          <span style={{ fontSize: '20px', letterSpacing: '2px', fontWeight: '300', color: '#111' }}>XENON</span>
        </div>

        <div style={{ padding: '0 30px', marginBottom: '20px' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }}/>
        </div>

        <div style={{ padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Filter</h3>
          <FiX size={20} style={{ cursor: 'pointer' }} onClick={handleCloseFilters} />
        </div>

        <div style={{ padding: '0 30px', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Job</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {jobs.map((job, idx) => {
                const isActive = selectedJobs.includes(job.title);
                return (
                  <button 
                    key={idx} 
                    onClick={() => toggleJobFilter(job.title)}
                    style={{
                      padding: '8px 12px', borderRadius: '15px', border: 'none',
                      background: isActive ? 'var(--primary-color)' : '#F0EDFF',
                      color: isActive ? 'white' : '#111', fontSize: '12px', cursor: 'pointer',
                      transition: '0.2s', fontWeight: '500'
                    }}
                  >
                    {job.title}
                  </button>
                );
              })}
              {jobs.length === 0 && <span style={{fontSize:'12px', color:'#999'}}>No jobs posted</span>}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Experience</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {EXPERIENCES.map((exp, idx) => {
                const isActive = selectedExps.includes(exp);
                return (
                  <button 
                    key={idx} 
                    onClick={() => toggleExpFilter(exp)}
                    style={{
                      padding: '8px 12px', borderRadius: '15px', border: 'none',
                      background: isActive ? 'var(--primary-color)' : '#F0EDFF',
                      color: isActive ? 'white' : '#111', fontSize: '12px', cursor: 'pointer',
                      transition: '0.2s', fontWeight: '500'
                    }}
                  >
                    {exp}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Profile at bottom */}
        <div style={{ padding: '0 30px', marginTop: '20px' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', marginBottom: '20px' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '40px', height: '40px', background: '#8B4513', color: 'white', 
                borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontWeight: '600'
              }}>
                {initials || 'JD'}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#111' }}>{fullName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{recruiter.email}</div>
              </div>
            </div>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}>
              <FiLogOut size={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{ animation: 'slideIn 0.5s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <FiArrowLeft size={28} style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')} />
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#111', margin: 0 }}>
            Top Scorers
          </h1>
        </div>
        
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', marginBottom: '40px' }}/>

        {/* Top Scorers Table Card */}
        <div style={{
          border: '2px solid #E2D9FC', borderRadius: '24px', background: 'white', padding: '0', 
          overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
        }}>
          
          {filteredCandidates.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
              No candidates found matching the job threshold and current filters.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '24px', fontWeight: '600', color: '#111', borderBottom: '1px solid var(--border-light)', textAlign: 'center' }}>Name</th>
                  <th style={{ padding: '24px', fontWeight: '600', color: '#111', borderBottom: '1px solid var(--border-light)' }}>Email</th>
                  <th style={{ padding: '24px', fontWeight: '600', color: '#111', borderBottom: '1px solid var(--border-light)' }}>Job Position</th>
                  <th style={{ padding: '24px', fontWeight: '600', color: '#111', borderBottom: '1px solid var(--border-light)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((cand, idx) => {
                  let initial = cand.name.substring(0, 2).toUpperCase();
                  if (cand.name.includes(' ')) {
                     initial = cand.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
                  }

                  return (
                    <tr key={idx}>
                      <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#2D3748', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '14px', fontWeight: '600' }}>
                            {initial}
                          </div>
                          <span style={{ fontWeight: '500', color: '#111' }}>{cand.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', color: '#444' }}>{cand.email}</td>
                      <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', color: '#444' }}>{cand.jobPosition}</td>
                      <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)' }}>
                        <span onClick={() => navigate('/candidate-details', { state: { cand } })} style={{ color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}>View detail</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopScorers;
