import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiClipboard, FiLogOut, FiArrowLeft } from 'react-icons/fi';

const CandidateInterview = () => {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState({ firstName: 'Sara', lastName: 'Akram', email: 'saraakram@gmail.com' });
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const totalQuestions = 10;

  useEffect(() => {
    // Load candidate profile
    const candData = localStorage.getItem('xenon_candidate');
    if (candData) {
      try {
        setCandidate(JSON.parse(candData));
      } catch (e) {}
    }

    // Timer logic
    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [currentQuestion]); // Reset behavior can be added if it changes, but here timer just runs. Let's make it fixed per question.

  // Reset timer if question changes
  useEffect(() => {
    setTimeLeft(300);
  }, [currentQuestion]);

  const handleLogout = () => {
    localStorage.removeItem('xenon_candidate');
    navigate('/');
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Finished
      setIsSubmitting(true);
      setShowToast(true);
      setTimeout(() => {
        navigate('/candidate-interview-score');
      }, 3000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const initial = candidate.firstName.charAt(0).toUpperCase();
  const displayNumbers = currentQuestion <= 5 ? [1, 2, 3, 4, 5] : [6, 7, 8, 9, 10];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      {showToast && (
        <div style={{
          position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)',
          background: '#FFFFFF', padding: '16px 24px', borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 9999, display: 'flex',
          alignItems: 'center', gap: '15px', borderLeft: '5px solid var(--primary-color)',
          animation: 'slideDown 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          minWidth: '340px'
        }}>
          <div style={{
            background: 'var(--sidebar-active-bg)', color: 'var(--primary-color)', borderRadius: '50%', width: '28px', height: '28px',
            display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0
          }}>
            ✓
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, color: '#111', fontSize: '15px', fontWeight: 'bold' }}>Success</h4>
            <p style={{ margin: '2px 0 0', color: '#4B5563', fontSize: '14px' }}>Interview has successfully submitted.</p>
          </div>
        </div>
      )}
      
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
            color: '#4B5563', cursor: 'pointer'
          }} onClick={() => navigate('/candidate-applied-jobs')}>
            <FiUsers size={22} />
            <span style={{ fontWeight: '500', fontSize: '16px' }}>Applied Jobs</span>
          </div>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', 
            background: 'var(--sidebar-active-bg)', color: '#111', cursor: 'pointer',
            borderLeft: '4px solid var(--primary-color)'
          }}>
            <FiClipboard size={22} color="var(--primary-color)" />
            <span style={{ fontWeight: '600', fontSize: '16px' }}>Interview</span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #E5E7EB', paddingBottom: '20px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <FiArrowLeft size={28} color="#111" />
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#111', margin: 0 }}>Automated Interview</h1>
        </div>

        {/* Outer Container */}
        <div style={{ 
          border: '2px solid var(--primary-color)', borderRadius: '24px', padding: '20px', 
          background: '#FFFFFF', minHeight: '600px', display: 'flex', flexDirection: 'column'
        }}>
          
          {/* Inner Question Card */}
          <div style={{ 
            border: '2px solid #E2D9FC', borderRadius: '20px', padding: '40px', 
            flex: 1, display: 'flex', flexDirection: 'column', position: 'relative'
          }}>
            
            {/* Question Header & Timer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--primary-color)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontSize: '22px', fontWeight: 'bold', color: '#111'
                }}>
                  {currentQuestion}
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111', margin: 0 }}>Question</h2>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111' }}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Question Text */}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '15px' }}>
                Data Integrity & Transaction Handling:
              </h3>
              <p style={{ fontSize: '15px', color: '#111', lineHeight: '1.6', marginBottom: '30px' }}>
                "You are designing a banking application database. There are Accounts (AccountID, Balance) and Transactions (TransactionID, FromAccount, ToAccount, Amount, TransactionDate). Explain how you would ensure that money is not lost or duplicated during a transfer between accounts. Write SQL statements or pseudo-code to demonstrate the transaction handling using appropriate SQL commands."
              </p>
            </div>

            {/* Text Area */}
            <div style={{ marginTop: 'auto' }}>
              <textarea 
                placeholder="Type here......"
                style={{
                  width: '100%', minHeight: '120px', background: '#E2E8F0', border: 'none',
                  borderRadius: '30px', padding: '20px 30px', fontSize: '15px',
                  color: '#111', resize: 'none', outline: 'none'
                }}
              ></textarea>
            </div>
            
          </div>

          {/* Progress Indicator */}
          <div style={{ padding: '30px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            {/* The line connecting circles */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '2px', background: 'var(--primary-color)', zIndex: 0 }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '350px', position: 'relative', zIndex: 1 }}>
              {displayNumbers.map(num => (
                <div key={num} style={{ 
                  width: '45px', height: '45px', borderRadius: '50%', background: '#FFFFFF',
                  border: `2px solid var(--primary-color)`,
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontSize: '16px', fontWeight: 'bold', color: '#111',
                  boxShadow: num === currentQuestion ? '0 0 0 4px rgba(156, 137, 248, 0.2)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
            <button 
              onClick={handleNext}
              disabled={isSubmitting}
              style={{
                background: 'var(--primary-color)', color: 'white', border: 'none',
                padding: '12px 60px', borderRadius: '30px', fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '16px', transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(156, 137, 248, 0.4)', opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Submitting...' : (currentQuestion === totalQuestions ? 'Submit' : 'Next')}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CandidateInterview;
