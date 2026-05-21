const { z } = require('zod');

/**
 * Schema for starting a candidate interview session
 */
const startInterviewSchema = z.object({
  application_id: z
    .string({ required_error: 'application_id is required' })
    .uuid({ message: 'application_id must be a valid UUID' })
});

/**
 * Schema for submitting an interview answer response
 */
const submitAnswerSchema = z.object({
  question_id: z
    .string({ required_error: 'question_id is required' })
    .uuid({ message: 'question_id must be a valid UUID' }),
  candidate_response: z
    .string({ required_error: 'candidate_response is required' })
    .trim()
    .min(5, { message: 'candidate_response must be at least 5 characters long' }),
  time_taken_seconds: z
    .number()
    .int()
    .nonnegative({ message: 'time_taken_seconds must be a non-negative integer' })
    .optional()
});

module.exports = {
  startInterviewSchema,
  submitAnswerSchema
};
