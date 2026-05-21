const { supabaseAdmin } = require('../config/supabase');

class InterviewRepository {
  /**
   * Resolve candidate ID based on auth user ID
   * @param {string} userId - Auth user ID
   */
  static async resolveCandidateId(userId) {
    const { data: candidate, error } = await supabaseAdmin
      .from('candidates')
      .select('candidate_id')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return candidate ? candidate.candidate_id : null;
  }

  /**
   * Fetch application details alongside its job specifications
   * @param {string} applicationId - Application UUID
   * @param {string} candidateId - Candidate UUID
   */
  static async getApplicationAndJob(applicationId, candidateId) {
    const { data: application, error } = await supabaseAdmin
      .from('applications')
      .select(`
        application_id,
        candidate_id,
        status,
        jobs (job_id, title, required_skill, experience_level, interview_difficulty, passing_threshold)
      `)
      .eq('application_id', applicationId)
      .eq('candidate_id', candidateId)
      .single();

    if (error) return null;
    return application;
  }

  /**
   * Fetch existing interview record for a given application
   * @param {string} applicationId - Application UUID
   */
  static async getExistingInterview(applicationId) {
    const { data: interview, error } = await supabaseAdmin
      .from('interviews')
      .select('interview_id, status, current_difficulty_level')
      .eq('application_id', applicationId)
      .single();

    if (error) return null;
    return interview;
  }

