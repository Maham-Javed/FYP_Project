/**
 * This is a wrapper around the AI Provider (e.g., OpenAI, Google Gemini).
 * It abstracts away logic so that if you ever need to change the provider,
 * you only need to change it here.
 */

class LLMClient {
  /**
   * Generates a response from the LLM based on system and user prompts.
   * @param {string} systemPrompt 
   * @param {string} userPrompt 
   * @param {object} options Options (temperature, maxTokens, etc.)
   * @returns {Promise<string|object>} AI output
   */
    static async generate(systemPrompt, userPrompt, options = {}) {
        const temperature = options.temperature || 0.7;
        
        // Placeholder for real LLM integration (e.g., using OpenAI client)
        // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        // const response = await openai.chat.completions.create({...})
        
        console.log(`[LLMClient] Generating with temp ${temperature}...`);
        
        // Return a mock response for now
        return JSON.stringify({
           mock_feedback: "AI integration pending.",
           status: "success"
        });
    }

   /**
    * Wrapper specifically for cases where we strictly expect JSON
    */
    static async generateJSON(systemPrompt, userPrompt, options = {}) {
        const result = await this.generate(systemPrompt, userPrompt, { ...options, response_format: 'json_object' });
        try {
            return JSON.parse(result);
        } catch (e) {
            console.error('LLM output was not valid JSON', e);
            throw new Error('LLM failed to return structured JSON');
        }
    }
}

module.exports = LLMClient;
