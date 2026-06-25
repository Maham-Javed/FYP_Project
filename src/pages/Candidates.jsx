import React, { useState, useEffect } from 'react';
import logoUrl from '../assets/logo.svg';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLogOut } from 'react-icons/fi';
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

      // Get active session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      try {
        const applicantsPromises = jobsArray.map(async (job) => {
          const response = await fetch(`http://localhost:5000/api/applications/job/${job.job_id}/candidates`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            console.error(`Failed to fetch candidates for job ${job.job_id}:`, response.statusText);
            return [];
          }
          const resData = await response.json();
          return resData.applicants || [];
        });

        const allApplicantsArrays = await Promise.all(applicantsPromises);
        const allApplicants = allApplicantsArrays.flat();

        const processedApps = allApplicants.map(app => {
           const currentJob = jobsArray.find(j => j.job_id === app.job_id);
           return {
             name: app.candidates?.users?.name || 'Unknown Applicant',
             email: app.candidates?.users?.email || 'N/A',
             experience: currentJob?.experience_level || 'N/A',
             jobPosition: currentJob?.title || 'Unknown Job',
             status: app.status || 'Applied'
           };
        });
        setCandidates(processedApps);
      } catch (err) {
        console.error("Error fetching applications via API:", err);
      }
    };

    loadData();
  }, []);

  const initials = `${recruiter.firstName[0] || ''}${recruiter.lastName[0] || ''}`.toUpperCase();
  const fullName = `${recruiter.firstName} ${recruiter.lastName}`.trim() || 'Recruiter';

  const uniqueExperiences = [...new Set(jobs.map(j => j.experience).filter(Boolean))];

  const toggleJob = (jobTitle) => {
    if (selectedJobs.includes(jobTitle)) {
      setSelectedJobs(selectedJobs.filter(t => t !== jobTitle));
    } else {
      setSelectedJobs([...selectedJobs, jobTitle]);
    }
  };

  const toggleExp = (expLevel) => {
    if (selectedExps.includes(expLevel)) {
      setSelectedExps(selectedExps.filter(e => e !== expLevel));
    } else {
      setSelectedExps([...selectedExps, expLevel]);
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
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      background: '#F8FAFC', 
      fontFamily: "'Inter', sans-serif" 
    }}>
      
      <style>{`
        .filter-pill {
          padding: 8px 14px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          color: #475569;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
          text-align: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .filter-pill:hover {
          border-color: #4F46E5;
          color: #4F46E5;
          background: rgba(79, 70, 229, 0.02);
        }
        .filter-pill.active {
          background: #4F46E5;
          border-color: #4F46E5;
          color: #FFFFFF;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
        }
        .table-row:hover {
          background-color: #F8FAFC;
        }
      `}</style>

      {/* Filter Sidebar */}
      <div style={{
        width: '280px',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 0',
        background: '#FFFFFF',
        flexShrink: 0
      }}>
        <div style={{ padding: '0 24px', marginBottom: '40px' }}>
          <img src={logoUrl} alt="Xenon AI" style={{ height: '32px' }} />
        </div>

        <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Filters</h3>
          {(selectedJobs.length > 0 || selectedExps.length > 0) && (
            <button 
              onClick={handleCloseFilters} 
              style={{ 
                background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', 
                fontSize: '12px', fontWeight: '700', padding: 0
              }}
            >
              Clear All
            </button>
          )}
        </div>

        <div style={{ padding: '0 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Job filter */}
          <div>
            <h4 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B', marginBottom: '12px' }}>Job Position</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {jobs.map((job, idx) => {
                const isActive = selectedJobs.includes(job.title);
                return (
                  <span 
                    key={idx} 
                    className={`filter-pill ${isActive ? 'active' : ''}`}
                    onClick={() => toggleJob(job.title)}
                  >
                    {job.title}
                  </span>
                );
              })}
              {jobs.length === 0 && <span style={{ fontSize: '12px', color: '#94A3B8' }}>No jobs posted yet</span>}
            </div>
          </div>

          {/* Experience filter */}
          <div>
            <h4 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B', marginBottom: '12px' }}>Experience</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {uniqueExperiences.map((exp, idx) => {
                const isActive = selectedExps.includes(exp);
                return (
                  <span 
                    key={idx} 
                    className={`filter-pill ${isActive ? 'active' : ''}`}
                    onClick={() => toggleExp(exp)}
                  >
                    {exp}
                  </span>
                );
              })}
              {uniqueExperiences.length === 0 && <span style={{ fontSize: '12px', color: '#94A3B8' }}>No experiences posted</span>}
            </div>
          </div>
        </div>

        {/* User Profile at bottom */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '15px', marginTop: 'auto' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', background: '#D1FAE5',
            display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#10B981',
            flexShrink: 0
          }}>
            {initials || 'JD'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fullName}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {recruiter.email}
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4F46E5', flexShrink: 0, padding: 0, display: 'flex', alignItems: 'center' }}>
            <FiLogOut size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Header content */}
        <div style={{ 
          padding: '24px 40px', 
          background: '#FFFFFF', 
          borderBottom: '1px solid #E5E7EB',
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px'
        }}>
          <FiArrowLeft size={24} style={{ cursor: 'pointer', color: '#4F46E5' }} onClick={() => navigate('/dashboard')} />
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
            Candidates Overview
          </h1>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ flex: 1, padding: '30px 40px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          {/* Candidates Table Card */}
          <div style={{
            border: '1px solid #E2E8F0', 
            borderRadius: '20px', 
            background: 'white', 
            padding: '0', 
            overflow: 'hidden', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
            animation: 'slideIn 0.5s ease-out'
          }}>
            
            {filteredCandidates.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '15px' }}>
                No candidates found matching the selected filters.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>Name</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>Email</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>Job Position</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((cand, idx) => {
                    // Make Avatar initials
                    let initial = cand.name.substring(0, 2).toUpperCase();
                    if (cand.name.includes(' ')) {
                       initial = cand.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
                    }

                    // Status Badge logic
                    const statusLower = (cand.status || '').toLowerCase();
                    let badgeBg = '#F1F5F9';
                    let badgeColor = '#475569';
                    let badgeBorder = '#E2E8F0';
                    let displayStatus = cand.status || 'Applied';

                    if (['accepted', 'hired', 'passed the interview', 'passed', 'pass', 'accepted by recruiter'].includes(statusLower)) {
                      badgeBg = '#ECFDF5';
                      badgeColor = '#047857';
                      badgeBorder = '#A7F3D0';
                      if (statusLower === 'accepted') displayStatus = 'Accepted by recruiter';
                    } else if (['rejected', 'failed', 'fail', 'rejected by the recruiter'].includes(statusLower)) {
                      badgeBg = '#FEF2F2';
                      badgeColor = '#B91C1C';
                      badgeBorder = '#FCA5A5';
                      if (statusLower === 'rejected') displayStatus = 'Rejected by the recruiter';
                    } else if (['interviewing', 'shortlisted', 'shortlisted for interview', 'scheduled'].includes(statusLower)) {
                      badgeBg = '#EEF2FF';
                      badgeColor = '#4338CA';
                      badgeBorder = '#C7D2FE';
                    } else if (['applied', 'pending', 'under_review', 'under review'].includes(statusLower)) {
                      badgeBg = '#EFF6FF';
                      badgeColor = '#1D4ED8';
                      badgeBorder = '#BFDBFE';
                      if (statusLower === 'under_review') displayStatus = 'Under Review';
                    }

                    return (
                      <tr key={idx} className="table-row" style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ 
                              width: '38px', 
                              height: '38px', 
                              borderRadius: '50%', 
                              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center', 
                              color: 'white', 
                              fontSize: '13.5px', 
                              fontWeight: '600',
                              boxShadow: '0 2px 4px rgba(79, 70, 229, 0.15)',
                              flexShrink: 0
                            }}>
                              {initial}
                            </div>
                            <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '14.5px' }}>{cand.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px' }}>{cand.email}</td>
                        <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>{cand.jobPosition}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            background: badgeBg,
                            color: badgeColor,
                            border: `1px solid ${badgeBorder}`
                          }}>
                            {displayStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Candidates;

