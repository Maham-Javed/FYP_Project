import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const EditJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
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

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase.from('jobs').select('*').eq('job_id', id).single();
      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          careerLevel: data.interview_difficulty || '',
          positions: data.positions?.toString() || '',
          skills: data.required_skill || '',
          location: data.location || '',
          qualification: data.qualification || '',
          experience: data.experience_level || '',
          threshold: data.passing_threshold?.toString() || ''
        });
      } else {
        navigate('/dashboard');
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('jobs').update({
        title: formData.title || 'Untitled Job',
        description: formData.description || '',
        location: formData.location || '',
        qualification: formData.qualification || '',
        positions: parseInt(formData.positions) || 1,
        required_skill: formData.skills || 'Not specified',
        experience_level: formData.experience || 'Not specified',
        interview_difficulty: formData.careerLevel || 'intermediate',
        passing_threshold: parseInt(formData.threshold) || 70
      }).eq('job_id', id);

      if (error) throw error;
      navigate(`/job/${id}`);
    } catch (err) {
      alert("Error updating job: " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px', animation: 'slideInRight 0.5s ease-out forwards' }}>
        <div className="auth-header" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '32px' }}>Edit Job</h2>
        </div>
        
        <form onSubmit={handleEdit}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Job Title:</label>
            <input name="title" value={formData.title} onChange={handleChange} required type="text" className="form-input" placeholder="ie: Junior Node develpor" />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Job description:</label>
            <input name="description" value={formData.description} onChange={handleChange} type="text" className="form-input" placeholder="ie:helping the team with all the coding and software design tasks" />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: '0' }}>
              <label>Required Career Level:</label>
              <input name="careerLevel" value={formData.careerLevel} onChange={handleChange} type="text" className="form-input" placeholder="eg: Beginner" />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: '0' }}>
              <label>No of Position avaliable:</label>
              <input name="positions" value={formData.positions} onChange={handleChange} type="number" className="form-input" placeholder="eg:4" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Skills Required:</label>
            <input name="skills" value={formData.skills} onChange={handleChange} type="text" className="form-input" placeholder="eg:node, React etc" />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Job Location:</label>
            <input name="location" value={formData.location} onChange={handleChange} type="text" className="form-input" placeholder="ie: Karachi" />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Qualification:</label>
            <input name="qualification" value={formData.qualification} onChange={handleChange} type="text" className="form-input" placeholder="e.g: Bachelor" />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Experience:</label>
            <input name="experience" value={formData.experience} onChange={handleChange} type="text" className="form-input" placeholder="in years" />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Passing threshold:</label>
            <input name="threshold" value={formData.threshold} onChange={handleChange} type="text" className="form-input" placeholder="eg: 75%" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
            <button type="button" onClick={() => navigate(`/job/${id}`)} className="btn-primary" style={{ padding: '12px 30px', background: '#ccc', color: '#111', boxShadow: 'none' }}>Cancel</button>
            <button type="submit" className="btn-primary auth-btn" style={{ padding: '12px 30px' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;
