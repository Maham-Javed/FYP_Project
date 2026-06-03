const InterviewRepository = require('../repositories/interview.repository');
const AIService = require('../services/aiService');
const { BadRequestError, ForbiddenError, NotFoundError } = require('../middlewares/errorHandler');

class InterviewController {
  /**
   * POST /api/interviews/start
   * Start a new interview for a given application.
   * Body: { application_id: UUID }
   * Auth: Requires candidate role
   */
  static async startInterview(req, res, next) {
    try {
      const userId = req.user.id;
      const { application_id } = req.body;

      // 1. Resolve candidate_id
      const candidateId = await InterviewRepository.resolveCandidateId(userId);
      if (!candidateId) {
        return next(new ForbiddenError('Candidate profile not found.'));
      }

      // 2. Fetch the application to verify ownership and get job info
      const application = await InterviewRepository.getApplicationAndJob(application_id, candidateId);
      if (!application) {
        return next(new NotFoundError('Application not found or you do not own it.'));
      }

      if (application.status === 'rejected') {
        return next(new BadRequestError('This application has been rejected; you cannot take an interview.'));
      }

      // 3. Check if an interview already exists for this application
      let existingInterview = await InterviewRepository.getExistingInterview(application_id);

      if (existingInterview) {
        // Dev helper: If we are in development mode and the resumed interview has > 5 questions, delete it and start a clean session
        const lastQuestion = await InterviewRepository.getLastGeneratedQuestion(existingInterview.interview_id);
        const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
        if (isDev && lastQuestion && lastQuestion.sequence_number > 5) {
          console.log(`[InterviewController] Dev Reset: deleting stale interview session (${existingInterview.interview_id}) to start fresh.`);
          await InterviewRepository.deleteInterview(application_id);
          existingInterview = null;
        }
      }

      if (existingInterview) {
        if (existingInterview.status === 'completed') {
          return res.status(209).json({
            error: 'You have already completed the interview for this application.',
            interview_id: existingInterview.interview_id,
            status: 'completed',
            finished: true
          });
        }
        
        console.log(`[InterviewController] Resuming existing interview ${existingInterview.interview_id}`);
        
        // Fetch the last question generated
        const lastQuestion = await InterviewRepository.getLastGeneratedQuestion(existingInterview.interview_id);

        if (!lastQuestion) {
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
        const isAnswered = await InterviewRepository.checkQuestionAnswered(lastQuestion.question_id);

        if (isAnswered) {
          // If the last question has been answered, generate the next one (if under limit)
          const nextSeq = lastQuestion.sequence_number + 1;
          if (nextSeq <= 5) {
            const nextQuestion = await InterviewController.generateAndSaveQuestion(
              existingInterview.interview_id,
              application.jobs,
              nextSeq,
              lastQuestion.difficulty // carry forward difficulty
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

      // 4. Create new interview record atomically (includes updating application status)
      const initialDifficulty = application.jobs?.interview_difficulty || 'Medium';
      const newInterview = await InterviewRepository.startInterviewAtomic(application_id, initialDifficulty);

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
      next(error);
    }
  }

  /**
   * POST /api/interviews/:interviewId/answer
   * Submit an answer to the current question, evaluate it, and generate the next question.
   * Params: interviewId
   * Body: { question_id, candidate_response, time_taken_seconds }
   */
  static async submitAnswer(req, res, next) {
    try {
      const userId = req.user.id;
      const { interviewId } = req.params;
      const { question_id, candidate_response, time_taken_seconds } = req.body;

      // 1. Resolve candidate_id
      const candidateId = await InterviewRepository.resolveCandidateId(userId);
      if (!candidateId) {
        return next(new ForbiddenError('Candidate profile not found.'));
      }

      // 2. Fetch the interview and verify candidate owns it
      const interview = await InterviewRepository.getInterviewDetails(interviewId);
      if (!interview) {
        return next(new NotFoundError('Interview not found.'));
      }

      if (interview.applications?.candidate_id !== candidateId) {
        return next(new ForbiddenError('You do not have permission to access this interview.'));
      }

      if (interview.status === 'completed') {
        return next(new BadRequestError('This interview has already been completed.'));
      }

      // 3. Verify the question belongs to this interview
      const question = await InterviewRepository.getQuestion(question_id, interviewId);
      if (!question) {
        return next(new BadRequestError('Question not found in this interview.'));
      }

      // Check if this question is already answered
      const isAlreadyAnswered = await InterviewRepository.checkQuestionAnswered(question_id);
      if (isAlreadyAnswered) {
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

      await InterviewRepository.saveAnswer(
        question_id,
        candidate_response,
        score,
        feedback,
        time_taken_seconds
      );

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
          await InterviewRepository.updateInterviewDifficulty(interviewId, newDifficulty);
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

        const allQuestions = await InterviewRepository.getAllQuestions(interviewId);
        const questionIds = allQuestions.map(q => q.question_id);

        const allAnswers = await InterviewRepository.getAllAnswers(questionIds);
        const totalEarnedScore = allAnswers.reduce((sum, ans) => sum + (ans.score || 0), 0);
        
        const maxPossibleScore = maxQuestions * 10;
        const finalScorePercentage = Math.round((totalEarnedScore / maxPossibleScore) * 100);

        // Determine result based on passing threshold
        const passingThreshold = interview.applications.jobs?.passing_threshold || 60;
        const resultStatus = finalScorePercentage >= passingThreshold ? 'pass' : 'fail';

        // Update interview status and application status atomically inside a transaction
        const finalAppStatus = resultStatus === 'pass' ? 'accepted' : 'rejected';
        await InterviewRepository.finalizeInterviewAtomic(
          interviewId,
          interview.application_id,
          finalScorePercentage,
          resultStatus,
          finalAppStatus
        );

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
      next(error);
    }
  }

  /**
   * GET /api/interviews/:interviewId/results
   * Get final score, details and full question/answer list of the interview.
   */
  static async getInterviewResults(req, res, next) {
    try {
      const userId = req.user.id;
      const { interviewId } = req.params;

      // 1. Fetch interview with application & candidate details
      const interview = await InterviewRepository.getInterviewDetails(interviewId);
      if (!interview) {
        return next(new NotFoundError('Interview not found.'));
      }

      // 2. Resolve candidate_id
      const candidateId = await InterviewRepository.resolveCandidateId(userId);
      if (!candidateId) {
        return next(new ForbiddenError('Candidate profile not found.'));
      }

      // Check ownership
      if (interview.applications?.candidate_id !== candidateId) {
        return next(new ForbiddenError('You do not have access to this interview results.'));
      }

      // 3. Fetch questions and answers for this interview
      const questions = await InterviewRepository.getQuestionsAndAnswers(interviewId);

      // Format response and map answers (handling Supabase returning single object or array)
      const mapped = questions.map(q => {
        let answer = null;
        if (q.answers) {
          if (Array.isArray(q.answers)) {
            answer = q.answers.length > 0 ? q.answers[0] : null;
          } else {
            answer = q.answers;
          }
        }

        return {
          question_id: q.question_id,
          question_text: q.question_text,
          difficulty: q.difficulty,
          topic: q.topic,
          sequence_number: q.sequence_number,
          candidate_response: answer ? answer.candidate_response : null,
          score: answer ? answer.score : 0,
          feedback: answer ? answer.ai_feedback : 'No response provided.',
          time_taken_seconds: answer ? answer.time_taken_seconds : 0,
          has_answer: !!answer
        };
      });

      // Filter duplicates by keeping the answered one if there are duplicates for a sequence_number
      const filteredBreakdownMap = new Map();
      for (const item of mapped) {
        const seq = item.sequence_number;
        if (!filteredBreakdownMap.has(seq)) {
          filteredBreakdownMap.set(seq, item);
        } else {
          const existing = filteredBreakdownMap.get(seq);
          if (item.has_answer && !existing.has_answer) {
            filteredBreakdownMap.set(seq, item);
          }
        }
      }

      const breakdown = Array.from(filteredBreakdownMap.values()).map(item => {
        const { ...copy } = item;
        delete copy.has_answer;
        return copy;
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
      next(error);
    }
  }

  /**
   * GET /api/interviews/my-interviews
   * Candidate lists their interviews.
   */
  static async getMyInterviews(req, res, next) {
    try {
      const userId = req.user.id;

      // 1. Resolve candidate_id
      const candidateId = await InterviewRepository.resolveCandidateId(userId);
      if (!candidateId) {
        return next(new ForbiddenError('Candidate profile not found.'));
      }

      // 2. Fetch interviews
      const interviews = await InterviewRepository.getCandidateInterviews(candidateId);
      const filtered = interviews.filter(item => item.applications !== null);

      return res.json({ interviews: filtered });

    } catch (error) {
      console.error('[InterviewController] Get my interviews error:', error);
      next(error);
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

    // 3. Save to database via Repository
    const savedQuestion = await InterviewRepository.saveGeneratedQuestion(
      interviewId,
      difficulty,
      questionObj.question,
      questionObj.expected_answer_keywords,
      topic,
      sequenceNumber
    );

    return savedQuestion;
  }
}

module.exports = InterviewController;
