import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { supabase } from '../supabaseClient';

// CandidateDetails Component
// This component displays the detailed profile of a candidate to a recruiter.
// It shows the candidate's name, email, the specific job they applied for, and their scores.
// It also provides Accept and Reject action buttons.
const CandidateDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  // State for showing success toast messages
  const [popupMessage, setPopupMessage] = useState('');

  const cand = state?.cand;

  const [cvMatch, setCvMatch] = useState(cand?.cvMatch || 0);
  const [dbInterviewScore, setDbInterviewScore] = useState(cand?.score || 0);
  const [dbThreshold, setDbThreshold] = useState(cand?.threshold || 60);

  useEffect(() => {
    const fetchLatestScores = async () => {
      if (!cand?.applicationId) return;
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            match_score,
            jobs (
              passing_threshold
            ),
            interviews (
              total_score
            )
          `)
          .eq('application_id', cand.applicationId)
          .single();

        if (error) {
          console.error("Error fetching latest scores:", error);
          return;
        }

        if (data) {
          if (data.match_score !== null && data.match_score !== undefined) {
            setCvMatch(data.match_score);
          }
          
          let intScore = 0;
          if (data.interviews) {
            if (Array.isArray(data.interviews)) {
              intScore = data.interviews[0]?.total_score || 0;
            } else {
              intScore = data.interviews.total_score || 0;
            }
          }
          setDbInterviewScore(intScore);

          if (data.jobs?.passing_threshold !== null && data.jobs?.passing_threshold !== undefined) {
            setDbThreshold(data.jobs.passing_threshold);
          }
        }
      } catch (err) {
        console.error("Failed to fetch latest scores:", err);
      }
    };

    fetchLatestScores();
  }, [cand]);

  // Redirect if no candidate data is provided in navigation state
  useEffect(() => {
    if (!cand) {
      navigate('/top-scorers');
    }
  }, [cand, navigate]);

  const closePopup = () => {
    setPopupMessage('');
    navigate('/top-scorers');
  };

  // Clear the popup message after 3 seconds
  useEffect(() => {
    let timer;
    if (popupMessage) {
      timer = setTimeout(() => {
        closePopup();
      }, 3000);
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupMessage]);

  if (!cand) return null;

  // Make avatar initials
  let initial = cand.name.substring(0, 2).toUpperCase();
  if (cand.name.includes(' ')) {
    initial = cand.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  // Draw actual scores passed from TopScorers query
  const cvMatching = cvMatch ? Number(cvMatch).toFixed(1) : '0.0';
  const interviewScore = dbInterviewScore ? Number(dbInterviewScore).toFixed(1) : '0.0';

  const handleAction = (action) => {
    const msg = action === 'accept'
      ? `Accepting Email sent to ${cand.name}`
      : `Rejecting Email sent to ${cand.name}`;
    setPopupMessage(msg);
  };

  return (
    <div 
      className="animated-gradient-bg" 
      style={{ 
        height: '100vh', 
        width: '100vw', 
        overflow: 'hidden', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '20px', 
        fontFamily: "'Inter', sans-serif" 
      }}
    >
      {/* Toast Notification */}
      {popupMessage && (
        <div style={{
          position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)',
          background: '#FFFFFF', padding: '16px 24px', borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 9999, display: 'flex',
          alignItems: 'center', gap: '15px', borderLeft: '5px solid #4F46E5',
          animation: 'slideDown 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          minWidth: '320px'
        }}>
          <div style={{
            background: '#EEF2FF', color: '#4F46E5', borderRadius: '50%', width: '28px', height: '28px',
            display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0
          }}>
            ✓
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, color: '#0F172A', fontSize: '15px', fontWeight: 'bold' }}>Success</h4>
            <p style={{ margin: '2px 0 0', color: '#4B5563', fontSize: '14px' }}>{popupMessage}</p>
          </div>
          <button
            onClick={closePopup}
            style={{
              background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer',
              color: '#9CA3AF', padding: '0 5px'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div 
        className="glass-card" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(20px)', 
          border: '1px solid rgba(255, 255, 255, 0.4)', 
          borderRadius: '24px', 
          padding: '40px', 
          width: '100%', 
          maxWidth: '550px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)', 
          animation: 'slideIn 0.5s ease-out', 
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            position: 'absolute', top: '24px', left: '24px', background: '#F1F5F9', border: 'none', 
            borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', 
            alignItems: 'center', cursor: 'pointer', color: '#4F46E5', transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.transform = 'scale(1.05)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.transform = 'scale(1)' }}
        >
          <FiArrowLeft size={20} />
        </button>

        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', marginTop: '10px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            color: '#FFFFFF', fontSize: '22px', fontWeight: '700',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)',
            flexShrink: 0
          }}>
            {initial}
          </div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>{cand.name}</h2>
            <p style={{ fontSize: '14.5px', color: '#64748B', fontWeight: '500', margin: '0 0 8px 0' }}>{cand.email}</p>
            <span style={{ 
              display: 'inline-block', 
              fontSize: '12.5px', 
              fontWeight: '700', 
              color: '#4F46E5', 
              background: '#EEF2FF', 
              padding: '4px 10px', 
              borderRadius: '8px',
              border: '1px solid #C7D2FE'
            }}>
              Job Position: {cand.jobPosition}
            </span>
          </div>
        </div>

        {/* Evaluation Scores progress display */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B', marginBottom: '20px', textAlign: 'left' }}>
            Performance Evaluation
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* CV Matching Score */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>CV Match Score</span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>{cvMatching}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${cvMatching}%`, height: '100%', background: 'linear-gradient(90deg, #6366F1 0%, #4F46E5 100%)', borderRadius: '9999px' }}></div>
              </div>
            </div>

            {/* Interview Score */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>AI Interview Performance</span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>{interviewScore}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${interviewScore}%`, height: '100%', background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)', borderRadius: '9999px' }}></div>
              </div>
            </div>

            {/* Overall Score Banner */}
            <div style={{ 
              background: '#EEF2FF', 
              padding: '16px 20px', 
              borderRadius: '16px', 
              border: '1px solid #C7D2FE', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              textAlign: 'left'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Grade</span>
                <span style={{ fontSize: '13px', color: '#6366F1', fontWeight: '500' }}>Passing score: {dbThreshold}%</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#4F46E5', display: 'block' }}>{Number(dbInterviewScore).toFixed(1)}%</span>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  color: dbInterviewScore >= dbThreshold ? '#059669' : '#DC2626',
                  textTransform: 'uppercase'
                }}>
                  {dbInterviewScore >= dbThreshold ? 'Qualified' : 'Not Qualified'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button 
            onClick={() => handleAction('accept')} 
            style={{ 
              padding: '12px 30px', borderRadius: '12px', width: '140px', background: '#10B981', 
              color: '#FFFFFF', border: 'none', fontWeight: '700', fontSize: '14.5px', cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Accept
          </button>
          <button 
            onClick={() => handleAction('reject')} 
            style={{ 
              padding: '12px 30px', borderRadius: '12px', width: '140px', background: '#EF4444', 
              color: '#FFFFFF', border: 'none', fontWeight: '700', fontSize: '14.5px', cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Reject
          </button>
        </div>

      </div>
    </div>
  );
};

export default CandidateDetails;


