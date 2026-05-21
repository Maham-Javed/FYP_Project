import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiBookOpen, FiClock, FiAlertCircle, FiAward } from 'react-icons/fi';
import { supabase } from '../supabaseClient';

const CandidateInterviewScore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { interviewId } = location.state || {};

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!interviewId) {
      setError("No active interview session ID detected. Please navigate from your Applied Jobs dashboard.");
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("No authenticated session found. Please log in.");
          setLoading(false);
          return;
        }
        const token = session.access_token;

        const response = await fetch(`http://localhost:5000/api/interviews/${interviewId}/results`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load interview results.");
        }

        setResults(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading results:", err);
        setError(err.message || "An unexpected error occurred while fetching your scorecard.");
        setLoading(false);
      }
    };

    fetchResults();
  }, [interviewId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ border: '4px solid rgba(79, 70, 229, 0.1)', borderLeftColor: '#4F46E5', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
        <p style={{ color: '#6B7280', fontSize: '16px', fontWeight: '500' }}>Fetching your personalized AI scorecard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', sans-serif", padding: '20px' }}>
        <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', maxWidth: '500px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <FiAlertCircle size={48} color="#EF4444" style={{ marginBottom: '20px', margin: '0 auto' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>Scorecard Unavailable</h3>
          <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>{error}</p>
          <button 
            onClick={() => navigate('/candidate-applied-jobs')}
            style={{
              background: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '12px 30px', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { interview, breakdown } = results || {};
  const isPassed = interview?.result === 'passed';
  const overallScore = interview?.total_score || 0;
  const threshold = interview?.passing_threshold || 60;

  // Format date
  const dateTaken = interview?.created_at 
    ? new Date(interview.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Unknown Date';

  // Helper to color code individual question scores
  const getScoreColorBadge = (score) => {
    if (score >= 8) return { bg: '#D1FAE5', color: '#065F46', text: 'Excellent' };
    if (score >= 5) return { bg: '#FEF3C7', color: '#92400E', text: 'Average' };
    return { bg: '#FEE2E2', color: '#991B1B', text: 'Needs Improvement' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', sans-serif", padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Header navigation bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/candidate-applied-jobs')} 
            style={{ 
              background: '#FFFFFF', border: '1px solid #E5E7EB', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '30px',
              color: '#4B5563', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            onMouseEnter={(e) => e.target.style.background = '#F9FAFB'}
            onMouseLeave={(e) => e.target.style.background = '#FFFFFF'}
          >
            <FiArrowLeft size={16} /> Back to Dashboard
          </button>
          <span style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: '500' }}>
            Taken on: {dateTaken}
          </span>
        </div>

        {/* Dynamic Overview Section Card */}
        <div style={{ 
          background: '#FFFFFF', borderRadius: '24px', padding: '40px', 
          border: '1px solid #E5E7EB', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          display: 'flex', flexDirection: 'row', gap: '40px', flexWrap: 'wrap', alignItems: 'center'
        }}>
          
          {/* Circular Score Visual Indicator */}
          <div style={{ flexShrink: 0, position: 'relative', width: '160px', height: '160px', borderRadius: '50%', background: `conic-gradient(#4F46E5 0% ${overallScore}%, #E5E7EB ${overallScore}% 100%)`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '136px', height: '136px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '38px', fontWeight: '800', color: '#111827' }}>
                {overallScore}%
              </span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI SCORE
              </span>
            </div>
          </div>

          {/* Stats Description Card */}
          <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: 0 }}>
                {interview?.job_title || 'Technical Assessment'}
              </h1>
              {isPassed ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#D1FAE5', color: '#065F46', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '700' }}>
                  <FiCheckCircle size={14} /> Passed
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEE2E2', color: '#991B1B', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '700' }}>
                  <FiXCircle size={14} /> Failed
                </span>
              )}
            </div>
            
            <p style={{ color: '#4B5563', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
              {isPassed 
                ? "Congratulations! Your performance exceeded the passing threshold for this job opening. The recruiter has been notified of your passing result."
                : "You did not meet the required passing threshold for this job position. We encourage you to review the feedback below to improve your core technical competencies."
              }
            </p>

            <div style={{ display: 'flex', gap: '30px', borderTop: '1px solid #E5E7EB', paddingTop: '15px', marginTop: '5px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Threshold</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#374151' }}>{threshold}%</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Questions</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#374151' }}>{breakdown?.length || 5}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Score</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#374151' }}>
                  {breakdown && breakdown.length > 0 
                    ? (breakdown.reduce((sum, item) => sum + (item.score || 0), 0) / breakdown.length).toFixed(1)
                    : 0} / 10
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Question by Question breakdown Section */}
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '5px', marginTop: '10px' }}>
          Question Breakdown & AI Feedback
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {breakdown && breakdown.map((item, index) => {
            const badge = getScoreColorBadge(item.score);
            return (
              <div key={item.question_id || index} style={{ 
                background: '#FFFFFF', borderRadius: '20px', padding: '30px', 
                border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                display: 'flex', flexDirection: 'column', gap: '20px'
              }}>
                {/* Question Info Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: '#F3F4F6', color: '#111827', fontSize: '13px', fontWeight: '700', padding: '4px 12px', borderRadius: '8px' }}>
                      Q{item.sequence_number}
                    </span>
                    <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '8px' }}>
                      {item.topic || 'General Tech'}
                    </span>
                    <span style={{ background: item.difficulty === 'Hard' ? '#FEE2E2' : item.difficulty === 'Medium' ? '#FEF3C7' : '#D1FAE5', color: item.difficulty === 'Hard' ? '#991B1B' : item.difficulty === 'Medium' ? '#92400E' : '#065F46', fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '8px' }}>
                      {item.difficulty}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'inline-block', fontSize: '13px', fontWeight: '700', padding: '4px 12px', borderRadius: '12px', background: badge.bg, color: badge.color }}>
                      Score: {item.score} / 10 ({badge.text})
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', lineHeight: '1.5', margin: 0 }}>
                  {item.question_text}
                </h3>

                {/* Candidate Response Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Response</span>
                  <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px 20px', fontSize: '14px', lineHeight: '1.6', color: '#374151', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {item.candidate_response || "No response provided."}
                  </div>
                </div>

                {/* AI Evaluation Box */}
                <div style={{ 
                  borderLeft: '4px solid #8B5CF6', background: '#F5F3FF', borderRadius: '0 12px 12px 0', 
                  padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <FiAward size={14} /> AI Expert Evaluation
                  </span>
                  <p style={{ color: '#4C1D95', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                    {item.feedback || "No AI feedback generated."}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* Centered Return Button at bottom */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => navigate('/candidate-dashboard')}
            style={{
              background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)', color: '#FFFFFF', border: 'none',
              padding: '14px 50px', borderRadius: '30px', fontWeight: '700', fontSize: '16px',
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
            }}
          >
            Return to Candidate Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default CandidateInterviewScore;
