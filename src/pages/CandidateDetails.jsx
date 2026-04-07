import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const CandidateDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [jobDesc, setJobDesc] = useState('');

  const cand = state?.cand;

  useEffect(() => {
    if (!cand) {
      navigate('/top-scorers');
      return;
    }

    const jobs = JSON.parse(localStorage.getItem('xenon_jobs') || '[]');
    const matchedJob = jobs.find(j => j.title === cand.jobPosition);
    if (matchedJob) {
      setJobDesc(matchedJob.description);
    }
  }, [cand, navigate]);

  if (!cand) return null;

  // Make avatar initials
  let initial = cand.name.substring(0, 2).toUpperCase();
  if (cand.name.includes(' ')) {
     initial = cand.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
  }

  // Generate mock sub-scores based on overall score for UI
  const cvMatching = (cand.score - 5).toFixed(1);
  const interviewScore = (cand.score - 2).toFixed(1);

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px', animation: 'slideInRight 0.5s ease-out forwards', position: 'relative' }}>
        
        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <FiArrowLeft size={24} />
        </button>

        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', marginTop: '10px' }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', background: '#E2D9FC', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#111', fontSize: '24px', fontWeight: '600' 
          }}>
            {initial}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '0' }}>{cand.name}</h2>
            <p style={{ fontSize: '14px', color: '#111', fontWeight: '500', margin: '0' }}>{cand.email}</p>
          </div>
        </div>

        {/* Job Description */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#111' }}>Job Description:</h3>
          <p style={{ fontSize: '14px', color: '#111', lineHeight: '1.5' }}>
            {jobDesc || "The candidate applied for a position without a specific description."}
          </p>
        </div>

        {/* Scores */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', width: '200px' }}>CV Matching:</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111' }}>{cvMatching}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', width: '200px' }}>Interview Score:</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111' }}>{interviewScore}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', width: '200px' }}>Total Score:</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111' }}>{cand.score.toFixed(1)}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button onClick={() => navigate('/top-scorers')} className="btn-primary" style={{ padding: '12px 30px', width: '140px', textAlign: 'center' }}>
            Accept
          </button>
          <button onClick={() => navigate('/top-scorers')} className="btn-primary" style={{ padding: '12px 30px', width: '140px', textAlign: 'center' }}>
            Reject
          </button>
        </div>

      </div>
    </div>
  );
};

export default CandidateDetails;
