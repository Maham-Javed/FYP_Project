import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle, FiBookOpen, FiClock, FiActivity, FiAward } from 'react-icons/fi';

const CandidateInterviewInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { application } = location.state || {};

  return (
    <div className="auth-container" style={{ position: 'relative', height: '100vh', overflow: 'hidden', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* Back button overlay */}
      <div style={{ position: 'absolute', top: '30px', left: '40px', zIndex: 10 }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', padding: '10px', borderRadius: '50%',
            color: 'white', transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
        >
          <FiArrowLeft size={20} />
        </button>
      </div>

      <div 
        className="auth-card" 
        style={{ 
          maxWidth: '650px', 
          width: '100%',
          padding: '40px',
          borderRadius: '24px',
          animation: 'slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          opacity: 0,
          transform: 'translateX(50px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0, textAlign: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px' }}>
          Interview Information
        </h2>

        {/* Row 1: Position & Interview Type */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', marginBottom: '6px' }}>
              <FiBookOpen size={14} />
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Position</span>
            </div>
            <p style={{ fontSize: '15px', color: '#4F46E5', fontWeight: '700', margin: 0, paddingLeft: '4px' }}>
              {application?.title || 'Unknown Job'}
            </p>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', marginBottom: '6px' }}>
              <FiActivity size={14} />
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Interview Type</span>
            </div>
            <p style={{ fontSize: '15px', color: '#1E293B', fontWeight: '600', margin: 0, paddingLeft: '4px' }}>
              AI-Based Automated Interview
            </p>
          </div>
        </div>

        {/* Row 2: Questions Count & Duration */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', borderTop: '1px solid #F8FAFC', paddingTop: '10px' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', marginBottom: '6px' }}>
              <FiAward size={14} />
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Questions</span>
            </div>
            <p style={{ fontSize: '15px', color: '#1E293B', fontWeight: '600', margin: 0, paddingLeft: '4px' }}>
              5 Questions
            </p>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', marginBottom: '6px' }}>
              <FiClock size={14} />
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Interview Duration</span>
            </div>
            <p style={{ fontSize: '14px', color: '#1E293B', fontWeight: '600', margin: 0, paddingLeft: '4px' }}>
              15 min <span style={{ fontWeight: 'normal', color: '#64748B', fontSize: '12px' }}>(3m 00s per question)</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <div style={{ borderTop: '1px solid #F8FAFC', paddingTop: '10px' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Description</span>
          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
            The interview will be conducted through an AI-powered system designed to assess your technical knowledge, problem-solving ability, and communication skills. You will respond to 5 dynamic, tailored questions, where difficulty scales automatically based on your response scores.
          </p>
        </div>

        {/* Guidelines and Rules in 2-column Grid */}
        <div style={{ borderTop: '1px solid #F8FAFC', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', marginBottom: '10px' }}>
            <FiAlertTriangle size={14} color="#EF4444" />
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#EF4444' }}>Disqualification Rules</span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '8px 16px', 
            fontSize: '13px', 
            color: '#475569' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
              <span>Failure to answer required questions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
              <span>Irrelevant or copied answers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
              <span>Offensive or unprofessional language</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
              <span>Extremely low technical accuracy</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
              <span>Attempting to bypass the AI system</span>
            </div>
          </div>
        </div>

        {/* Start button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '20px', marginTop: 'auto' }}>
          <button 
            onClick={() => navigate('/candidate-interview', { state: { application } })}
            style={{
              background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)', 
              color: 'white', 
              border: 'none',
              padding: '12px 40px', 
              borderRadius: '30px', 
              fontWeight: '600',
              cursor: 'pointer', 
              fontSize: '15px', 
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Start Interview
          </button>
        </div>

      </div>
    </div>
  );
};

export default CandidateInterviewInfo;
