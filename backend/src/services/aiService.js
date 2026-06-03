const LLMClient = require('../utils/llmClient');
const prompts = require('../utils/prompts/interviewPrompts');
const { supabaseAdmin } = require('../config/supabase');
const EmbeddingService = require('./embedding.service');

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
            console.warn("[AIService] LLM Question generation failed. Falling back to structured mock question...", error.message);
            
            const mockQuestions = [
                {
                    question: `Explain how you would design and implement a secure, scalable authentication system for a ${jobTitle} application, focusing on token management, CORS, and session security.`,
                    expected_answer_keywords: ["JWT", "OAuth", "session", "refresh token", "cookies", "CORS", "security", "encryption"]
                },
                {
                    question: `Describe a complex technical challenge you faced while working with ${topic || 'software architecture'}, and how you solved it.`,
                    expected_answer_keywords: ["challenge", "performance", "scaling", "debugging", "solution", "architecture"]
                },
                {
                    question: `How do you handle asynchronous data loading, state management, and side-effects in a modern ${jobTitle} project?`,
                    expected_answer_keywords: ["async", "await", "state", "loading", "promises", "caching", "performance"]
                },
                {
                    question: `What are the best practices for logging, error handling, and monitoring in a production-level ${jobTitle} service?`,
                    expected_answer_keywords: ["logging", "error handling", "monitoring", "try-catch", "sentry", "alerting"]
                }
            ];
            
            // Choose a mock question based on the topic/jobTitle
            const idx = Math.floor(Math.random() * mockQuestions.length);
            return mockQuestions[idx];
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
            console.warn("[AIService] LLM Evaluation failed. Falling back to keyword-based offline scoring...", error.message);
            
            // Evaluate based on keywords present in answer
            const cleanAnswer = (candidateAnswer || "").toLowerCase();
            const matchingKeywords = (expectedKeywords || []).filter(k => 
                cleanAnswer.includes(k.toLowerCase())
            );
            
            const keywordScore = Math.min(Math.round((matchingKeywords.length / Math.max(expectedKeywords.length, 1)) * 10), 10);
            
            // Add points for length of response (max 3 points for >150 chars)
            const lengthScore = Math.min(Math.floor(cleanAnswer.length / 50), 3);
            const finalScore = Math.min(keywordScore + lengthScore + 4, 10); // Base score of 4
            
            return {
                score: finalScore,
                feedback: `[Offline Mode] Evaluation fallback active. Found keywords: ${matchingKeywords.join(', ') || 'none'}. Technical detail: ${cleanAnswer.length} characters.`
            };
        }
    }
    
    /**
     * Asynchronous resume parsing 
     * E.g., returns JSON representation of skills, education, experience
     */
    static async parseResume(candidateId, resumeText) {
        try {
            console.log(`[AIService] Parsing resume for candidate ${candidateId} (text length: ${resumeText?.length})`);
            
            const userPrompt = prompts.resumeParserPrompt(resumeText);
            const parsed = await LLMClient.generateJSON(
                prompts.RESUME_PARSER_SYSTEM_PROMPT,
                userPrompt,
                { temperature: 0.1 }
            );

            console.log(`[AIService] Successfully parsed resume. Upserting into resume_parse_data...`);

            const { data, error } = await supabaseAdmin
                .from('resume_parse_data')
                .upsert({
                    candidate_id: candidateId,
                    skills: parsed.skills,
                    education: parsed.education,
                    experience_years: parsed.experience_years
                }, { onConflict: 'candidate_id' })
                .select()
                .single();

            if (error) {
                console.error("[AIService] Failed to upsert parsed resume data:", error);
                throw new Error(`Failed to save parsed resume data: ${error.message}`);
            }

            console.log(`[AIService] Saved parsed resume data. Generating embedding...`);
            
            // Build profile text and generate/store profile embedding
            const profileText = EmbeddingService.buildProfileText(data);
            await EmbeddingService.generateProfileEmbedding(candidateId, profileText);

            return data;
        } catch (error) {
            console.error("Error parsing resume:", error);
            throw error;
        }
    }
}

module.exports = AIService;
