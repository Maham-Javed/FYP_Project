import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CandidateJobApply = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: ''
  });
  const [cvFile, setCvFile] = useState(null);
  const [cvFilename, setCvFilename] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Populate known data from localStorage
    const candData = localStorage.getItem('xenon_candidate');
    if (candData) {
      try {
        const parsed = JSON.parse(candData);
        setFormData(prev => ({
          ...prev,
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          email: parsed.email || ''
        }));
        if (parsed.cvFilename) {
          setCvFilename(parsed.cvFilename);
        }
      } catch (e) {}
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
      setCvFilename(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsApplying(true);
    
    // Simulate application process
    setTimeout(() => {
      // Could push to a stored applications list here
      setIsApplying(false);
      setShowToast(true);
      setTimeout(() => {
        navigate('/candidate-dashboard');
      }, 2500);
    }, 1500);
  };

  return (
    <div className="auth-container">
      {showToast && (
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
            <h4 style={{ margin: 0, color: '#111', fontSize: '15px', fontWeight: 'bold' }}>Application Sent</h4>
            <p style={{ margin: '2px 0 0', color: '#4B5563', fontSize: '14px' }}>Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      <div className="auth-card" style={{ maxWidth: '550px', position: 'relative', padding: '50px' }}>
        <div className="auth-header" style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#111' }}>Submit your Application</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>First Name</label>
            <input 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              required 
              type="text" 
              className="form-input" 
              placeholder="eg:John" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>Last Name</label>
            <input 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              required 
              type="text" 
              className="form-input" 
              placeholder="eg:Doe" 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>Email</label>
            <input 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              type="email" 
              className="form-input" 
              placeholder="eg:johndeo@gmail.com" 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>Mobile no</label>
            <input 
              name="mobile" 
              value={formData.mobile} 
              onChange={handleChange} 
              required 
              type="text" 
              className="form-input" 
              placeholder="********" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>Gender</label>
            <input 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange} 
              required 
              type="text" 
              className="form-input" 
              placeholder="eg:Male" 
            />
          </div>

          {/* CV Upload Section replacing traditional input structure */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
            <div style={{ 
              border: '1px solid #E5E7EB', padding: '12px 16px', borderRadius: '8px', 
              color: '#9CA3AF', fontSize: '14px', flex: 1, minWidth: '0', 
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {cvFilename || 'uploaded_CV.pdf'}
            </div>
            
            <input 
              type="file" 
              id="cv-upload-apply" 
              style={{ display: 'none' }} 
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <label htmlFor="cv-upload-apply" style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              color: '#111', fontWeight: '500', flexShrink: 0
            }}>
              <span style={{ fontSize: '18px' }}>+</span> 
              <span style={{ fontSize: '14px' }}>Upload CV</span>
            </label>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button 
              type="submit" 
              disabled={isApplying}
              style={{
                background: 'var(--primary-color)', color: 'white', border: 'none',
                padding: '12px 35px', borderRadius: '20px', fontWeight: '500',
                cursor: isApplying || showToast ? 'not-allowed' : 'pointer', fontSize: '15px',
                opacity: isApplying || showToast ? 0.7 : 1, transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(156, 137, 248, 0.3)'
              }}
            >
              {isApplying ? 'Submitting...' : 'Apply'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CandidateJobApply;
