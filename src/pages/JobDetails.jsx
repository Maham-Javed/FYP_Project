import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const jobs = JSON.parse(localStorage.getItem('xenon_jobs') || '[]');
    if (jobs[id]) {
      setJob(jobs[id]);
    } else {
      navigate('/dashboard'); // Job not found
    }
  }, [id, navigate]);

  const handleDelete = () => {
    const jobs = JSON.parse(localStorage.getItem('xenon_jobs') || '[]');
    jobs.splice(id, 1);
    localStorage.setItem('xenon_jobs', JSON.stringify(jobs));
    navigate('/dashboard');
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
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Job Description:</h3>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.5' }}>
            {job.description || "No description provided."}
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Required Experience:</h3>
          <ul style={{ fontSize: '14px', color: '#444', lineHeight: '1.5', paddingLeft: '20px' }}>
            <li>{job.experience ? `${job.experience} years of experience` : "Experience not specified"}</li>
            <li>{job.qualification ? `Qualification: ${job.qualification}` : "Qualification not specified"}</li>
            <li>{job.careerLevel ? `Career Level: ${job.careerLevel}` : "Career Level not specified"}</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Required Skills:</h3>
          <ul style={{ fontSize: '14px', color: '#444', lineHeight: '1.5', paddingLeft: '20px' }}>
            {job.skills ? (
              job.skills.split(',').map((skill, i) => <li key={i}>{skill.trim()}</li>)
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
