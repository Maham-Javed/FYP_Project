import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

const RoleSignup = () => {
  const navigate = useNavigate();
  const [cvFile, setCvFile] = useState(null);
  const [isSignIn, setIsSignIn] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isSignIn) {
      localStorage.setItem('xenon_candidate', JSON.stringify({
        firstName: formData.firstName || 'Sara',
        lastName: formData.lastName || 'Akram',
        email: formData.email || 'saraakram@gmail.com',
        cvFilename: cvFile ? cvFile.name : ''
      }));
    }
    // Show success popup
    setPopupMessage(`Successfully ${isSignIn ? 'Sign in' : 'Sign up'} as a candidate`);
  };

  const closePopup = () => {
    setPopupMessage('');
    navigate('/candidate-dashboard');
  };

  useEffect(() => {
    let timer;
    if (popupMessage) {
      timer = setTimeout(() => {
        closePopup();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [popupMessage]);

  return (
    <div className="auth-container">
      {/* Toast Notification */}
      {popupMessage && (
        <div style={{
          position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)',
          background: '#FFFFFF', padding: '16px 24px', borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 9999, display: 'flex',
          alignItems: 'center', gap: '15px', borderLeft: '5px solid var(--primary-color)',
          animation: 'slideDown 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          minWidth: '320px'
        }}>
          <div style={{
            background: 'var(--sidebar-active-bg)', color: 'var(--primary-color)', borderRadius: '50%', width: '28px', height: '28px',
            display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0
          }}>
            ✓
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, color: '#111', fontSize: '15px', fontWeight: 'bold' }}>Success</h4>
            <p style={{ margin: '2px 0 0', color: '#4B5563', fontSize: '14px' }}>{popupMessage}</p>
          </div>
          <button 
            onClick={closePopup} 
            style={{ 
              background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', 
              color: '#9CA3AF', padding: '0 5px' 
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="auth-card" style={{ position: 'relative' }}>
        <div className="auth-header">
          <h2>{isSignIn ? "Sign In" : "Sign Up"}</h2>
          <p>Sign up/Sign in as a candidate</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!isSignIn && (
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>First Name</label>
                <input name="firstName" onChange={handleChange} required type="text" className="form-input" placeholder="eg: Sara" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Last Name</label>
                <input name="lastName" onChange={handleChange} required type="text" className="form-input" placeholder="eg: Akram" />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input name="email" onChange={handleChange} required type="email" className="form-input" placeholder="eg: saraakram@gmail.com" />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input required type="password" className="form-input" placeholder="********" />
          </div>

          {!isSignIn && (
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
          )}
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px' }}>
            <button type="submit" className="btn-primary auth-btn">{isSignIn ? "Sign In" : "Sign Up"}</button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            type="button" 
            onClick={() => setIsSignIn(!isSignIn)} 
            style={{ 
              background: 'none', border: 'none', color: '#6D28D9', 
              fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', padding: 0
            }}
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </button>
        </div>

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
