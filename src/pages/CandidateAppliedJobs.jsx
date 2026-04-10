import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiClipboard, FiLogOut, FiArrowLeft } from 'react-icons/fi';

const CandidateAppliedJobs = () => {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState({ firstName: 'Sara', lastName: 'Akram', email: 'saraakram@gmail.com' });
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Load candidate profile
    const candData = localStorage.getItem('xenon_candidate');
    if (candData) {
      try {
        setCandidate(JSON.parse(candData));
      } catch (e) {}
    }

    // Load active applications
    const storedApps = localStorage.getItem('xenon_applications');
    if (storedApps) {
      try {
        setApplications(JSON.parse(storedApps));
      } catch (e) {}
    } else {
      // Mock some if array is strictly empty to match design test
      setApplications([]);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('xenon_candidate');
    navigate('/');
  };

  const initial = candidate.firstName.charAt(0).toUpperCase();

  // Helper function to color code statuses
  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s === 'applied') return { bg: '#FEF08A', col: '#854D0E' }; // Yellow
    if (s === 'accepted') return { bg: '#BBF7D0', col: '#166534' }; // Green
    if (s === 'rejected') return { bg: '#FECACA', col: '#991B1B' }; // Red
    if (s === 'shortlisted') return { bg: '#FED7AA', col: '#9A3412' }; // Orange
    return { bg: '#E5E7EB', col: '#374151' }; // Grey fallback
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sidebar */}
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
            color: '#4B5563', cursor: 'pointer'
          }} onClick={() => navigate('/candidate-dashboard')}>
            <FiHome size={22} />
            <span style={{ fontWeight: '500', fontSize: '16px' }}>Home</span>
          </div>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', 
            background: 'var(--sidebar-active-bg)', color: '#111', cursor: 'pointer',
            borderLeft: '4px solid var(--primary-color)'
          }}>
            <FiUsers size={22} color="var(--primary-color)" />
            <span style={{ fontWeight: '600', fontSize: '16px' }}>Applied Jobs</span>
          </div>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', 
            color: '#4B5563', cursor: 'pointer'
          }}>
            <FiClipboard size={22} />
            <span style={{ fontWeight: '500', fontSize: '16px' }}>Interview</span>
          </div>
        </nav>

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

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px', borderBottom: '1px solid #E5E7EB', paddingBottom: '20px' }}>
          <button onClick={() => navigate('/candidate-dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <FiArrowLeft size={28} color="#111" />
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#111', margin: 0 }}>Applied Jobs</h1>
        </div>

        {/* Your Application Section */}
        <div style={{ 
          border: '2px solid var(--primary-color)', borderRadius: '24px', padding: '40px', 
          background: '#FFFFFF', marginBottom: '40px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111', marginBottom: '30px' }}>
            Your Application
          </h2>
          
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
            {applications.length === 0 ? (
               <p style={{ color: '#6B7280' }}>You have not applied for any jobs yet.</p>
            ) : (
              applications.map((app) => {
                const colors = getStatusColor(app.status);
                return (
                  <div key={app.id} style={{
                    border: '2px solid var(--sidebar-active-bg)', borderRadius: '16px', padding: '20px',
                    minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '15px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', margin: 0 }}>{app.title}</h3>
                    <p style={{ fontSize: '13px', color: '#4B5563', margin: 0 }}>{app.company}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                      <span style={{ 
                        background: colors.bg, color: colors.col, padding: '6px 20px', 
                        borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                      }}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Interviews Section */}
        <div style={{ 
          border: '2px solid var(--primary-color)', borderRadius: '24px', padding: '40px', 
          background: '#FFFFFF'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111', marginBottom: '30px' }}>
            Upcoming Interviews
          </h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                <th style={{ padding: '15px 10px', fontSize: '16px', fontWeight: '600', color: '#111' }}>Stage 2</th>
                <th style={{ padding: '15px 10px', fontSize: '16px', fontWeight: '600', color: '#111' }}>Job Title</th>
                <th style={{ padding: '15px 10px', fontSize: '16px', fontWeight: '600', color: '#111' }}>Interview Date</th>
                <th style={{ padding: '15px 10px' }}></th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy data as per wireframe since there is no interview scheduling system yet */}
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '15px 10px', fontSize: '14px', color: '#111' }}>AI-Interview</td>
                <td style={{ padding: '15px 10px', fontSize: '14px', color: '#111' }}>SQL Developer</td>
                <td style={{ padding: '15px 10px', fontSize: '14px', color: '#111' }}>11-03</td>
                <td style={{ padding: '15px 10px', fontSize: '14px' }}>
                  <button onClick={() => navigate('/candidate-interview-info')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'underline' }}>View Details</button>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '15px 10px', fontSize: '14px', color: '#111' }}>AI-Interview</td>
                <td style={{ padding: '15px 10px', fontSize: '14px', color: '#111' }}>UI Developer</td>
                <td style={{ padding: '15px 10px', fontSize: '14px', color: '#111' }}>18-04</td>
                <td style={{ padding: '15px 10px', fontSize: '14px' }}>
                  <button onClick={() => navigate('/candidate-interview-info')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'underline' }}>View Details</button>
                </td>
              </tr>
            </tbody>
          </table>

        </div>

      </div>
    </div>
  );
};

export default CandidateAppliedJobs;
