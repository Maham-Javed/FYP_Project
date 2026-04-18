/**
 * Centralized list of prompts for the recruitment system.
 * Treat these as configuration values.
 */

const INTERVIEW_SYSTEM_PROMPT = `You are a technical interviewer evaluating a candidate for a role.
Your goal is to test the candidate strictly based on the requested skill and difficulty.
Return your responses in standard JSON format.
You must adjust the next question based on how they answer.`;

const generateQuestionPrompt = (jobTitle, currentDifficulty, topic) => `
Generate the next interview question for a ${jobTitle} position.
Target Difficulty: ${currentDifficulty}
Focus Topic: ${topic}

Respond with JSON containing:
{
  "question": "string",
  "expected_answer_keywords": ["keyword1", "keyword2"]
}
`;

const evaluateAnswerPrompt = (question, candidateAnswer, expectedKeywords) => `
You are evaluating a candidate's answer to the following question.
Question: ${question}
Candidate's Answer: ${candidateAnswer}
Expected Keywords: ${expectedKeywords.join(', ')}

Please evaluate and score from 1 to 10.
Respond with JSON containing:
{
  "score": integer,
  "feedback": "string explaining the rationale"
}
`;

module.exports = {
    INTERVIEW_SYSTEM_PROMPT,
    generateQuestionPrompt,
    evaluateAnswerPrompt
};
