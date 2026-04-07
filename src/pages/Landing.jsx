import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      {/* Navbar */}
      <nav className="landing-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '40px', height: '40px', border: '1px solid #ddd', 
            borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontWeight: 'bold', fontSize: '18px'
          }}>
            Xr
          </div>
          <span style={{ fontSize: '20px', letterSpacing: '2px', fontWeight: '300' }}>XENON</span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-content">
        <div className="hero-text">
          <h1 style={{ fontSize: '54px', fontWeight: '600', color: '#111', lineHeight: '1.2', marginBottom: '20px' }}>
            Fastest way to match<br />people with purpose
          </h1>
          <p style={{ fontSize: '18px', color: '#555', marginBottom: '40px', maxWidth: '400px' }}>
            connect companies and talent through our platform
          </p>
          <div className="hero-buttons" style={{ display: 'flex', gap: '20px' }}>
            <button onClick={() => navigate('/hire-talent')} className="btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
              Hire Talent
            </button>
            <button onClick={() => navigate('/find-role')} className="btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
              Find Your Role
            </button>
          </div>
        </div>

        {/* Mock Illustration Area */}
        <div className="hero-image">
          {/* We'll build a synthetic CSS art of the illustration or use some placeholders */}
          <div style={{ width: '500px', height: '400px', position: 'relative' }}>
            {/* Background elements */}
            <div style={{ position: 'absolute', bottom: '0', right: '50px', width: '80px', height: '120px', background: '#FFB800', borderRadius: '40px 40px 0 0' }}></div>
            <div style={{ position: 'absolute', bottom: '0', right: '150px', width: '60px', height: '150px', background: '#00D1FF', borderRadius: '30px 30px 0 0' }}></div>
            
            {/* Floating Windows */}
            <div style={{ 
              position: 'absolute', top: '20px', left: '20px', width: '250px', height: '150px', 
              background: 'white', border: '2px solid #111', borderRadius: '10px',
              padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <svg width="200" height="100" viewBox="0 0 200 100">
                <path d="M 0 80 Q 50 20 100 50 T 200 10" fill="none" stroke="#00D1FF" strokeWidth="4" />
                <path d="M 0 90 Q 50 80 100 20 T 200 60" fill="none" stroke="#FFB800" strokeWidth="4" />
              </svg>
            </div>

            <div style={{ 
              position: 'absolute', top: '100px', right: '10px', width: '280px', height: '180px', 
              background: 'white', border: '2px solid #111', borderRadius: '10px',
              padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', zIndex: 2
            }}>
               <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                 <strong>×</strong>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                 <div style={{ width: '150px', height: '30px', background: '#FFB800', borderRadius: '15px' }}></div>
                 <div style={{ width: '30px', height: '30px', background: '#D6CFFF', borderRadius: '50%' }}></div>
               </div>
            </div>

            {/* Person sitting */}
            <div style={{ position: 'absolute', bottom: '0', left: '100px', zIndex: 3 }}>
              {/* Simple CSS character representation */}
              <div style={{ width: '50px', height: '60px', background: '#5925FF', borderRadius: '20px 20px 0 0', position: 'relative', top: '20px' }}></div>
              <div style={{ width: '30px', height: '30px', background: '#FFD7B5', borderRadius: '50%', position: 'absolute', top: '-10px', left: '10px' }}></div>
              <div style={{ width: '20px', height: '80px', background: '#111', position: 'absolute', top: '80px', left: '15px' }}></div>
              <div style={{ width: '40px', height: '5px', background: '#111', position: 'absolute', top: '160px', left: '10px' }}></div>
            </div>
            
            {/* Ground Line */}
            <div style={{ position: 'absolute', bottom: '-5px', left: '-20px', width: '540px', height: '2px', background: '#111' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
