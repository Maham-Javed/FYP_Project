import React, { useEffect, useState } from 'react';
import logoUrl from '../assets/logo.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiClipboard, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import { supabase } from '../supabaseClient';

// CandidateJobDetail Component
// This component displays the full details of a specific job to a candidate.
// It shows job title, description, requirements, and an Apply button.
const CandidateJobDetail = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const job = state?.job;

  // Candidate profile state
  const [candidate, setCandidate] = useState({ firstName: 'Loading...', lastName: '', email: '' });
  // Removed unused setIsApplying as apply action navigates immediately
  const [isApplying] = useState(false);
  useEffect(() => {
    if (!job) {
      navigate('/candidate-dashboard');
      return;
    }
    
    // Load candidate data
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fullName = user.user_metadata?.name || 'Candidate User';
        const parts = fullName.split(' ');
        setCandidate({
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          email: user.email
        });
      }
    };
    loadUser();
  }, [job, navigate]);

  if (!job) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleApply = () => {
    navigate('/candidate-job-apply', { state: { job } });
  };

  // Avatar initial
  const initial = candidate.firstName.charAt(0).toUpperCase();

  // Parse skills text into items if it has commas
  const skillsList = job.skills && job.skills.includes(',') 
    ? job.skills.split(',').map(s => s.trim()) 
    : [job.skills || 'General Requirements'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      
      {/* Sidebar (same as dashboard) */}
      <div style={{ 
        width: '280px', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column',
        padding: '30px 0', flexShrink: 0
      }}>
                <div style={{ padding: '0 24px', marginBottom: '30px' }}>
          <img src={logoUrl} alt="Xenon AI" style={{ height: '32px' }} />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', 
            background: 'var(--sidebar-active-bg)', color: '#111', cursor: 'pointer',
            borderLeft: '4px solid var(--primary-color)'
          }} onClick={() => navigate('/candidate-dashboard')}>
            <FiHome size={22} color="var(--primary-color)" />
            <span style={{ fontWeight: '600', fontSize: '16px' }}>Home</span>
          </div>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', 
            color: '#4B5563', cursor: 'pointer'
          }} onClick={() => navigate('/candidate-applied-jobs')}>
            <FiUsers size={22} />
            <span style={{ fontWeight: '500', fontSize: '16px' }}>Applied Jobs</span>
          </div>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', 
            color: '#4B5563', cursor: 'pointer'
          }}>
            <FiClipboard size={22} />
            <span style={{ fontWeight: '500', fontSize: '16px' }}>Interview</span>
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

      {/* Main Panel sliding from right */}
      <div style={{ 
        flex: 1, padding: '30px 50px', overflow: 'hidden', background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
        animation: 'slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        display: 'flex', flexDirection: 'column'
      }}>
        
        {/* Back navigation header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #E2E8F0', paddingBottom: '15px', flexShrink: 0 }}>
          <button onClick={() => navigate(-1)} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
            <FiArrowLeft size={20} color="#4F46E5" />
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Job Details</h1>
        </div>

        {/* Big Expanded Job Card (Scroll-free Layout) */}
        <div style={{ 
          background: '#FFFFFF', borderRadius: '24px', padding: '30px 40px', 
          width: '100%', maxWidth: '1000px', margin: '0 auto',
          boxShadow: '0 20px 40px rgba(79, 70, 229, 0.08)',
          border: '1px solid rgba(79, 70, 229, 0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexShrink: 0 }}>
            <div>
              <span style={{ 
                background: '#EEF2FF', color: '#4F46E5', padding: '6px 12px', borderRadius: '8px', 
                fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
                display: 'inline-block', marginBottom: '12px'
              }}>
                Hiring Now
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                {job.title}
              </h2>
            </div>
            
            <button 
              onClick={handleApply}
              disabled={isApplying}
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', color: 'white', padding: '12px 36px',
                borderRadius: '12px', fontSize: '15px', fontWeight: '600', border: 'none',
                cursor: isApplying ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
                opacity: isApplying ? 0.7 : 1,
                flexShrink: 0
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 70, 229, 0.25)'; }}
            >
              {isApplying ? "Applying..." : "Apply Now"}
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>
            
            <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', flexShrink: 0 }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '16px', background: '#4F46E5', borderRadius: '4px' }}></span>
                Role Description
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                {job.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
              
              <div style={{ flex: 1, background: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '4px', height: '16px', background: '#10B981', borderRadius: '4px' }}></span>
                  Key Requirements
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.8' }}>
                  {skillsList.map((skill, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{skill}</li>
                  ))}
                  <li style={{ marginBottom: '6px' }}>Strong problem-solving mindset and analytical skills</li>
                  <li>Good understanding of modern project architectures</li>
                </ul>
              </div>

              <div style={{ flex: 1, background: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '4px', height: '16px', background: '#F59E0B', borderRadius: '4px' }}></span>
                  Experience & Qualifications
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.8' }}>
                  <li style={{ marginBottom: '6px' }}>{job.qualification || "Bachelor's degree in Computer Science, Software Engineering, or related field"}</li>
                  <li style={{ marginBottom: '6px' }}>{job.experience || "1-3 years of experience"} in relevant domain</li>
                  <li>Hands-on experience building real-world applications</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    
    </div>
  );
};

export default CandidateJobDetail;
