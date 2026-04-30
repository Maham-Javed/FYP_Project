const LLMClient = require('../utils/llmClient');
const prompts = require('../utils/prompts/interviewPrompts');

/**
 * Service orchestrating AI-related business logic.
 * Takes the heavy logic out of the standard Express controllers.
 */
class AIService {
    
    /**
     * Generate the next interview question
     */
    static async getNextQuestion(jobTitle, currentDifficulty, topic) {
        try {
            const userPrompt = prompts.generateQuestionPrompt(jobTitle, currentDifficulty, topic);
            const aiResponse = await LLMClient.generateJSON(
                prompts.INTERVIEW_SYSTEM_PROMPT, 
                userPrompt,
                { temperature: 0.6 }
            );

            // Return the structured object containing the question and keywords
            return aiResponse;
        } catch (error) {
            console.error("Error generating question:", error);
            throw new Error("Failed to generate AI question");
        }
    }

    /**
     * Parse and score a candidate's answer
     */
    static async evaluateAnswer(questionText, candidateAnswer, expectedKeywords) {
        try {
            const userPrompt = prompts.evaluateAnswerPrompt(questionText, candidateAnswer, expectedKeywords);
            const aiResponse = await LLMClient.generateJSON(
                prompts.INTERVIEW_SYSTEM_PROMPT,
                userPrompt,
                { temperature: 0.2 }
            );
            
            // Return { score, feedback }
            return aiResponse;
        } catch (error) {
            console.error("Error evaluating answer:", error);
            throw new Error("Failed to evaluate AI answer");
        }
    }
    
    /**
     * Asynchronous resume parsing 
     * E.g., returns JSON representation of skills, education, experience
     */
    static async parseResume(resumeText) {
        // Implementation stub
        console.log("Parsing resume text of length:", resumeText?.length);
        return {
           skills: [],
           education: "",
           experience_years: 0
        };
    }
}

module.exports = AIService;
