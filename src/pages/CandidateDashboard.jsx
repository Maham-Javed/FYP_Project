import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiClipboard, FiLogOut, FiSearch, FiArrowRight, FiBriefcase } from 'react-icons/fi';
import { supabase } from '../supabaseClient';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState({ firstName: 'Loading...', lastName: '', email: '' });
  const [jobs, setJobs] = useState([]);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Get logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fullName = user.user_metadata?.name || 'Candidate User';
        const parts = fullName.split(' ');
        setCandidate({
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          email: user.email
        });
      }

      // 2. Load all available jobs
      const { data: jobsData, error } = await supabase.from('jobs').select('*');
      if (!error && jobsData) {
        // Map database fields to frontend fields
        const formattedJobs = jobsData.map(j => ({
          ...j,
          skills: j.required_skill,
          experience: j.experience_level
        }));
        setJobs(formattedJobs);
      }
    };
    
    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const toggleFilter = (filter) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Avatar initial
  const initial = candidate.firstName.charAt(0).toUpperCase();

  // Filter Logic
  const filteredJobs = jobs.filter((job) => {
    const jobString = `${job.title} ${job.description} ${job.location} ${job.skills} ${job.experience}`.toLowerCase();
    
    // Check Search Term
    const matchesSearch = jobString.includes(searchTerm.toLowerCase());
    
    // Check Active Filters (If filters exist, job must match at least one of the active filters)
    let matchesFilter = true;
    if (activeFilters.length > 0) {
      matchesFilter = activeFilters.some(filter => jobString.includes(filter.toLowerCase()));
    }
    
    return matchesSearch && matchesFilter;
  });

  const filterOptions = {
    Skills: ["HTML", "React", "Node", "JavaScript"],
    Experience: ["1-3 years", "2-4 Years", "1 Year"],
    Location: ["Karachi", "Lahore", "Islamabad"]
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sidebar */}
      <div style={{ 
        width: '280px', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column',
        padding: '30px 0'
      }}>
        <div style={{ padding: '0 30px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '40px', height: '40px', background: 'var(--sidebar-active-bg)', borderRadius: '8px',
            display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--primary-color)',
            fontWeight: 'bold', fontSize: '18px', color: '#111'
          }}>Xr</div>
          <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>XENON</span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', 
            background: 'var(--sidebar-active-bg)', color: '#111', cursor: 'pointer',
            borderLeft: '4px solid var(--primary-color)'
          }}>
            <FiHome size={22} color="var(--primary-color)" />
            <span style={{ fontWeight: '600', fontSize: '16px' }}>Home</span>
          </div>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', 
            color: '#4B5563', cursor: 'pointer'
          }} onClick={() => navigate('/candidate-applied-jobs')}>
            <FiUsers size={22} />
            <span style={{ fontWeight: '500', fontSize: '16px' }}>Applied Jobs</span>
          </div>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', 
            color: '#4B5563', cursor: 'pointer'
          }}>
            <FiClipboard size={22} />
            <span style={{ fontWeight: '500', fontSize: '16px' }}>Interview</span>
          </div>
        </nav>

        {/* User Profile */}
        <div style={{ 
          padding: '20px 30px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '15px'
        }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', background: '#D1FAE5',
            display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#10B981'
          }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', lineHeight: '1.2' }}>{candidate.firstName} {candidate.lastName}</div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>{candidate.email}</div>
          </div>
          <FiLogOut size={22} color="var(--primary-color)" cursor="pointer" onClick={handleLogout} />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header content & Search */}
        <div style={{ padding: '40px 50px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111', marginBottom: '30px' }}>
            Welcome, {candidate.firstName}
          </h1>
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <FiSearch size={20} color="#9CA3AF" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by job title, skills, or keywords..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '15px 45px', borderRadius: '25px', border: 'none',
                background: '#F3F4F6', fontSize: '16px', outline: 'none', color: '#111'
              }}
            />
          </div>
        </div>

        {/* Rest of body with Sidebar Filters */}
        <div style={{ display: 'flex', flex: 1, padding: '30px 0 30px 50px', gap: '40px', overflowY: 'auto' }}>
          
          {/* Job Grid Area */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px', color: '#111' }}>
              Recommended For You
            </h2>
            
            {filteredJobs.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6B7280', marginTop: '40px' }}>
                {jobs.length === 0 ? "No jobs created by recruiters yet." : "No jobs match your search or filters."}
              </p>
            ) : (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                 {filteredJobs.map((job) => (
                   <div key={job.id || Math.random()} 
                     onClick={() => navigate('/candidate-job', { state: { job } })}
                     style={{
                       border: '2px solid var(--primary-color)', borderRadius: '24px', padding: '25px',
                       display: 'flex', flexDirection: 'column', background: '#FFFFFF', transition: 'transform 0.2s', cursor: 'pointer'
                   }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                       <FiBriefcase size={28} color="#111" />
                       <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', margin: 0 }}>{job.title}</h3>
                     </div>
                     <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', flex: 1, marginBottom: '20px' }}>
                       {job.description && job.description.length > 120 ? job.description.substring(0,120) + "..." : (job.description || "No description provided.")}
                     </p>
                     <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                       <FiArrowRight size={24} color="#111" />
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>

          {/* Right Filter Sidebar */}
          <div style={{ 
            width: '280px', borderLeft: '1px solid #E5E7EB', padding: '0 30px',
            borderTopLeftRadius: '30px', border: '1px solid #E5E7EB', borderRight: 'none', borderBottom: 'none',
            background: '#FAFAFA'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111' }}>Filter</h3>
              {activeFilters.length > 0 && (
                <button onClick={() => setActiveFilters([])} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                  Clear
                </button>
              )}
            </div>
            
            {Object.keys(filterOptions).map((category) => (
              <div key={category} style={{ marginBottom: '30px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', marginBottom: '15px' }}>{category}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {filterOptions[category].map((item) => {
                    const isActive = activeFilters.includes(item);
                    return (
                      <span 
                        key={item}
                        onClick={() => toggleFilter(item)}
                        style={{ 
                          padding: '8px 16px', 
                          background: isActive ? 'var(--primary-color)' : 'var(--sidebar-active-bg)', 
                          color: isActive ? '#FFFFFF' : '#4B5563', 
                          borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {item}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default CandidateDashboard;
