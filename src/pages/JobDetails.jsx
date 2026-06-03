import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiArrowLeft, FiActivity, FiTarget, FiBriefcase } from 'react-icons/fi';
import { supabase } from '../supabaseClient';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase.from('jobs').select('*').eq('job_id', id).single();
      if (error || !data) {
        navigate('/dashboard'); // Job not found
      } else {
        setJob(data);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this job? All applications tied to it will also be deleted.");
    if (!confirmed) return;

    try {
      // Delete any applications associated with this job first to satisfy foreign key constraints
      await supabase.from('applications').delete().eq('job_id', id);
      
      // Delete the job itself
      const { error } = await supabase.from('jobs').delete().eq('job_id', id);
      if (error) throw error;
      
      navigate('/dashboard');
    } catch (err) {
      alert("Error deleting job: " + err.message);
    }
  };

  const handleEdit = () => {
    navigate(`/edit-job/${id}`);
  };

  if (!job) return null;

  return (
    <div className="auth-container animated-gradient-bg" style={{ height: '100vh', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)' }}>
      <div className="auth-card" style={{ 
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '700px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        animation: 'slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => navigate('/dashboard')} 
              style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#4F46E5', transition: 'all 0.2s', flexShrink: 0 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
              title="Back to Dashboard"
            >
              <FiArrowLeft size={22} />
            </button>
            <div>
              <span style={{ 
                background: '#EEF2FF', color: '#4F46E5', padding: '6px 12px', borderRadius: '8px', 
                fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
                display: 'inline-block', marginBottom: '8px'
              }}>
                Job Overview
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: 0, lineHeight: '1.2' }}>
                {job.title || 'Untitled Job'}
              </h2>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleEdit}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
                background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE', borderRadius: '12px', 
                fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E0E7FF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#EEF2FF'; }}
            >
              <FiEdit2 size={16} /> Edit
            </button>
            <button 
              onClick={handleDelete}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
                background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '12px', 
                fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
            >
              <FiTrash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '28px', height: '28px', background: '#E0E7FF', borderRadius: '6px', color: '#4F46E5' }}>
                  <FiTarget size={14} />
                </span>
                Job Features
              </h3>
              <div style={{ paddingLeft: '36px' }}>
                <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 5px 0' }}>Passing Threshold:</p>
                <p style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>{job.passing_threshold}%</p>
              </div>
            </div>

            <div style={{ flex: 1, background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '28px', height: '28px', background: '#FEF3C7', borderRadius: '6px', color: '#D97706' }}>
                  <FiBriefcase size={14} />
                </span>
                Experience
              </h3>
              <div style={{ paddingLeft: '36px' }}>
                <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 5px 0' }}>Required:</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', margin: '0 0 8px 0' }}>{job.experience_level ? `${job.experience_level} years` : "Not specified"}</p>
                <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 5px 0' }}>Difficulty:</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', margin: 0, textTransform: 'capitalize' }}>{job.interview_difficulty || "Not specified"}</p>
              </div>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '28px', height: '28px', background: '#D1FAE5', borderRadius: '6px', color: '#059669' }}>
                <FiActivity size={14} />
              </span>
              Required Skills
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingLeft: '36px' }}>
              {job.required_skill ? (
                job.required_skill.split(',').map((skill, i) => (
                  <span key={i} style={{ background: '#FFFFFF', padding: '8px 16px', borderRadius: '20px', fontSize: '13.5px', fontWeight: '500', color: '#0F172A', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    {skill.trim()}
                  </span>
                ))
              ) : (
                <span style={{ color: '#64748B', fontSize: '14px' }}>No specific skills listed.</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobDetails;
