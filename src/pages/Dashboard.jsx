import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import JobCard from '../components/JobCard';
import { supabase } from '../supabaseClient';
import { FiSearch } from 'react-icons/fi';

const Dashboard = () => {
  const [recruiter, setRecruiter] = useState({ firstName: 'Loading...' });
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setRecruiter({
            firstName: user.user_metadata?.name?.split(' ')[0] || 'Recruiter'
          });
          
          // Fetch jobs from recruiter
          const { data: recData } = await supabase.from('recruiters').select('recruiter_id').eq('user_id', user.id).single();
          if (recData) {
            const { data: jobsData } = await supabase.from('jobs').select('*').eq('recruiter_id', recData.recruiter_id);
            if (jobsData) {
              // Fetch stats for each job
              const enrichedJobs = await Promise.all(jobsData.map(async (job) => {
                // total applied
                const { count: applied } = await supabase.from('applications')
                  .select('*', { count: 'exact', head: true })
                  .eq('job_id', job.job_id);
                
                // total accepted
                const { data: acceptedData } = await supabase.from('applications')
                  .select('application_id')
                  .eq('job_id', job.job_id)
                  .eq('status', 'accepted');
                const accepted = acceptedData ? acceptedData.length : 0;
                
                // top scorer
                const { data: topInterviews } = await supabase.from('interviews')
                  .select('total_score, applications!inner(job_id)')
                  .eq('applications.job_id', job.job_id)
                  .order('total_score', { ascending: false })
                  .limit(1);
                
                const topScorer = topInterviews?.length > 0 ? topInterviews[0].total_score : 0;

                return { ...job, applied: applied || 0, accepted: accepted || 0, topScorer };
              }));
              
              setJobs(enrichedJobs);
            }
          }
        }
      } catch (err) {
        console.error("Error loading recruiter dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      background: '#F8FAFC', 
      fontFamily: "'Inter', sans-serif" 
    }}>
      
      <style>{`
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
        .search-container input:focus {
          border-color: #4F46E5 !important;
          background: #FFFFFF !important;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08) !important;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>

      <Sidebar />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Header content & Search aligned beautifully */}
        <div style={{ 
          padding: '24px 40px', 
          background: '#FFFFFF', 
          borderBottom: '1px solid #E5E7EB',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '20px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
            Welcome Back, {recruiter.firstName}
          </h1>
          <div className="search-container" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <FiSearch size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search jobs by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', 
                padding: '12px 16px 12px 46px', 
                borderRadius: '12px', 
                border: '1px solid #E2E8F0',
                background: '#F8FAFC', 
                fontSize: '14px', 
                outline: 'none', 
                color: '#0F172A',
                transition: 'all 0.2s ease-in-out'
              }}
            />
          </div>
        </div>

        {/* Job Grid Area */}
        <div style={{ flex: 1, padding: '30px 40px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', margin: '0 0 24px 0', textAlign: 'left' }}>
            Your Job Postings
          </h2>
          
          {loading ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '24px' 
            }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '20px',
                  padding: '24px',
                  background: '#FFFFFF',
                  height: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  animation: 'pulse 1.5s infinite ease-in-out'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#E2E8F0' }}></div>
                    <div style={{ width: '150px', height: '20px', borderRadius: '4px', background: '#E2E8F0' }}></div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
                    <div style={{ height: '38px', borderRadius: '12px', background: '#F1F5F9' }}></div>
                    <div style={{ height: '38px', borderRadius: '12px', background: '#F1F5F9' }}></div>
                    <div style={{ height: '38px', borderRadius: '12px', background: '#F1F5F9' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <p style={{ color: '#64748B', marginTop: '40px', textAlign: 'center', fontSize: '15px' }}>
              {jobs.length === 0 ? "No jobs posted yet! Click \"Add New Job\" to get started." : "No jobs match your search term."}
            </p>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '24px',
              animation: 'slideIn 0.5s ease-out' 
            }}>
              {filteredJobs.map((job) => (
                <JobCard 
                  key={job.job_id}
                  id={job.job_id}
                  title={job.title}
                  applied={job.applied}
                  accepted={job.accepted}
                  topScorer={job.topScorer}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;


