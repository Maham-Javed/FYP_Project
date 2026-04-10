import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PostJob = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    careerLevel: '',
    positions: '',
    skills: '',
    location: '',
    qualification: '',
    experience: '',
    threshold: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePost = (e) => {
    e.preventDefault();
    
    // Fetch existing jobs from localStorage or start empty array
    const existingJobs = JSON.parse(localStorage.getItem('xenon_jobs') || '[]');
    
    // Add new job (with 0 applied/shortlisted stats initially)
    const newJob = {
      id: Date.now().toString(),
      title: formData.title || 'Untitled Job',
      description: formData.description || 'No description provided for this job. This is a generic default message.',
      careerLevel: formData.careerLevel || '',
      positions: formData.positions || '',
      skills: formData.skills || 'HTML, CSS, JavaScript, React',
      location: formData.location || 'Karachi',
      qualification: formData.qualification || 'Bachelors',
      experience: formData.experience || '1-3 years',
      threshold: formData.threshold || '70%',
      applied: 0,
      shortlisted: 0,
      topScorer: 0
    };
    
    localStorage.setItem('xenon_jobs', JSON.stringify([...existingJobs, newJob]));
    
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px', animation: 'slideInRight 0.5s ease-out forwards' }}>
        <div className="auth-header" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '32px' }}>Post Job</h2>
        </div>
        
        <form onSubmit={handlePost}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Job Title:</label>
            <input name="title" onChange={handleChange} required type="text" className="form-input" placeholder="ie: Junior Node develpor" />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Job description:</label>
            <input name="description" onChange={handleChange} type="text" className="form-input" placeholder="ie:helping the team with all the coding and software design tasks" />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: '0' }}>
              <label>Required Career Level:</label>
              <input name="careerLevel" onChange={handleChange} type="text" className="form-input" placeholder="eg: Beginner" />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: '0' }}>
              <label>No of Position avaliable:</label>
              <input name="positions" onChange={handleChange} type="number" className="form-input" placeholder="eg:4" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Skills Required:</label>
            <input name="skills" onChange={handleChange} type="text" className="form-input" placeholder="eg:node, React etc" />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Job Location:</label>
            <input name="location" onChange={handleChange} type="text" className="form-input" placeholder="ie: Karachi" />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Qualification:</label>
            <input name="qualification" onChange={handleChange} type="text" className="form-input" placeholder="e.g: Bachelor" />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Experience:</label>
            <input name="experience" onChange={handleChange} type="text" className="form-input" placeholder="in years" />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Passing threshold:</label>
            <input name="threshold" onChange={handleChange} type="text" className="form-input" placeholder="eg: 75%" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="submit" className="btn-primary auth-btn" style={{ padding: '12px 30px' }}>Post</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
