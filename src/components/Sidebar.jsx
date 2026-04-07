import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiAward, FiPlus, FiLogOut } from 'react-icons/fi';

const Sidebar = () => {
  const navigate = useNavigate();
  const recruiterStr = localStorage.getItem('xenon_recruiter');
  const recruiter = recruiterStr ? JSON.parse(recruiterStr) : { firstName: 'John', lastName: 'Doe', email: 'johndoe@unilever.com' };
  const initials = `${recruiter.firstName[0] || ''}${recruiter.lastName[0] || ''}`.toUpperCase();
  const fullName = `${recruiter.firstName} ${recruiter.lastName}`;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 30px', marginBottom: '30px' }}>
        <div style={{ 
          width: '40px', height: '40px', border: '1px solid #ddd', 
          borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontWeight: 'bold', fontSize: '18px', color: '#111'
        }}>
          Xr
        </div>
        <span style={{ fontSize: '20px', letterSpacing: '2px', fontWeight: '300', color: '#111' }}>XENON</span>
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

      <div style={{ padding: '0 30px', marginTop: 'auto' }}>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', marginBottom: '20px' }}/>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '40px', height: '40px', background: '#8B4513', color: 'white', 
              borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontWeight: '600'
            }}>
              {initials || 'JD'}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#111' }}>{fullName}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{recruiter.email}</div>
            </div>
          </div>
          <NavLink to="/" style={{ color: 'var(--primary-color)' }}>
            <FiLogOut size={20} />
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
