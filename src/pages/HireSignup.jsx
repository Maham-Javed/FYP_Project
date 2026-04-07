import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

const HireSignup = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    localStorage.setItem('xenon_recruiter', JSON.stringify({
      firstName: formData.firstName || 'John',
      lastName: formData.lastName || 'Doe',
      email: formData.email || 'johndoe@unilever.com'
    }));
    navigate('/dashboard');
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
              <input name="firstName" onChange={handleChange} required type="text" className="form-input" placeholder="eg: John" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Last Name</label>
              <input name="lastName" onChange={handleChange} required type="text" className="form-input" placeholder="eg: Doe" />
            </div>
          </div>

          <div className="form-group">
            <label>Company</label>
            <input name="company" type="text" className="form-input" placeholder="eg: Unilever" />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input name="email" onChange={handleChange} required type="email" className="form-input" placeholder="eg: johndoe@unilever.com" />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-input" placeholder="********" />
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

export default HireSignup;