  /**
   * Fetch the last generated question for an interview
   * @param {string} interviewId - Interview UUID
   */
  static async getLastGeneratedQuestion(interviewId) {
    const { data: question, error } = await supabaseAdmin
      .from('questions')
      .select('question_id, question_text, sequence_number, topic, difficulty, expected_answer_keywords')
      .eq('interview_id', interviewId)
      .order('sequence_number', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return question;
  }

  /**
   * Fetch details of a specific question belonging to an interview
   * @param {string} questionId - Question UUID
   * @param {string} interviewId - Interview UUID
   */
  static async getQuestion(questionId, interviewId) {
    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('question_id', questionId)
      .eq('interview_id', interviewId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Check if a specific question has already been answered
   * @param {string} questionId - Question UUID
   */
  static async checkQuestionAnswered(questionId) {
    const { data: answer, error } = await supabaseAdmin
      .from('answers')
      .select('answer_id')
      .eq('question_id', questionId)
      .single();

    if (error) return false;
    return !!answer;
  }

  /**
   * Create a new interview session
   * @param {string} applicationId - Application UUID
   * @param {string} initialDifficulty - Initial session difficulty
   */
  static async createInterview(applicationId, initialDifficulty) {
    const { data: interview, error } = await supabaseAdmin
      .from('interviews')
      .insert({
        application_id: applicationId,
        status: 'in_progress',
        current_difficulty_level: initialDifficulty,
        total_score: 0
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create interview record: ${error.message}`);
    return interview;
  }

  /**
   * Update application workflow status
   * @param {string} applicationId - Application UUID
   * @param {string} status - New workflow status
   */
  static async updateApplicationStatus(applicationId, status) {
    const { error } = await supabaseAdmin
      .from('applications')
      .update({ status })
      .eq('application_id', applicationId);

    if (error) throw new Error(`Failed to update application status: ${error.message}`);
  }

  /**
   * Save candidate response and AI feedback score
   */
  static async saveAnswer(questionId, response, score, feedback, timeTaken) {
    const { error } = await supabaseAdmin
      .from('answers')
      .insert({
        question_id: questionId,
        candidate_response: response,
        score: score,
        ai_feedback: feedback,
        time_taken_seconds: timeTaken || 0
      });

    if (error) throw new Error(`Failed to save candidate answer: ${error.message}`);
  }

  /**
   * Update active difficulty level of the interview
   */
  static async updateInterviewDifficulty(interviewId, newDifficulty) {
    const { error } = await supabaseAdmin
      .from('interviews')
      .update({ current_difficulty_level: newDifficulty })
      .eq('interview_id', interviewId);

    if (error) throw new Error(`Failed to update interview difficulty: ${error.message}`);
  }

  /**
   * Get all questions for an interview
   */
  static async getAllQuestions(interviewId) {
    const { data: questions, error } = await supabaseAdmin
      .from('questions')
      .select('question_id')
      .eq('interview_id', interviewId);

    if (error) throw new Error(`Failed to retrieve questions: ${error.message}`);
    return questions || [];
  }

  /**
   * Fetch candidate scores matching list of question IDs
   */
  static async getAllAnswers(questionIds) {
    const { data: answers, error } = await supabaseAdmin
      .from('answers')
      .select('score')
      .in('question_id', questionIds);

    if (error) throw new Error(`Failed to retrieve answers: ${error.message}`);
    return answers || [];
  }

  /**
   * Finalize the interview, saving completion metrics
   */
  static async finalizeInterview(interviewId, totalScore, result) {
    const { error } = await supabaseAdmin
      .from('interviews')
      .update({
        status: 'completed',
        total_score: totalScore,
        result: result
      })
      .eq('interview_id', interviewId);

    if (error) throw new Error(`Failed to complete interview record: ${error.message}`);
  }

  /**
   * Fetch full interview record details
   */
  static async getInterviewDetails(interviewId) {
    const { data: interview, error } = await supabaseAdmin
      .from('interviews')
      .select(`
        interview_id,
        total_score,
        result,
        status,
        created_at,
        application_id,
        applications (
          candidate_id,
          jobs (title, passing_threshold)
        )
      `)
      .eq('interview_id', interviewId)
      .single();

    if (error) return null;
    return interview;
  }

  /**
   * Fetch structured questions and answers for interview scorecard
   */
  static async getQuestionsAndAnswers(interviewId) {
    const { data: questions, error } = await supabaseAdmin
      .from('questions')
      .select(`
        question_id,
        question_text,
        difficulty,
        topic,
        sequence_number,
        answers (
          candidate_response,
          score,
          ai_feedback,
          time_taken_seconds
        )
      `)
      .eq('interview_id', interviewId)
      .order('sequence_number', { ascending: true });

    if (error) throw new Error(`Failed to fetch interview scorecard: ${error.message}`);
    return questions || [];
  }

  /**
   * List interviews taken by a candidate
   */
  static async getCandidateInterviews(candidateId) {
    const { data: interviews, error } = await supabaseAdmin
      .from('interviews')
      .select(`
        interview_id,
        total_score,
        result,
        status,
        created_at,
        applications (
          application_id,
          jobs (title)
        )
      `)
      .eq('applications.candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch interviews: ${error.message}`);
    return interviews || [];
  }

  /**
   * Save a newly generated interview question
   */
  static async saveGeneratedQuestion(interviewId, difficulty, questionText, expectedKeywords, topic, sequenceNumber) {
    const { data: savedQuestion, error } = await supabaseAdmin
      .from('questions')
      .insert({
        interview_id: interviewId,
        difficulty: difficulty,
        question_text: questionText,
        expected_answer_keywords: JSON.stringify(expectedKeywords || []),
        topic: topic,
        sequence_number: sequenceNumber
      })
      .select('question_id, question_text, sequence_number')
      .single();

    if (error) throw new Error(`Failed to save generated question: ${error.message}`);
    return savedQuestion;
  }

  /**
   * Start a new interview session and mark the application status atomically in a transaction
   * @param {string} applicationId - Application UUID
   * @param {string} initialDifficulty - Initial session difficulty
   */
  static async startInterviewAtomic(applicationId, initialDifficulty) {
    const { data, error } = await supabaseAdmin
      .rpc('start_interview_atomic', {
        p_application_id: applicationId,
        p_initial_difficulty: initialDifficulty
      })
      .single();

    if (error) throw new Error(`Failed to atomically start interview: ${error.message}`);
    return data;
  }

  /**
   * Finalize the interview session and update application status atomically in a transaction
   * @param {string} interviewId - Interview UUID
   * @param {string} applicationId - Application UUID
   * @param {number} totalScore - Combined interview score percentage
   * @param {string} resultStatus - Passed/Failed outcome
   * @param {string} finalAppStatus - Accepted/Rejected status
   */
  static async finalizeInterviewAtomic(interviewId, applicationId, totalScore, resultStatus, finalAppStatus) {
    const { error } = await supabaseAdmin
      .rpc('finalize_interview_atomic', {
        p_interview_id: interviewId,
        p_application_id: applicationId,
        p_total_score: totalScore,
        p_result_status: resultStatus,
        p_final_app_status: finalAppStatus
      });

    if (error) throw new Error(`Failed to atomically finalize interview: ${error.message}`);
  }
}

module.exports = InterviewRepository;
