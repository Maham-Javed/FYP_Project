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
