import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiClipboard, FiLogOut, FiSearch, 
  FiArrowRight, FiBriefcase, FiMapPin, FiClock, FiLayers, FiAward 
} from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import logoUrl from '../assets/logo.svg';

// CandidateDashboard Component
// This component serves as the main home page for candidates.
// It displays a list of available jobs fetched from Supabase,
// allows the user to search jobs by title/skills/keywords, 
// and filter jobs by predefined categories (Skills, Experience, Location).
const CandidateDashboard = () => {
  const navigate = useNavigate();
  // State to hold the candidate's basic profile info
  const [candidate, setCandidate] = useState({ firstName: 'Loading...', lastName: '', email: '' });
  // State to hold all job listings from the database
  const [jobs, setJobs] = useState([]);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // Fetch candidate details and jobs on component mount
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

  // Handle user logout and clear session
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Toggle filter selection
  const toggleFilter = (filter) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
    setCurrentPage(1);
  };

  // Avatar initial
  const initial = candidate.firstName.charAt(0).toUpperCase();

  // Filter Logic: Filter jobs based on search term and selected filters
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

  // Pagination calculation
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const filterOptions = {
    Skills: ["HTML", "React", "Node", "JavaScript"],
    Experience: ["1-3 years", "2-4 Years", "1 Year"],
    Location: ["Karachi", "Lahore", "Islamabad"]
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Dynamic styles to maintain rich interactive design elements */}
      <style>{`
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px 28px;
          color: #4B5563;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 4px solid transparent;
        }
        .sidebar-item:hover {
          color: #4F46E5;
          background: rgba(79, 70, 229, 0.04);
        }
        .sidebar-item.active {
          background: #EEF2FF;
          color: #4F46E5;
          font-weight: 600;
          border-left: 4px solid #4F46E5;
        }
        .job-card {
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 24px;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
        }
        .job-card:hover {
          transform: translateY(-4px);
          border-color: #4F46E5;
          box-shadow: 0 12px 20px -3px rgba(79, 70, 229, 0.08), 0 4px 6px -2px rgba(79, 70, 229, 0.04);
        }
        .job-card:hover .arrow-icon-container {
          background: #4F46E5;
          color: #FFFFFF;
        }
        .filter-pill {
          padding: 8px 14px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          color: #475569;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .filter-pill:hover {
          border-color: #4F46E5;
          color: #4F46E5;
          background: rgba(79, 70, 229, 0.02);
        }
        .filter-pill.active {
          background: #4F46E5;
          border-color: #4F46E5;
          color: #FFFFFF;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
        }
        .pagination-btn {
          width: 38px;
          height: 38px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          color: #475569;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pagination-btn:hover:not(:disabled) {
          border-color: #4F46E5;
          color: #4F46E5;
          background: rgba(79, 70, 229, 0.02);
        }
        .pagination-btn.active {
          background: #4F46E5;
          border-color: #4F46E5;
          color: #FFFFFF;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
        }
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .search-container input:focus {
          border-color: #4F46E5 !important;
          background: #FFFFFF !important;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08) !important;
        }
      `}</style>

      {/* Sidebar */}
      <div style={{ 
        width: '280px', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column',
        padding: '30px 0', background: '#FFFFFF', flexShrink: 0
      }}>
        <div style={{ padding: '0 24px', marginBottom: '40px', display: 'flex', alignItems: 'center' }}>
          <img src={logoUrl} alt="Xenon AI" style={{ height: '32px' }} />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="sidebar-item active">
            <FiHome size={20} />
            <span style={{ fontSize: '15px' }}>Home</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/candidate-applied-jobs')}>
            <FiUsers size={20} />
            <span style={{ fontSize: '15px' }}>Applied Jobs</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/candidate-applied-jobs')}>
            <FiClipboard size={20} />
            <span style={{ fontSize: '15px' }}>Interview</span>
          </div>
        </nav>

        {/* User Profile */}
        <div style={{ padding: '0 24px', marginTop: 'auto', marginBottom: '20px' }}>
          <div 
            onClick={handleLogout}
            style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '12px', background: '#F8FAFC', borderRadius: '16px', 
              cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #E2E8F0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
            title="Click to Logout"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{ 
                width: '38px', height: '38px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', 
                borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontWeight: '700', fontSize: '14px', flexShrink: 0, boxShadow: '0 2px 5px rgba(16, 185, 129, 0.3)'
              }}>
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {candidate.firstName} {candidate.lastName}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {candidate.email}
                </div>
              </div>
            </div>
            <div style={{ 
              color: '#EF4444', display: 'flex', justifyContent: 'center', alignItems: 'center', 
              width: '32px', height: '32px', borderRadius: '8px', background: '#FEE2E2',
              flexShrink: 0, transition: 'all 0.2s'
            }}>
              <FiLogOut size={16} style={{ transform: 'translateX(1px)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Header content & Search aligned beautifully */}
        <div style={{ 
          padding: '24px 40px', background: '#FFFFFF', borderBottom: '1px solid #E5E7EB',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
            Welcome, {candidate.firstName}
          </h1>
          <div className="search-container" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <FiSearch size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by job title, skills, or keywords..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%', padding: '12px 16px 12px 46px', borderRadius: '12px', border: '1px solid #E2E8F0',
                background: '#F8FAFC', fontSize: '14px', outline: 'none', color: '#0F172A',
                transition: 'all 0.2s ease-in-out'
              }}
            />
          </div>
        </div>

        {/* Rest of body with Sidebar Filters */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Job Grid Area */}
          <div style={{ flex: 1, padding: '30px 40px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', margin: '0 0 24px 0', textAlign: 'left' }}>
              Recommended For You
            </h2>
            
            {filteredJobs.length === 0 ? (
              <p style={{ color: '#64748B', marginTop: '40px', textAlign: 'center', fontSize: '15px' }}>
                {jobs.length === 0 ? "No jobs created by recruiters yet." : "No jobs match your search or filters."}
              </p>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                  {currentJobs.map((job) => {
                    const skillTags = job.skills
                      ? job.skills.split(',').map(s => s.trim()).filter(Boolean)
                      : [];
                    return (
                      <div key={job.job_id} 
                        className="job-card"
                        onClick={() => navigate('/candidate-job', { state: { job } })}
                      >
                        {/* Title and Icon */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                          <div style={{ 
                            width: '42px', height: '42px', borderRadius: '12px', background: '#EEF2FF', 
                            display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#4F46E5',
                            flexShrink: 0
                          }}>
                            <FiBriefcase size={20} />
                          </div>
                          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0F172A', margin: 0, lineClamp: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {job.title}
                          </h3>
                        </div>

                        {/* Metadata Tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                          {job.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px' }}>
                              <FiMapPin size={13} color="#64748B" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          {job.experience && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px' }}>
                              <FiClock size={13} color="#64748B" />
                              <span>{job.experience}</span>
                            </div>
                          )}
                          {job.positions && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px' }}>
                              <FiLayers size={13} color="#64748B" />
                              <span>{job.positions} Openings</span>
                            </div>
                          )}
                          {job.passing_threshold && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px' }}>
                              <FiAward size={13} color="#64748B" />
                              <span>{job.passing_threshold}% Match Required</span>
                            </div>
                          )}
                        </div>

                        {/* Description Gist */}
                        <p style={{ 
                          fontSize: '13.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 16px 0', 
                          display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden', height: '40px'
                        }}>
                          {job.description || "No description provided."}
                        </p>

                        {/* Skills Badges */}
                        {skillTags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto' }}>
                            {skillTags.slice(0, 3).map((skill, i) => (
                              <span key={i} style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#4F46E5',
                                background: '#EEF2FF',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {skill}
                              </span>
                            ))}
                            {skillTags.length > 3 && (
                              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px' }}>
                                +{skillTags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Card Footer */}
                        <div style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                          marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' 
                        }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {job.qualification ? `Req: ${job.qualification}` : "Full Details"}
                          </span>
                          <div className="arrow-icon-container" style={{ 
                            width: '30px', height: '30px', borderRadius: '50%', background: '#F8FAFC', 
                            display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#4F46E5',
                            transition: 'all 0.2s ease-in-out'
                          }}>
                            <FiArrowRight size={16} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination component */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '36px', paddingBottom: '20px' }}>
                    <button 
                      className="pagination-btn" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      style={{ width: 'auto', padding: '0 12px', fontSize: '13px' }}
                    >
                      Prev
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button 
                      className="pagination-btn" 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      style={{ width: 'auto', padding: '0 12px', fontSize: '13px' }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Filter Sidebar */}
          <div style={{ 
            width: '280px', borderLeft: '1px solid #E2E8F0', padding: '30px 24px',
            background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '24px',
            flexShrink: 0, overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#0F172A' }}>Filters</h3>
              {activeFilters.length > 0 && (
                <button 
                  onClick={() => {
                    setActiveFilters([]);
                    setCurrentPage(1);
                  }} 
                  style={{ 
                    background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', 
                    fontSize: '12px', fontWeight: '700', padding: 0
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
            
            {Object.keys(filterOptions).map((category) => {
              const icon = category === 'Skills' 
                ? <FiLayers size={14} color="#64748B" /> 
                : category === 'Experience' 
                  ? <FiClock size={14} color="#64748B" /> 
                  : <FiMapPin size={14} color="#64748B" />;
              
              return (
                <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B' }}>
                    {icon}
                    <h4 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                      {category}
                    </h4>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {filterOptions[category].map((item) => {
                      const isActive = activeFilters.includes(item);
                      return (
                        <span 
                          key={item}
                          onClick={() => toggleFilter(item)}
                          className={`filter-pill ${isActive ? 'active' : ''}`}
                        >
                          {item}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CandidateDashboard;
