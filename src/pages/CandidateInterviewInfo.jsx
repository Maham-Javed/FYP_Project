import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const CandidateInterviewInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Back button overlay */}
      <div style={{ position: 'absolute', top: '30px', left: '40px', zIndex: 10 }}>
        <button 
          onClick={() => navigate(-1)} 
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
          maxWidth: '650px', 
          padding: '50px 40px',
          animation: 'slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          opacity: 0,
          transform: 'translateX(50px)'
        }}
      >
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111', marginBottom: '35px', textAlign: 'center' }}>
          Interview Information
        </h2>
        
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '8px' }}>Interview Type</h3>
          <p style={{ fontSize: '15px', color: '#444', paddingLeft: '15px', margin: 0 }}>
            AI-Based Automated Interview
          </p>
        </div>

        <div style={{ display: 'flex', gap: '40px', marginBottom: '25px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: 0 }}>
            Total Interview Question: <span style={{ fontWeight: 'normal', color: '#444', marginLeft: '10px' }}>10</span>
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: 0 }}>
            Interview Duration: <span style={{ fontWeight: 'normal', color: '#444', marginLeft: '10px' }}>25-30min</span>
          </h3>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '15px' }}>Description:</h3>
          <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.6', marginBottom: '15px' }}>
            The interview will be conducted through an AI-powered system designed to assess the candidate's technical knowledge, problem-solving ability, and communication skills. Candidates will respond to a mix of technical, scenario-based, and behavioral questions. Responses may be in the form of multiple-choice answers, short written responses, or recorded video/audio answers. The AI system evaluates answers based on accuracy, clarity, relevance, and confidence.
          </p>
          <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.6', marginBottom: '10px' }}>
            Candidates may be automatically disqualified if any of the following are detected:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#444', fontSize: '15px', lineHeight: '1.6' }}>
            <li>Failure to answer the minimum required number of questions</li>
            <li>Irrelevant or copied responses</li>
            <li>Use of offensive, inappropriate, or unprofessional language</li>
            <li>Extremely low technical accuracy score</li>
            <li>Attempting to bypass or manipulate the AI interview system</li>
          </ul>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
          <button 
            style={{
              background: 'var(--primary-color)', color: 'white', border: 'none',
              padding: '14px 45px', borderRadius: '30px', fontWeight: '600',
              cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(156, 137, 248, 0.4)'
            }}
          >
            Start
          </button>
        </div>

      </div>
    </div>
  );
};

export default CandidateInterviewInfo;
