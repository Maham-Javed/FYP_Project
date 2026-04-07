import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

const RoleSignup = () => {
  const navigate = useNavigate();
  const [cvFile, setCvFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    alert('Sign up submitted for role!');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Sign Up</h2>
          <p>Enter your information to create account</p>
        </div>
        
        <form onSubmit={handleSignup}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>First Name</label>
              <input type="text" className="form-input" placeholder="eg: Sara" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Last Name</label>
              <input type="text" className="form-input" placeholder="eg: Akram" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-input" placeholder="eg: saraakram@gmail.com" />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-input" placeholder="********" />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="file" 
              id="cv-upload" 
              style={{ display: 'none' }} 
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <label htmlFor="cv-upload" style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
              color: 'var(--text-dark)'
            }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>+</span> 
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {cvFile ? cvFile.name : 'Upload Cv'}
              </span>
            </label>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px' }}>
            <button type="submit" className="btn-primary auth-btn">Sign Up</button>
          </div>
        </form>

        <div className="auth-footer">
          <div className="divider">OR</div>
          <button className="google-btn">
            <FcGoogle className="google-icon" /> Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSignup;
