/**
 * Matching Service
 * ----------------
 * Responsible for computing semantic similarity between candidates and jobs,
 * evaluating against recruiter thresholds, and updating application statuses.
 *
 * Architecture Notes:
 * - Depends on EmbeddingService to ensure vectors exist before matching.
 * - Uses Supabase Admin client to execute the database vector operations.
 * - Encapsulates all business logic for the decision phase.
 */

const { supabaseAdmin } = require('../config/supabase');
const EmbeddingService = require('./embedding.service');

class MatchingService {
  /**
   * Process an application: ensure embeddings exist, compute similarity,
   * evaluate against the threshold, and update the application status.
   *
   * @param {string} applicationId - UUID of the application
   * @param {string} candidateId   - UUID of the candidate
   * @param {string} jobId         - UUID of the job
   * @returns {Object} { status, matchPercentage, meetsThreshold, jobThreshold }
   */
  static async processApplicationMatch(applicationId, candidateId, jobId) {
    try {
      console.log(`[MatchingService] Processing application ${applicationId}...`);

      // 1. Ensure embeddings exist for both the job and the candidate
      // This will generate them on-the-fly if they are missing or outdated.
      await EmbeddingService.ensureEmbeddings(jobId, candidateId);

      // 2. Execute the database matching function (Cosine Similarity via pgvector)
      const { data, error } = await supabaseAdmin.rpc('match_candidate_to_job', {
        p_candidate_id: candidateId,
        p_job_id: jobId
      });

      if (error) {
        throw new Error(`Database matching function failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No match data returned from database.');
      }

      const matchResult = data[0];
      const matchPercentage = parseFloat(matchResult.similarity_percentage);
      const meetsThreshold = matchResult.meets_threshold;
      const jobThreshold = matchResult.job_threshold;

      // 3. Apply Decision Logic
      // If score > 60: status = 'shortlisted for interview'
      // Else: status = 'rejected'
      const newStatus = matchPercentage > 60 ? 'shortlisted for interview' : 'rejected';

      console.log(`[MatchingService] Match Score: ${matchPercentage}% (Threshold: ${jobThreshold}%) -> ${newStatus}`);

      // 4. Update the application in the database
      const { error: updateError } = await supabaseAdmin
        .from('applications')
        .update({
          status: newStatus,
          match_score: matchPercentage,
          matched_at: new Date().toISOString(),
          match_metadata: {
            model: 'BAAI/bge-small-en-v1.5',
            dimensions: 384,
            threshold_applied: jobThreshold,
            processed_at: new Date().toISOString()
          }
        })
        .eq('application_id', applicationId);

      if (updateError) {
        throw new Error(`Failed to update application status: ${updateError.message}`);
      }

      return {
        success: true,
        status: newStatus,
        matchPercentage,
        meetsThreshold,
        jobThreshold
      };

    } catch (error) {
      console.error(`[MatchingService] Error processing match for app ${applicationId}:`, error);
      throw error;
    }
  }

  /**
   * Find the best matching jobs for a specific candidate.
   * Useful for a "Recommended Jobs" feature on the candidate dashboard.
   *
   * @param {string} candidateId - UUID of the candidate
   * @param {number} limit - Maximum number of jobs to return (default: 10)
   * @returns {Array} List of matching jobs with scores
   */
  static async findRecommendedJobs(candidateId, limit = 10) {
    try {
      // Ensure the candidate has an up-to-date embedding
      const { data: profileData } = await supabaseAdmin
        .from('resume_parse_data')
        .select('skills, education, experience_years, profile_embedding')
        .eq('candidate_id', candidateId)
        .single();

      if (profileData && !profileData.profile_embedding) {
         const profileText = EmbeddingService.buildProfileText(profileData);
         await EmbeddingService.generateProfileEmbedding(candidateId, profileText);
      }

      // Query database for matches
      const { data, error } = await supabaseAdmin.rpc('find_matching_jobs', {
        p_candidate_id: candidateId,
        p_limit: limit
      });

      if (error) {
         throw new Error(`Failed to find matching jobs: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error(`[MatchingService] Error finding recommended jobs for ${candidateId}:`, error);
      throw error;
    }
  }

  /**
   * Find the best matching candidates for a specific job.
   * Useful for the recruiter dashboard to proactively source candidates.
   *
   * @param {string} jobId - UUID of the job
   * @param {number} limit - Maximum number of candidates to return (default: 20)
   * @returns {Array} List of matching candidates with scores
   */
  static async findTopCandidatesForJob(jobId, limit = 20) {
     try {
       // Query database for matches
       const { data, error } = await supabaseAdmin.rpc('find_matching_candidates', {
         p_job_id: jobId,
         p_limit: limit
       });

       if (error) {
         throw new Error(`Failed to find matching candidates: ${error.message}`);
       }

       return data;
     } catch (error) {
       console.error(`[MatchingService] Error finding candidates for job ${jobId}:`, error);
       throw error;
     }
  }
}

module.exports = MatchingService;
