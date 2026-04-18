import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiClipboard, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import { supabase } from '../supabaseClient';

const CandidateJobDetail = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const job = state?.job;

  const [candidate, setCandidate] = useState({ firstName: 'Loading...', lastName: '', email: '' });
  const [isApplying, setIsApplying] = useState(false);

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
        <div style={{ padding: '0 30px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '40px', height: '40px', background: 'var(--sidebar-active-bg)', borderRadius: '8px',
            display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--primary-color)',
            fontWeight: 'bold', fontSize: '18px', color: '#111'
          }}>Xr</div>
          <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>XENON</span>
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
        <div style={{ 
          padding: '20px 30px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '15px'
        }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', background: '#D1FAE5',
            display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#10B981'
          }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', lineHeight: '1.2' }}>{candidate.firstName} {candidate.lastName}</div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>{candidate.email}</div>
          </div>
          <FiLogOut size={22} color="var(--primary-color)" cursor="pointer" onClick={handleLogout} />
        </div>
      </div>

      {/* Main Panel sliding from right */}
      <div style={{ 
        flex: 1, padding: '40px 60px', overflowY: 'auto', background: '#FAFAFA',
        animation: 'slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
      }}>
        
        {/* Back navigation header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #E5E7EB', paddingBottom: '20px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <FiArrowLeft size={28} color="#111" />
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#111', margin: 0 }}>Find your Dream Job</h1>
        </div>

        {/* Big Expanded Job Card (No sidecards) */}
        <div style={{ 
          border: '3px solid var(--primary-color)', borderRadius: '24px', padding: '40px', 
          background: '#FFFFFF', maxWidth: '900px', boxShadow: '0 10px 40px rgba(156,137,248,0.1)',
          position: 'relative'
        }}>
          
          <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111', marginBottom: '25px' }}>
            {job.title}
          </h2>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '15px' }}>Description:</h3>
            <p style={{ fontSize: '15px', color: '#111', lineHeight: '1.6', maxWidth: '800px' }}>
              {job.description}
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '15px' }}>Requirements:</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#111', fontSize: '15px', lineHeight: '1.8' }}>
              {skillsList.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
              <li>Strong problem-solving mindset and analytical skills</li>
              <li>Good understanding of modern project architectures</li>
            </ul>
          </div>

          <div style={{ marginBottom: '50px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '15px' }}>Experience:</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#111', fontSize: '15px', lineHeight: '1.8' }}>
              <li>{job.qualification || "Bachelor's degree in Computer Science, Software Engineering, or related field (or equivalent practical experience)"}</li>
              <li>{job.experience || "1-3 years of experience"} in relevant domain</li>
              <li>Hands-on experience building real-world applications</li>
            </ul>
          </div>

          {/* Apply Button positioned at bottom-right inside the card */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-20px' }}>
            <button 
              onClick={handleApply}
              disabled={isApplying}
              style={{
                background: 'var(--primary-color)', color: 'white', padding: '15px 40px',
                borderRadius: '30px', fontSize: '16px', fontWeight: '600', border: 'none',
                cursor: isApplying ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(156, 137, 248, 0.4)',
                opacity: isApplying ? 0.7 : 1
              }}
            >
              {isApplying ? "Applying..." : "Apply Now"}
            </button>
          </div>
        </div>
      </div>
    
    </div>
  );
};

export default CandidateJobDetail;
