import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiClipboard, FiLogOut, FiArrowLeft, FiClock, FiAlertCircle } from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import logoUrl from '../assets/logo.svg';

const CandidateInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { application } = location.state || {};

  // Interview state
  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [candidateResponse, setCandidateResponse] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes per question (15 mins / 5 questions)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finished, setFinished] = useState(false);

  const totalQuestions = 5;
  const responseRef = useRef(candidateResponse);

  // Sync response text to ref to prevent stale closure in timer callback
  useEffect(() => {
    responseRef.current = candidateResponse;
  }, [candidateResponse]);

  useEffect(() => {
    // 1. Check if application info is passed in state
    if (!application?.id) {
      setError("No active session found. Please start the interview process from your Applied Jobs dashboard.");
      setLoading(false);
      return;
    }

    startInterviewSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer Countdown logic
  useEffect(() => {
    if (loading || isSubmitting || !interviewId || finished) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          // Time expired! Trigger auto-submit
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isSubmitting, interviewId, currentQuestionId, finished]);

  const startInterviewSession = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("No authenticated session found. Please log in.");
        setLoading(false);
        return;
      }
      const token = session.access_token;
      
      const response = await fetch('http://localhost:5000/api/interviews/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ application_id: application.id })
      });

      let data = {};
      const responseText = await response.text();
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseErr) {
        console.error("Failed to parse start response JSON:", responseText, parseErr);
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Too many requests. Please wait a moment and try again.");
          }
          throw new Error(`Server returned error status ${response.status}`);
        }
        throw new Error("Invalid response received from the server.");
      }

      if (!response.ok) {
        // If interview is already finished
        if (response.status === 409 && data.status === 'completed') {
          setError("You have already completed the interview for this application.");
          setInterviewId(data.interview_id);
          setFinished(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Failed to start interview.");
      }

      setInterviewId(data.interview_id);
      if (data.finished || data.status === 'completed') {
        setFinished(true);
        navigate('/candidate-interview-score', { state: { interviewId: data.interview_id } });
      } else if (data.question) {
        setCurrentQuestionId(data.question.question_id);
        setCurrentQuestionText(data.question.question_text);
        setCurrentQuestionIndex(data.question.sequence_number);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error starting interview:", err);
      setError(err.message || "An unexpected error occurred while starting the interview.");
      setLoading(false);
    }
  };

  const submitAnswer = async (isAuto = false) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Session expired. Please log in again.");
        setIsSubmitting(false);
        return;
      }
      const token = session.access_token;
      const timeTaken = 180 - timeLeft;
      const finalResponse = isAuto ? responseRef.current : candidateResponse;

      const response = await fetch(`http://localhost:5000/api/interviews/${interviewId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question_id: currentQuestionId,
          candidate_response: finalResponse.trim() || (isAuto ? "No response provided within the time limit." : "Skipped / No response provided."),
          time_taken_seconds: timeTaken
        })
      });

      let data = {};
      const responseText = await response.text();
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseErr) {
        console.error("Failed to parse submit response JSON:", responseText, parseErr);
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Too many requests. Please wait a moment and try again.");
          }
          throw new Error(`Server returned error status ${response.status}`);
        }
        throw new Error("Invalid response received from the server.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit answer.");
      }

      if (data.finished) {
        setFinished(true);
        // Show success toast
        setShowToast(true);
        setTimeout(() => {
          navigate('/candidate-interview-score', { state: { interviewId } });
        }, 2500);
      } else if (data.nextQuestion) {
        setCurrentQuestionId(data.nextQuestion.question_id);
        setCurrentQuestionText(data.nextQuestion.question_text);
        setCurrentQuestionIndex(data.nextQuestion.sequence_number);
        setCandidateResponse("");
        setTimeLeft(180);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      alert(err.message || "An error occurred while submitting your answer.");
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    submitAnswer(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ border: '4px solid rgba(79, 70, 229, 0.1)', borderLeftColor: '#4F46E5', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
        <p style={{ color: '#6B7280', fontSize: '16px', fontWeight: '500' }}>Initializing secure interview session...</p>
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
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>Unable to Start Interview</h3>
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

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      {showToast && (
        <div style={{
          position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)',
          background: '#FFFFFF', padding: '16px 24px', borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 9999, display: 'flex',
          alignItems: 'center', gap: '15px', borderLeft: '5px solid #10B981',
          minWidth: '340px'
        }}>
          <div style={{
            background: '#D1FAE5', color: '#10B981', borderRadius: '50%', width: '28px', height: '28px',
            display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0
          }}>
            ✓
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, color: '#111', fontSize: '15px', fontWeight: 'bold' }}>Success</h4>
            <p style={{ margin: '2px 0 0', color: '#4B5563', fontSize: '14px' }}>Interview completed successfully. Evaluating final score...</p>
          </div>
        </div>
      )}

      {/* Immersive Mode Header */}
      <header style={{
        background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', padding: '16px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoUrl} alt="Xenon AI" style={{ height: '24px' }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280', paddingLeft: '12px', borderLeft: '1px solid #E5E7EB' }}>
            {application?.title || 'Technical Assessment'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: timeLeft < 60 ? '#FEE2E2' : '#F3F4F6', padding: '8px 16px', borderRadius: '20px', transition: 'all 0.3s' }}>
          <FiClock size={16} color={timeLeft < 60 ? '#EF4444' : '#4B5563'} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: timeLeft < 60 ? '#EF4444' : '#111827', fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </header>

      {/* Progress Bar container */}
      <div style={{ width: '100%', height: '4px', background: '#E5E7EB', position: 'relative' }}>
        <div style={{
          width: `${(currentQuestionIndex / totalQuestions) * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #4F46E5, #8B5CF6)',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}></div>
      </div>

      {/* Focused Center Layout */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '800px', background: '#FFFFFF', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Question Index Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Question {currentQuestionIndex} of {totalQuestions}
            </span>
            <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
              Auto-submits when timer expires
            </span>
          </div>

          {/* Question Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', lineHeight: '1.5' }}>
              {currentQuestionText || "Generating next question..."}
            </h2>
          </div>

          {/* Answer Input Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Response:
            </label>
            <textarea 
              value={candidateResponse}
              onChange={(e) => setCandidateResponse(e.target.value)}
              disabled={isSubmitting || finished}
              placeholder="Type your structured answer here. Include code examples, key architectural patterns, or logic flow details as needed..."
              style={{
                width: '100%',
                minHeight: '200px',
                background: '#FFFFFF',
                border: '1.5px solid #E5E7EB',
                borderRadius: '16px',
                padding: '20px',
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#111827',
                resize: 'vertical',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease-in-out',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4F46E5';
                e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
              }}
            />
          </div>

          {/* Navigation / Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '14px', color: '#6B7280', fontStyle: 'italic' }}>
              Please do not refresh the page during the interview.
            </span>
            <button 
              onClick={() => submitAnswer(false)}
              disabled={isSubmitting || finished}
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)',
                color: '#FFFFFF',
                border: 'none',
                padding: '14px 45px',
                borderRadius: '30px',
                fontWeight: '600',
                cursor: (isSubmitting || finished) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && !finished) e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && !finished) e.target.style.transform = 'translateY(0)';
              }}
            >
              {isSubmitting ? 'Evaluating...' : (currentQuestionIndex === totalQuestions ? 'Submit Interview' : 'Next Question')}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CandidateInterview;
