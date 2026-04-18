import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiX, FiLogOut } from 'react-icons/fi';
import { supabase } from '../supabaseClient';


const Candidates = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedExps, setSelectedExps] = useState([]);

  // Recruiter credentials
  const [recruiter, setRecruiter] = useState({ firstName: 'Loading...', lastName: '', email: '' });

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const parts = (user.user_metadata?.name || 'Recruiter').split(' ');
      setRecruiter({
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: user.email
      });

      const { data: recData } = await supabase.from('recruiters').select('recruiter_id').eq('user_id', user.id).single();
      if (!recData) return;

      const { data: jobsArray } = await supabase.from('jobs').select('job_id, title, experience_level').eq('recruiter_id', recData.recruiter_id);
      if (!jobsArray || jobsArray.length === 0) {
        setJobs([]);
        setCandidates([]);
        return;
      }
      setJobs(jobsArray.map(j => ({ ...j, experience: j.experience_level })));

      const jobIds = jobsArray.map(j => j.job_id);
      
      // Load actual submitted applications for THESE jobs
      const { data: appsData, error } = await supabase
        .from('applications')
        .select(`
          application_id,
          status,
          job_id,
          candidate_id,
          candidates ( user_id )
        `)
        .in('job_id', jobIds);

      if (error) {
        console.error("Error fetching applications:", error.message);
      }

      // Now fetch user details for each application manually to be safe on joins
      if (!error && appsData && appsData.length > 0) {
        const userIds = appsData.map(a => a.candidates?.user_id).filter(Boolean);
        let userMap = {};
        if (userIds.length > 0) {
           const { data: usersData } = await supabase.from('users').select('id, name, email').in('id', userIds);
           if (usersData) {
             userMap = usersData.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {});
           }
        }

        const processedApps = appsData.map(app => {
           const currentJob = jobsArray.find(j => j.job_id === app.job_id);
           const uData = userMap[app.candidates?.user_id] || {};
           return {
             name: uData.name || 'Unknown Applicant',
             email: uData.email || 'N/A',
             experience: currentJob?.experience_level || 'N/A',
             jobPosition: currentJob?.title || 'Unknown Job',
             status: app.status || 'Applied'
           };
        });
        setCandidates(processedApps);
      }
    };

    loadData();
  }, []);

  const initials = `${recruiter.firstName[0] || ''}${recruiter.lastName[0] || ''}`.toUpperCase();
  const fullName = `${recruiter.firstName} ${recruiter.lastName}`.trim() || 'Recruiter';

  const uniqueExperiences = [...new Set(jobs.map(j => j.experience).filter(Boolean))];

  const handleJobChange = (e) => {
    if (e.target.value === "") {
      setSelectedJobs([]);
    } else {
      setSelectedJobs([e.target.value]);
    }
  };

  const handleExpChange = (e) => {
    if (e.target.value === "") {
      setSelectedExps([]);
    } else {
      setSelectedExps([e.target.value]);
    }
  };

  const handleCloseFilters = () => {
    setSelectedJobs([]);
    setSelectedExps([]);
  };

  // Filter Logic
  const filteredCandidates = candidates.filter(cand => {
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select 
                value={selectedJobs.length > 0 ? selectedJobs[0] : ""} 
                onChange={handleJobChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
              >
                <option value="">All Jobs</option>
                {jobs.map((job, idx) => (
                  <option key={idx} value={job.title}>{job.title}</option>
                ))}
              </select>
              {jobs.length === 0 && <span style={{fontSize:'12px', color:'#999'}}>No jobs posted</span>}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Experience</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select 
                value={selectedExps.length > 0 ? selectedExps[0] : ""} 
                onChange={handleExpChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
              >
                <option value="">All Experiences</option>
                {uniqueExperiences.map((exp, idx) => (
                  <option key={idx} value={exp}>{exp}</option>
                ))}
              </select>
              {uniqueExperiences.length === 0 && <span style={{fontSize:'12px', color:'#999'}}>No experiences posted</span>}
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
            Candidates Overview
          </h1>
        </div>
        
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', marginBottom: '40px' }}/>

        {/* Candidates Table Card */}
        <div style={{
          border: '2px solid #E2D9FC', borderRadius: '24px', background: 'white', padding: '0', 
          overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
        }}>
          
          {filteredCandidates.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
              No candidates found for the selected filters.
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
                  // Make Avatar initials
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
                      <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', color: 'var(--primary-color)', fontWeight: '500' }}>{cand.status}</td>
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

export default Candidates;
