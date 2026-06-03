import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBriefcase, FiUsers, FiStar } from 'react-icons/fi';
import logoUrl from '../assets/logo.svg';

const Landing = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="animated-gradient-bg" style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Background Elements */}
      <div 
        className="float-animation"
        style={{
          position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px',
          background: 'linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(139,92,246,0.2) 100%)',
          borderRadius: '50%', filter: 'blur(40px)', zIndex: 0,
          transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`
        }}
      ></div>
      <div 
        className="float-animation"
        style={{
          position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px',
          background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 100%)',
          borderRadius: '50%', filter: 'blur(60px)', zIndex: 0,
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
          animationDelay: '1s'
        }}
      ></div>

      {/* Navbar */}
      <nav className="landing-nav glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 40px', position: 'relative', zIndex: 10, margin: '15px 15px 5px 15px', borderRadius: '16px' }}>
        <div>
          <img src={logoUrl} alt="Xenon AI" style={{ height: '28px' }} />
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => navigate('/hire-talent')} style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)', cursor: 'pointer', padding: '8px 12px', transition: 'all 0.2s' }} className="nav-btn">
            For Recruiters
          </button>
          <button onClick={() => navigate('/find-role')} style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)', cursor: 'pointer', padding: '8px 12px', transition: 'all 0.2s' }} className="nav-btn">
            For Candidates
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-content" style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', justifyContent: 'center', flex: 1, position: 'relative', zIndex: 10, padding: '0 20px 20px 20px' }}>
        
        <div className="glass-card animate-slide-up" style={{ padding: '40px 35px', borderRadius: '28px', maxWidth: '780px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(79,70,229,0.08)', color: 'var(--primary-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '650', marginBottom: '18px' }}>
            <FiStar /> The Future of Hiring is Here
          </div>

          <h1 style={{ fontSize: '46px', fontWeight: '800', color: 'var(--text-dark)', lineHeight: '1.2', marginBottom: '14px', letterSpacing: '-0.02em' }}>
            Match with Purpose.<br/>
            <span style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Powered by AI.
            </span>
          </h1>
          
          <p style={{ fontSize: '16.5px', color: 'var(--text-light)', marginBottom: '30px', maxWidth: '480px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
            Whether you're building a world-class team or looking for your next big adventure, Xenon intelligently connects talent with opportunity.
          </p>
          
          <div className="hero-buttons" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/hire-talent')} 
              className="btn-primary pulse-glow" 
              style={{ padding: '12px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '10px', fontWeight: '600' }}
            >
              <FiUsers size={18} /> I'm Hiring Talent
            </button>
            <button 
              onClick={() => navigate('/find-role')} 
              className="btn-primary" 
              style={{ background: 'white', border: '1.5px solid var(--border-light)', color: 'var(--text-dark)', padding: '12px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '10px', fontWeight: '600', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-dark)'; }}
            >
              <FiBriefcase size={18} /> I'm Looking for a Job
            </button>
          </div>

        </div>

        {/* Small floating stats underneath */}
        <div className="animate-slide-up stagger-3" style={{ display: 'flex', justifyContent: 'center', gap: '45px', marginTop: '30px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-color)' }}>98%</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Match Accuracy</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-color)' }}>10x</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Faster Hiring</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-color)' }}>24/7</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>AI Screening</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;
