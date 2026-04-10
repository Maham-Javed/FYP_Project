import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const CandidateInterviewScore = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Back button overlay */}
      <div style={{ position: 'absolute', top: '30px', left: '40px', zIndex: 10 }}>
        <button 
          onClick={() => navigate('/candidate-dashboard')} 
          style={{ 
            background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', padding: '10px', borderRadius: '50%',
            color: 'white', transition: 'all 0.3s'
          }}
        >
          <FiArrowLeft size={24} />
        </button>
      </div>

      <div 
        className="auth-card" 
        style={{ 
          maxWidth: '550px', 
          padding: '60px 50px',
          animation: 'slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          opacity: 0,
          transform: 'translateX(50px)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111', marginBottom: '10px' }}>
            AI-Interview Score
          </h2>
          <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#111', margin: 0 }}>
            Your performance Analysis
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
          <span style={{ fontSize: '18px', fontWeight: '500', color: '#111' }}>Overall Interview Score</span>
          <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#111' }}>78 %</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111' }}>Total Questions:</span>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111', minWidth: '100px', textAlign: 'center' }}>10</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111' }}>Attempted Questions:</span>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111', minWidth: '100px', textAlign: 'center' }}>9</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111' }}>Correct Answers:</span>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111', minWidth: '100px', textAlign: 'center' }}>7</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111' }}>Duration:</span>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111', minWidth: '100px', textAlign: 'center' }}>50 min</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111' }}>Overall Performance :</span>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111', minWidth: '100px', textAlign: 'center' }}>Good</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CandidateInterviewScore;
