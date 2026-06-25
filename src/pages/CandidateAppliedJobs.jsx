import React, { useEffect, useState } from 'react';
import logoUrl from '../assets/logo.svg';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiClipboard, FiLogOut, FiArrowLeft, 
  FiBriefcase, FiMapPin, FiCalendar, FiAward, FiTrash2
} from 'react-icons/fi';
import { supabase } from '../supabaseClient';

const CandidateAppliedJobs = () => {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState({ firstName: 'Loading...', lastName: '', email: '' });
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Get logged-in user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        const fullName = user.user_metadata?.name || 'Candidate User';
        const parts = fullName.split(' ');
        setCandidate({
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          email: user.email
        });

        // 2. Fetch applied jobs. First find candidate_id from public.candidates
        const { data: candData } = await supabase
          .from('candidates')
          .select('candidate_id')
          .eq('user_id', user.id)
          .single();

        if (candData) {
          // Fetch applications for this candidate, grouping with jobs
          const { data: appsData, error } = await supabase
            .from('applications')
            .select(`
              application_id,
              status,
              match_score,
              created_at,
              jobs (
                title,
                similarity_threshold
              )
            `)
            .eq('candidate_id', candData.candidate_id);
            
          if (error) {
            console.error("Error fetching applications:", error.message);
          }
            
          if (!error && appsData) {
             console.log("CandidateAppliedJobs appsData:", appsData);
             // Map status to what the UI expects (since DB uses pending/interviewing)
             const mapStatus = (dbStatus) => {
               if (dbStatus === 'pending') return 'Applied';
               if (dbStatus === 'selected_for_interview' || dbStatus === 'shortlisted for interview' || dbStatus === 'interviewing') return 'Shortlisted';
               if (dbStatus === 'Passed the interview') return 'Passed the interview';
               if (dbStatus === 'Accepted' || dbStatus === 'accepted') return 'Accepted by recruiter';
               if (dbStatus === 'Rejected' || dbStatus === 'rejected') return 'Rejected by the recruiter';
               if (dbStatus === 'under_review') return 'Under Review';
               return dbStatus || 'Applied';
             };

             // Map to format frontend expects
             const frontendApps = appsData.map(app => {
               // Auto-generate an interview date: 2 days after application date
               const appliedDate = new Date(app.created_at);
               const interviewDate = new Date(appliedDate);
               interviewDate.setDate(interviewDate.getDate() + 2);
               
               const formattedDate = interviewDate.toLocaleDateString('en-US', {
                 month: 'short',
                 day: 'numeric',
                 year: 'numeric'
               });

               return {
                 id: app.application_id,
                 title: app.jobs?.title || 'Unknown Job',
                 company: 'Xenon Corp', 
                 status: mapStatus(app.status),
                 interviewDate: formattedDate,
                 matchScore: app.match_score,
                 threshold: app.jobs?.similarity_threshold || 60
               };
             });
             setApplications(frontendApps);
          }
        }
      } else {
        navigate('/');
      }
    };
    
    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteApplication = async (applicationId) => {
    const confirmed = window.confirm("Are you sure you want to withdraw this application?");
    if (!confirmed) return;

    // Optimistically update the UI
    setApplications(prev => prev.filter(app => app.id !== applicationId));

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('application_id', applicationId);

    if (error) {
      console.error("Error deleting application:", error.message);
      alert("Failed to delete application. Please try again.");
    }
  };

  const initial = candidate.firstName.charAt(0).toUpperCase();

  // Helper function to color code statuses
  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s === 'applied') return { bg: '#FEF08A', col: '#854D0E' }; // Yellow
    if (s === 'accepted by recruiter' || s === 'accepted') return { bg: '#D1FAE5', col: '#065F46' }; // Green
    if (s === 'rejected by the recruiter' || s === 'rejected') return { bg: '#FEE2E2', col: '#DC2626' }; // Red (Trendy Red)
    if (s === 'shortlisted') return { bg: '#ECFDF5', col: '#059669' }; // Emerald Green
    if (s === 'passed the interview') return { bg: '#D1FAE5', col: '#065F46' }; // Emerald Green
    if (s === 'under review' || s === 'under_review') return { bg: '#EFF6FF', col: '#1D4ED8' }; // Blue
    return { bg: '#F1F5F9', col: '#475569' }; // Grey fallback
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Dynamic styles to maintain rich interactive design elements */}
      <style>{`
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px 28px;
          color: #4B5563;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 4px solid transparent;
        }
        .sidebar-item:hover {
          color: #4F46E5;
          background: rgba(79, 70, 229, 0.04);
        }
        .sidebar-item.active {
          background: #EEF2FF;
          color: #4F46E5;
          font-weight: 600;
          border-left: 4px solid #4F46E5;
        }
        .app-card {
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 24px;
          background: #FFFFFF;
          min-width: 290px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
          cursor: pointer;
        }
        .app-card:hover {
          transform: translateY(-4px);
          border-color: #4F46E5;
          box-shadow: 0 12px 20px -3px rgba(79, 70, 229, 0.08), 0 4px 6px -2px rgba(79, 70, 229, 0.04);
        }
        .interview-row {
          transition: background 0.2s ease;
        }
        .interview-row:hover {
          background: #F8FAFC;
        }
        .view-details-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #4F46E5;
          font-weight: 600;
          font-size: 13.5px;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .view-details-btn:hover {
          color: #3730A3;
        }
      `}</style>

      {/* Sidebar */}
      <div style={{ 
        width: '280px', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column',
        padding: '30px 0', background: '#FFFFFF', flexShrink: 0
      }}>
        <div style={{ padding: '0 24px', marginBottom: '40px', display: 'flex', alignItems: 'center' }}>
          <img src={logoUrl} alt="Xenon AI" style={{ height: '32px' }} />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="sidebar-item" onClick={() => navigate('/candidate-dashboard')}>
            <FiHome size={20} />
            <span style={{ fontSize: '15px' }}>Home</span>
          </div>
          <div className="sidebar-item active">
            <FiUsers size={20} />
            <span style={{ fontSize: '15px' }}>Applied Jobs</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/candidate-applied-jobs')}>
            <FiClipboard size={20} />
            <span style={{ fontSize: '15px' }}>Interview</span>
          </div>
        </nav>

        {/* User Profile */}
        <div style={{ padding: '0 24px', marginTop: 'auto', marginBottom: '20px' }}>
          <div 
            onClick={handleLogout}
            style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '12px', background: '#F8FAFC', borderRadius: '16px', 
              cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #E2E8F0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
            title="Click to Logout"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{ 
                width: '38px', height: '38px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', 
                borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontWeight: '700', fontSize: '14px', flexShrink: 0, boxShadow: '0 2px 5px rgba(16, 185, 129, 0.3)'
              }}>
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {candidate.firstName} {candidate.lastName}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {candidate.email}
                </div>
              </div>
            </div>
            <div style={{ 
              color: '#EF4444', display: 'flex', justifyContent: 'center', alignItems: 'center', 
              width: '32px', height: '32px', borderRadius: '8px', background: '#FEE2E2',
              flexShrink: 0, transition: 'all 0.2s'
            }}>
              <FiLogOut size={16} style={{ transform: 'translateX(1px)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '30px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #E5E7EB', paddingBottom: '20px' }}>
          <button onClick={() => navigate('/candidate-dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '50%', hover: { background: '#F1F5F9' } }}>
            <FiArrowLeft size={24} color="#0F172A" />
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Applied Jobs</h1>
        </div>

        {/* Your Application Section */}
        <div style={{ 
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '24px' }}>
            Your Applications
          </h2>
          
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
            {applications.length === 0 ? (
               <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>You have not applied for any jobs yet.</p>
            ) : (
              applications.map((app) => {
                const colors = getStatusColor(app.status);
                return (
                  <div key={app.id} className="app-card">
                    {/* Header: Title and icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '10px', background: '#F1F5F9', 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#475569',
                        flexShrink: 0
                      }}>
                        <FiBriefcase size={18} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {app.title}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>{app.company}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteApplication(app.id); }}
                        title="Withdraw Application"
                        style={{
                          background: '#FEE2E2',
                          border: 'none',
                          borderRadius: '8px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          color: '#DC2626',
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#FECACA'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>Status</span>
                      <span style={{ 
                        background: colors.bg, color: colors.col, padding: '4px 12px', 
                        borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'
                      }}>
                        {app.status}
                      </span>
                    </div>

                    {/* Match Score & Threshold */}
                    {app.matchScore !== null && app.matchScore !== undefined ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
                          <span>Match Score: <strong style={{ color: app.matchScore >= app.threshold ? '#059669' : '#DC2626' }}>{app.matchScore}%</strong></span>
                          <span>Req: <strong>{app.threshold}%</strong></span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(Math.max(app.matchScore, 0), 100)}%`,
                            height: '100%',
                            background: app.matchScore >= app.threshold ? '#10B981' : '#EF4444',
                            borderRadius: '3px'
                          }} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '12px', color: '#94A3B8' }}>
                        <span>Auto-matching calculation in progress...</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Interviews Section */}
        <div style={{ 
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '24px' }}>
            Upcoming Interviews
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Type</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Job Title</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Interview Date</th>
                  <th style={{ padding: '12px 16px' }}></th>
                </tr>
              </thead>
              <tbody>
                {applications.filter(app => app.status === 'Shortlisted').length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '24px 16px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                      No upcoming interviews scheduled yet.
                    </td>
                  </tr>
                ) : (
                  applications.filter(app => app.status === 'Shortlisted').map((app, index) => (
                    <tr key={`int-${index}`} className="interview-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#0F172A', fontWeight: '500' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FiAward size={16} color="#4F46E5" />
                          <span>AI-Interview (Stage 2)</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{app.title}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FiCalendar size={14} color="#64748B" />
                          <span>{app.interviewDate}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button 
                          onClick={() => navigate('/candidate-interview-info', { state: { application: app } })} 
                          className="view-details-btn"
                        >
                          Start / Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CandidateAppliedJobs;
