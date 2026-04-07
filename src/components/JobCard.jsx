import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const JobCard = ({ id, title, applied, shortlisted, topScorer }) => {
  const navigate = useNavigate();
  return (
    <div style={{
      border: '2px solid #E2D9FC',
      borderRadius: '24px',
      padding: '24px',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      position: 'relative',
      transition: 'transform 0.2s',
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
    }}
    onClick={() => navigate(`/job/${id}`)}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', marginBottom: '10px' }}>
        {title}
      </h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#111', fontWeight: '500' }}>
        <span>Total Candidates applied:</span>
        <span>{applied}</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#111', fontWeight: '500' }}>
        <span>Shortlisted for Interview:</span>
        <span>{shortlisted}</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#111', fontWeight: '500' }}>
        <span>Top Scorer:</span>
        <span>{topScorer}</span>
      </div>

      <div style={{ alignSelf: 'flex-end', marginTop: '10px', color: '#111' }}>
        <FiArrowRight size={24} />
      </div>
    </div>
  );
};

export default JobCard;
