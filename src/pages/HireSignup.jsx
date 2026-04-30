import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../supabaseClient';
// HireSignup Component
// This component handles the sign-up and sign-in process for recruiters.
// It integrates with Supabase Authentication to manage user credentials and roles.
const HireSignup = () => {
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    company: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignIn) {
        // Sign In via Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (error) throw error;
        localStorage.setItem('xenon_session', JSON.stringify(data.session));
      } else {
        // Sign Up via Supabase
        const { error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              name: `${formData.firstName} ${formData.lastName}`.trim() || 'Recruiter',
              role: 'recruiter',
              company_name: formData.company || 'Unknown Company'
            }
          }
        });

        if (error) throw error;
      }
      setPopupMessage(`Successfully ${isSignIn ? 'Signed in' : 'Signed up'} as a Recruiter`);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const closePopup = () => {
    setPopupMessage('');
    navigate('/dashboard');
  };

  // Clear the popup message after 3 seconds
  useEffect(() => {
    let timer;
    if (popupMessage) {
      timer = setTimeout(() => {
        setPopupMessage('');
        navigate('/dashboard');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [popupMessage, navigate]);

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
          <p>Sign up/Sign in as a Recruiter</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!isSignIn && (
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
          )}

          {!isSignIn && (
            <div className="form-group">
              <label>Company</label>
              <input name="company" onChange={handleChange} type="text" className="form-input" placeholder="eg: Unilever" />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input name="email" onChange={handleChange} required type="email" className="form-input" placeholder="eg: johndoe@unilever.com" />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input name="password" onChange={handleChange} type="password" required className="form-input" placeholder="********" />
          </div>

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

export default HireSignup;
