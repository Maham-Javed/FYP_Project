import React from 'react';
import { FiArrowRight, FiUsers, FiClipboard, FiAward, FiBriefcase } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const JobCard = ({ id, title, applied, shortlisted, topScorer }) => {
  const navigate = useNavigate();
  return (
    <div 
      className="job-card"
      onClick={() => navigate(`/job/${id}`)}
    >
      {/* Title and Icon Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{ 
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: '#EEF2FF', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#4F46E5',
          flexShrink: 0
        }}>
          <FiBriefcase size={20} />
        </div>
        <h3 style={{ 
          fontSize: '17px', 
          fontWeight: '700', 
          color: '#0F172A', 
          margin: 0, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap' 
        }}>
          {title}
        </h3>
      </div>

      {/* Metrics Row List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
        
        {/* Total Candidates Applied */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '10px 14px', 
          background: '#F8FAFC', 
          borderRadius: '12px', 
          border: '1px solid #F1F5F9' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiUsers size={16} color="#4F46E5" />
            <span style={{ fontSize: '13.5px', fontWeight: '500', color: '#475569' }}>Total Applied</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{applied}</span>
        </div>

        {/* Shortlisted for Interview */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '10px 14px', 
          background: '#F8FAFC', 
          borderRadius: '12px', 
          border: '1px solid #F1F5F9' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiClipboard size={16} color="#10B981" />
            <span style={{ fontSize: '13.5px', fontWeight: '500', color: '#475569' }}>Shortlisted</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{shortlisted}</span>
        </div>

        {/* Top Scorer */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '10px 14px', 
          background: '#F8FAFC', 
          borderRadius: '12px', 
          border: '1px solid #F1F5F9' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiAward size={16} color="#F59E0B" />
            <span style={{ fontSize: '13.5px', fontWeight: '500', color: '#475569' }}>Top Score</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
            {topScorer > 0 ? `${topScorer}%` : '0%'}
          </span>
        </div>

      </div>

      {/* Card Footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: 'auto', 
        paddingTop: '14px', 
        borderTop: '1px solid #F1F5F9' 
      }}>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: '600', 
          color: '#94A3B8', 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px' 
        }}>
          Manage Candidates
        </span>
        <div className="arrow-icon-container" style={{ 
          width: '30px', 
          height: '30px', 
          borderRadius: '50%', 
          background: '#F8FAFC', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          color: '#4F46E5',
          transition: 'all 0.2s ease-in-out'
        }}>
          <FiArrowRight size={16} />
        </div>
      </div>
    </div>
  );
};

export default JobCard;

