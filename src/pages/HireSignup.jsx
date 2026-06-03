import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="auth-container animated-gradient-bg" style={{ height: '100vh', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative' }}>
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

      <div className="auth-card" style={{ 
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        borderRadius: '24px',
        padding: '35px 40px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 40px rgba(31, 38, 135, 0.05)',
        animation: 'slideInRight 0.5s ease-out forwards'
      }}>
        <div className="auth-header" style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '6px' }}>
            {isSignIn ? "Welcome Back" : "Sign Up"}
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-light)', margin: 0 }}>
            {isSignIn ? "Sign in to access your recruitment dashboard" : "Register as a Recruiter to hire top talent"}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isSignIn && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>First Name</label>
                <input name="firstName" onChange={handleChange} required type="text" className="form-input" placeholder="eg: John" style={{ padding: '10px 14px', fontSize: '13.5px', borderRadius: '8px' }} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>Last Name</label>
                <input name="lastName" onChange={handleChange} required type="text" className="form-input" placeholder="eg: Doe" style={{ padding: '10px 14px', fontSize: '13.5px', borderRadius: '8px' }} />
              </div>
            </div>
          )}

          {!isSignIn && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>Company</label>
              <input name="company" onChange={handleChange} type="text" className="form-input" placeholder="eg: Unilever" style={{ padding: '10px 14px', fontSize: '13.5px', borderRadius: '8px' }} />
            </div>
          )}
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>Email</label>
            <input name="email" onChange={handleChange} required type="email" className="form-input" placeholder="eg: johndoe@unilever.com" style={{ padding: '10px 14px', fontSize: '13.5px', borderRadius: '8px' }} />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>Password</label>
            <input name="password" onChange={handleChange} type="password" required className="form-input" placeholder="********" style={{ padding: '10px 14px', fontSize: '13.5px', borderRadius: '8px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <button 
              type="submit" 
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(79, 70, 229, 0.15)'
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.25)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.15)'; }}
            >
              {isSignIn ? "Sign In" : "Create Account"}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '15px' }}>
          <span style={{ fontSize: '13.5px', color: '#6B7280' }}>
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            type="button" 
            onClick={() => setIsSignIn(!isSignIn)} 
            style={{ 
              background: 'none', border: 'none', color: '#4F46E5', 
              fontWeight: '700', cursor: 'pointer', fontSize: '13.5px', padding: 0
            }}
          >
            {isSignIn ? "Register Here" : "Sign In Here"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HireSignup;
