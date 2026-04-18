import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { supabase } from '../supabaseClient';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

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
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px', animation: 'slideInRight 0.5s ease-out forwards', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111' }}>
            {job.title || 'Untitled Job'}
          </h2>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111' }}
            >
              <FiMenu size={24} />
            </button>
            
            {showMenu && (
              <div style={{
                position: 'absolute',
                right: '0',
                top: '30px',
                background: 'white',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 10,
                minWidth: '120px',
                overflow: 'hidden'
              }}>
                <button 
                  onClick={handleEdit}
                  style={{ display: 'block', width: '100%', padding: '10px 15px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}
                >
                  Edit
                </button>
                <button 
                  onClick={handleDelete}
                  style={{ display: 'block', width: '100%', padding: '10px 15px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Job Features:</h3>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.5' }}>
            Passing Threshold: {job.passing_threshold}%
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Required Experience:</h3>
          <ul style={{ fontSize: '14px', color: '#444', lineHeight: '1.5', paddingLeft: '20px' }}>
            <li>{job.experience_level ? `${job.experience_level} years of experience` : "Experience not specified"}</li>
            <li>Interview Difficulty: {job.interview_difficulty || "Not specified"}</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Required Skills:</h3>
          <ul style={{ fontSize: '14px', color: '#444', lineHeight: '1.5', paddingLeft: '20px' }}>
            {job.required_skill ? (
              job.required_skill.split(',').map((skill, i) => <li key={i}>{skill.trim()}</li>)
            ) : (
              <li>No specific skills listed.</li>
            )}
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ padding: '8px 24px', background: '#ccc', color: '#111', boxShadow: 'none' }}>
            Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default JobDetails;
