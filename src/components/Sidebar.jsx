import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiAward, FiPlus, FiLogOut } from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import logoUrl from '../assets/logo.svg';

const Sidebar = () => {
  const navigate = useNavigate();
  const [recruiter, setRecruiter] = useState({ firstName: '', lastName: '', email: '' });

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const parts = (user.user_metadata?.name || 'John Doe').split(' ');
        setRecruiter({
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          email: user.email
        });
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const initials = `${recruiter.firstName[0] || ''}${recruiter.lastName[0] || ''}`.toUpperCase();
  const fullName = `${recruiter.firstName} ${recruiter.lastName}`.trim() || 'Loading...';

  return (
    <div className="sidebar-mobile" style={{
      width: '260px',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      background: 'white'
    }}>
      {/* Logo */}
      <div style={{ padding: '0 24px', marginBottom: '30px' }}>
        <img src={logoUrl} alt="Xenon AI" style={{ height: '32px' }} />
      </div>

      <div style={{ padding: '0 30px', marginBottom: '20px' }}>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }}/>
      </div>

      {/* Add New Job Button */}
      <div style={{ padding: '0 30px', marginBottom: '40px' }}>
        <button onClick={() => navigate('/post-job')} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <FiPlus /> Add New Job
        </button>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <NavLink 
          to="/dashboard" 
          className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
          style={({isActive}) => ({
            display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', 
            textDecoration: 'none', color: 'var(--text-dark)', fontWeight: '600',
            background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
            borderRight: isActive ? '4px solid var(--primary-color)' : 'none'
          })}
        >
          <FiHome size={22} style={{ color: 'var(--primary-color)' }} /> Home
        </NavLink>
        
        <NavLink 
          to="/candidates" 
          className="nav-item"
          style={{
            display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', 
            textDecoration: 'none', color: 'var(--text-dark)', fontWeight: '600'
          }}
        >
          <FiUsers size={22} style={{ color: 'var(--primary-color)' }} /> Candidates
        </NavLink>

        <NavLink 
          to="/top-scorers" 
          className="nav-item"
          style={{
            display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', 
            textDecoration: 'none', color: 'var(--text-dark)', fontWeight: '600'
          }}
        >
          <FiAward size={22} style={{ color: 'var(--primary-color)' }} /> Top Scorers
        </NavLink>
      </div>

      <div style={{ padding: '0 24px', marginTop: 'auto', marginBottom: '20px' }}>
        <div 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px', 
            background: '#F8FAFC', 
            borderRadius: '16px', 
            cursor: 'pointer', 
            transition: 'all 0.2s',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
          title="Click to Logout"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{ 
              width: '38px', height: '38px', background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)', color: 'white', 
              borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontWeight: '700', fontSize: '14px', flexShrink: 0,
              boxShadow: '0 2px 5px rgba(79, 70, 229, 0.3)'
            }}>
              {initials || 'JD'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullName}</div>
              <div style={{ fontSize: '11.5px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{recruiter.email}</div>
            </div>
          </div>
          <div style={{ 
            color: '#EF4444', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px', 
            background: '#FEE2E2',
            flexShrink: 0,
            transition: 'all 0.2s'
          }}>
            <FiLogOut size={16} style={{ transform: 'translateX(1px)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
