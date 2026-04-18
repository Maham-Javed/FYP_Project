import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import JobCard from '../components/JobCard';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const [recruiter, setRecruiter] = useState({ firstName: 'Loading...' });
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const loadData = async () => {
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
              
              // total shortlisted
              const { count: shortlisted } = await supabase.from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('job_id', job.job_id)
                .in('status', ['interviewing', 'accepted']);
              
              // top scorer
              const { data: topInterviews } = await supabase.from('interviews')
                .select('total_score, applications!inner(job_id)')
                .eq('applications.job_id', job.job_id)
                .order('total_score', { ascending: false })
                .limit(1);
              
              const topScorer = topInterviews?.length > 0 ? topInterviews[0].total_score : 0;

              return { ...job, applied: applied || 0, shortlisted: shortlisted || 0, topScorer };
            }));
            
            setJobs(enrichedJobs);
          }
        }
      }
    };
    loadData();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#111', marginBottom: '20px' }}>
          Welcome Back, {recruiter.firstName}
        </h1>
        
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', marginBottom: '40px' }}/>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '30px',
          animation: 'slideIn 0.5s ease-out'
        }}>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard 
                key={job.job_id}
                id={job.job_id}
                title={job.title}
                applied={job.applied}
                shortlisted={job.shortlisted}
                topScorer={job.topScorer}
              />
            ))
          ) : (
            <p style={{ color: 'var(--text-light)' }}>No jobs posted yet! Click "Add New Job" to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
