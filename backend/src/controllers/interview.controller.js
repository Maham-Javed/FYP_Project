const { supabaseAdmin } = require('../config/supabase');
const AIService = require('../services/aiService');

class InterviewController {
  /**
   * POST /api/interviews/start
   * Start a new interview for a given application.
   * Body: { application_id: UUID }
   * Auth: Requires candidate role
   */
  static async startInterview(req, res) {
    try {
      const userId = req.user.id;
      const { application_id } = req.body;

      if (!application_id) {
        return res.status(400).json({ error: 'application_id is required.' });
      }

      // 1. Resolve candidate_id
      const { data: candidate, error: candidateError } = await supabaseAdmin
        .from('candidates')
        .select('candidate_id')
        .eq('user_id', userId)
        .single();

      if (candidateError || !candidate) {
        return res.status(403).json({ error: 'Candidate profile not found.' });
      }

      // 2. Fetch the application to verify ownership and get job info
      const { data: application, error: appError } = await supabaseAdmin
        .from('applications')
        .select(`
          application_id,
          candidate_id,
          status,
          jobs (job_id, title, required_skill, experience_level, interview_difficulty)
        `)
        .eq('application_id', application_id)
        .eq('candidate_id', candidate.candidate_id)
        .single();

      if (appError || !application) {
        return res.status(404).json({ error: 'Application not found or you do not own it.' });
      }

      // Check if application status allows taking an interview
      // (For example, we might require that status is 'matched' or similar, but let's allow it as long as application exists and isn't rejected)
      if (application.status === 'rejected') {
        return res.status(400).json({ error: 'This application has been rejected; you cannot take an interview.' });
      }

      // 3. Check if an interview already exists for this application
      const { data: existingInterview } = await supabaseAdmin
        .from('interviews')
        .select('interview_id, status')
        .eq('application_id', application_id)
        .single();

      if (existingInterview) {
        if (existingInterview.status === 'completed') {
          return res.status(409).json({
            error: 'You have already completed the interview for this application.',
            interview_id: existingInterview.interview_id,
            status: 'completed'
          });
        }
        
        // If interview exists but in_progress, resume it by fetching current state
        console.log(`[InterviewController] Resuming existing interview ${existingInterview.interview_id}`);
        
        // Fetch the last question generated
        const { data: lastQuestion, error: qError } = await supabaseAdmin
          .from('questions')
          .select('question_id, question_text, sequence_number, topic, difficulty')
          .eq('interview_id', existingInterview.interview_id)
          .order('sequence_number', { ascending: false })
          .limit(1)
          .single();

        if (qError || !lastQuestion) {
          // If no questions exist somehow, generate the first one
          const firstQuestion = await InterviewController.generateAndSaveQuestion(
            existingInterview.interview_id,
            application.jobs,
            1
          );
          return res.status(200).json({
            message: 'Interview resumed. Here is the first question.',
            interview_id: existingInterview.interview_id,
            question: firstQuestion
          });
        }

        // Check if candidate has already answered this last question
        const { data: lastAnswer } = await supabaseAdmin
          .from('answers')
          .select('answer_id')
          .eq('question_id', lastQuestion.question_id)
          .single();

        if (lastAnswer) {
          // If the last question has been answered, generate the next one (if under limit)
          const nextSeq = lastQuestion.sequence_number + 1;
          if (nextSeq <= 5) {
            const nextQuestion = await InterviewController.generateAndSaveQuestion(
              existingInterview.interview_id,
              application.jobs,
              nextSeq,
              lastQuestion.difficulty // carry forward difficulty or adapt
            );
            return res.status(200).json({
              message: 'Interview resumed. Next question generated.',
              interview_id: existingInterview.interview_id,
              question: nextQuestion
            });
          } else {
            // Already answered all 5, should be completed
            return res.status(200).json({
              message: 'Interview already finished.',
              interview_id: existingInterview.interview_id,
              finished: true
            });
          }
        }

        // Return the unanswered last question
        return res.status(200).json({
          message: 'Interview resumed.',
          interview_id: existingInterview.interview_id,
          question: {
            question_id: lastQuestion.question_id,
            question_text: lastQuestion.question_text,
            sequence_number: lastQuestion.sequence_number
          }
        });
      }

      // 4. Create new interview record
      const initialDifficulty = application.jobs?.interview_difficulty || 'Medium';
      const { data: newInterview, error: insertError } = await supabaseAdmin
        .from('interviews')
        .insert({
          application_id: application_id,
          status: 'in_progress',
          current_difficulty_level: initialDifficulty,
          total_score: 0
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create interview record: ${insertError.message}`);
      }

      // Update application status to interviewing
      await supabaseAdmin
        .from('applications')
        .update({ status: 'interviewing' })
        .eq('application_id', application_id);

      // 5. Generate and save the first question
      const firstQuestion = await InterviewController.generateAndSaveQuestion(
        newInterview.interview_id,
        application.jobs,
        1,
        initialDifficulty
      );

      return res.status(201).json({
        message: 'Interview started successfully.',
        interview_id: newInterview.interview_id,
        question: firstQuestion
      });

    } catch (error) {
      console.error('[InterviewController] Start interview error:', error);
      return res.status(500).json({
        error: 'Failed to start interview.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * POST /api/interviews/:interviewId/answer
   * Submit an answer to the current question, evaluate it, and generate the next question.
   * Params: interviewId
   * Body: { question_id, candidate_response, time_taken_seconds }
   */
  static async submitAnswer(req, res) {
    try {
      const userId = req.user.id;
      const { interviewId } = req.params;
      const { question_id, candidate_response, time_taken_seconds } = req.body;

      if (!question_id || !candidate_response) {
        return res.status(400).json({ error: 'question_id and candidate_response are required.' });
      }

      // 1. Resolve candidate_id
      const { data: candidate, error: candidateError } = await supabaseAdmin
        .from('candidates')
        .select('candidate_id')
        .eq('user_id', userId)
        .single();

      if (candidateError || !candidate) {
        return res.status(403).json({ error: 'Candidate profile not found.' });
      }

      // 2. Fetch the interview and verify candidate owns it
      const { data: interview, error: intError } = await supabaseAdmin
        .from('interviews')
        .select(`
          interview_id,
          status,
          current_difficulty_level,
          application_id,
          applications (
            candidate_id,
            jobs (job_id, title, required_skill, experience_level, passing_threshold)
          )
        `)
        .eq('interview_id', interviewId)
        .single();

      if (intError || !interview) {
        return res.status(404).json({ error: 'Interview not found.' });
      }

      if (interview.applications?.candidate_id !== candidate.candidate_id) {
        return res.status(403).json({ error: 'You do not have permission to access this interview.' });
      }

      if (interview.status === 'completed') {
        return res.status(400).json({ error: 'This interview has already been completed.' });
      }

      // 3. Verify the question belongs to this interview
      const { data: question, error: qError } = await supabaseAdmin
        .from('questions')
        .select('*')
        .eq('question_id', question_id)
        .eq('interview_id', interviewId)
        .single();

      if (qError || !question) {
        return res.status(400).json({ error: 'Question not found in this interview.' });
      }

      // Check if this question is already answered
      const { data: existingAnswer } = await supabaseAdmin
        .from('answers')
        .select('answer_id')
        .eq('question_id', question_id)
        .single();

      if (existingAnswer) {
        return res.status(409).json({ error: 'You have already answered this question.' });
      }

      // 4. Parse expected keywords and evaluate answer via AIService
      let keywords = [];
      try {
        keywords = JSON.parse(question.expected_answer_keywords || '[]');
      } catch {
        keywords = question.expected_answer_keywords ? question.expected_answer_keywords.split(',').map(k => k.trim()) : [];
      }

      console.log(`[InterviewController] Evaluating answer for question ${question_id}...`);
      const evaluation = await AIService.evaluateAnswer(
        question.question_text,
        candidate_response,
        keywords
      );

      // Save answer in database
      const score = evaluation.score || 0;
      const feedback = evaluation.feedback || '';

      const { error: answerError } = await supabaseAdmin
        .from('answers')
        .insert({
          question_id: question_id,
          candidate_response: candidate_response,
          score: score,
          ai_feedback: feedback,
          time_taken_seconds: time_taken_seconds || 0
        });

      if (answerError) {
        throw new Error(`Failed to save candidate answer: ${answerError.message}`);
      }

      const currentSeq = question.sequence_number;
      const maxQuestions = 5;

      if (currentSeq < maxQuestions) {
        // Adjust difficulty level dynamically based on score
        let newDifficulty = question.difficulty;
        if (score >= 8) {
          if (question.difficulty === 'Easy') newDifficulty = 'Medium';
          else if (question.difficulty === 'Medium') newDifficulty = 'Hard';
        } else if (score <= 4) {
          if (question.difficulty === 'Hard') newDifficulty = 'Medium';
          else if (question.difficulty === 'Medium') newDifficulty = 'Easy';
        }

        // Save new difficulty level on the interview
        if (newDifficulty !== interview.current_difficulty_level) {
          await supabaseAdmin
            .from('interviews')
            .update({ current_difficulty_level: newDifficulty })
            .eq('interview_id', interviewId);
        }

        // Generate next question
        const nextSeq = currentSeq + 1;
        const nextQuestion = await InterviewController.generateAndSaveQuestion(
          interviewId,
          interview.applications.jobs,
          nextSeq,
          newDifficulty
        );

        return res.status(200).json({
          finished: false,
          score: score,
          feedback: feedback,
          nextQuestion: nextQuestion
        });
      } else {
        // 5. This was the last question. Complete the interview!
        console.log(`[InterviewController] Interview ${interviewId} completed. Calculating final score...`);

        // Fetch all questions and their scores
        const { data: allQuestions } = await supabaseAdmin
          .from('questions')
          .select('question_id')
          .eq('interview_id', interviewId);

        const questionIds = allQuestions.map(q => q.question_id);

        const { data: allAnswers } = await supabaseAdmin
          .from('answers')
          .select('score')
          .in('question_id', questionIds);

        const totalEarnedScore = allAnswers.reduce((sum, ans) => sum + (ans.score || 0), 0);
        // Maximum possible score is: number of questions * 10
        const maxPossibleScore = maxQuestions * 10;
        const finalScorePercentage = Math.round((totalEarnedScore / maxPossibleScore) * 100);

        // Determine result based on passing threshold
        const passingThreshold = interview.applications.jobs?.passing_threshold || 60;
        const resultStatus = finalScorePercentage >= passingThreshold ? 'passed' : 'failed';

        // Update interview status
        const { error: updateIntError } = await supabaseAdmin
          .from('interviews')
          .update({
            status: 'completed',
            total_score: finalScorePercentage,
            result: resultStatus
          })
          .eq('interview_id', interviewId);

        if (updateIntError) {
          throw new Error(`Failed to complete interview record: ${updateIntError.message}`);
        }

        // Update application status based on result
        const finalAppStatus = resultStatus === 'passed' ? 'accepted' : 'rejected';
        await supabaseAdmin
          .from('applications')
          .update({ status: finalAppStatus })
          .eq('application_id', interview.application_id);

        return res.status(200).json({
          finished: true,
          score: score,
          feedback: feedback,
          results: {
            total_score: finalScorePercentage,
            result: resultStatus,
            passing_threshold: passingThreshold
          }
        });
      }

    } catch (error) {
      console.error('[InterviewController] Submit answer error:', error);
      return res.status(500).json({
        error: 'Failed to process answer submission.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * GET /api/interviews/:interviewId/results
   * Get final score, details and full question/answer list of the interview.
   */
  static async getInterviewResults(req, res) {
    try {
      const userId = req.user.id;
      const { interviewId } = req.params;

      // 1. Fetch interview with application & candidate details
      const { data: interview, error: intError } = await supabaseAdmin
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

      if (intError || !interview) {
        return res.status(404).json({ error: 'Interview not found.' });
      }

      // 2. Resolve candidate_id
      const { data: candidate, error: candidateError } = await supabaseAdmin
        .from('candidates')
        .select('candidate_id')
        .eq('user_id', userId)
        .single();

      if (candidateError || !candidate) {
        return res.status(403).json({ error: 'Candidate profile not found.' });
      }

      // Check ownership
      if (interview.applications?.candidate_id !== candidate.candidate_id) {
        return res.status(403).json({ error: 'You do not have access to this interview results.' });
      }

      // 3. Fetch questions and answers for this interview
      const { data: questions, error: qError } = await supabaseAdmin
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

      if (qError) {
        throw new Error(`Failed to fetch interview questions: ${qError.message}`);
      }

      // Format response
      const breakdown = questions.map(q => {
        const answer = q.answers && q.answers.length > 0 ? q.answers[0] : null;
        return {
          question_id: q.question_id,
          question_text: q.question_text,
          difficulty: q.difficulty,
          topic: q.topic,
          sequence_number: q.sequence_number,
          candidate_response: answer ? answer.candidate_response : null,
          score: answer ? answer.score : 0,
          feedback: answer ? answer.ai_feedback : 'No response provided.',
          time_taken_seconds: answer ? answer.time_taken_seconds : 0
        };
      });

      return res.json({
        interview: {
          interview_id: interview.interview_id,
          job_title: interview.applications?.jobs?.title,
          total_score: interview.total_score,
          result: interview.result,
          status: interview.status,
          passing_threshold: interview.applications?.jobs?.passing_threshold || 60,
          created_at: interview.created_at
        },
        breakdown: breakdown
      });

    } catch (error) {
      console.error('[InterviewController] Get results error:', error);
      return res.status(500).json({ error: 'Failed to fetch interview results.' });
    }
  }

  /**
   * GET /api/interviews/my-interviews
   * Candidate lists their interviews.
   */
  static async getMyInterviews(req, res) {
    try {
      const userId = req.user.id;

      // 1. Resolve candidate_id
      const { data: candidate } = await supabaseAdmin
        .from('candidates')
        .select('candidate_id')
        .eq('user_id', userId)
        .single();

      if (!candidate) {
        return res.status(403).json({ error: 'Candidate profile not found.' });
      }

      // 2. Fetch interviews
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
        .eq('applications.candidate_id', candidate.candidate_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch candidate interviews: ${error.message}`);
      }

      // Filter out interviews where join returned null (shouldn't happen with inner joins, but supabase does left join by default)
      const filtered = interviews.filter(item => item.applications !== null);

      return res.json({ interviews: filtered });

    } catch (error) {
      console.error('[InterviewController] Get my interviews error:', error);
      return res.status(500).json({ error: 'Failed to fetch your interviews.' });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  PRIVATE HELPER: Generate & Save Question
  // ═══════════════════════════════════════════════════════════════
  
  static async generateAndSaveQuestion(interviewId, job, sequenceNumber, difficulty = 'Medium') {
    // 1. Extract dynamic topic from required skills
    const skills = job.required_skill ? job.required_skill.split(',').map(s => s.trim()) : [];
    const defaultTopics = ['Core Technical Concepts', 'Problem Solving & Algorithms', 'System Architecture', 'Coding Standards & Refactoring', 'Scenario-based Troubleshooting'];
    
    // Choose topic based on sequence number
    let topic = defaultTopics[(sequenceNumber - 1) % defaultTopics.length];
    if (skills.length > 0) {
      topic = skills[(sequenceNumber - 1) % skills.length];
    }

    console.log(`[InterviewController] Generating question #${sequenceNumber} for job "${job.title}". Topic: "${topic}". Difficulty: "${difficulty}"...`);

    // 2. Generate question using AIService
    const questionObj = await AIService.getNextQuestion(job.title, difficulty, topic);

    // 3. Save to database
    const { data: savedQuestion, error: insertError } = await supabaseAdmin
      .from('questions')
      .insert({
        interview_id: interviewId,
        difficulty: difficulty,
        question_text: questionObj.question,
        expected_answer_keywords: JSON.stringify(questionObj.expected_answer_keywords || []),
        topic: topic,
        sequence_number: sequenceNumber
      })
      .select('question_id, question_text, sequence_number')
      .single();

    if (insertError) {
      throw new Error(`Failed to save generated question: ${insertError.message}`);
    }

    return savedQuestion;
  }
}

module.exports = InterviewController;
