/**
 * This is a wrapper around the AI Provider (Groq API).
 * It abstracts away logic so that if you ever need to change the provider,
 * you only need to change it here.
 */

class LLMClient {
  /**
   * Generates a response from the LLM based on system and user prompts.
   * @param {string} systemPrompt 
   * @param {string} userPrompt 
   * @param {object} options Options (temperature, maxTokens, etc.)
   * @returns {Promise<string>} AI output
   */
  static async generate(systemPrompt, userPrompt, options = {}) {
    const temperature = options.temperature !== undefined ? options.temperature : 0.7;
    const maxTokens = options.maxTokens || options.max_tokens || 2048;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.warn("[LLMClient] GROQ_API_KEY is not defined in environment variables. Falling back to mock.");
      return JSON.stringify({
        mock_feedback: "AI integration pending. GROQ_API_KEY is missing.",
        status: "mock_fallback"
      });
    }

    let responseFormat = undefined;
    if (options.response_format) {
      if (options.response_format === 'json_object') {
        responseFormat = { type: 'json_object' };
      } else {
        responseFormat = options.response_format;
      }
    }

    try {
      console.log(`[LLMClient] Sending request to Groq...`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: temperature,
          max_tokens: maxTokens,
          response_format: responseFormat
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[LLMClient] Groq API returned error status:", response.status, errorData);
        throw new Error(`Groq API Error: status ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const responseData = await response.json();
      if (!responseData.choices || responseData.choices.length === 0) {
        console.error("[LLMClient] Invalid choices in response:", responseData);
        throw new Error("Groq API returned an empty completion list.");
      }

      return responseData.choices[0].message.content;
    } catch (error) {
      console.error("[LLMClient] API Request Failed:", error);
      throw error;
    }
  }

  /**
   * Wrapper specifically for cases where we strictly expect JSON
   */
  static async generateJSON(systemPrompt, userPrompt, options = {}) {
    const result = await this.generate(systemPrompt, userPrompt, { ...options, response_format: 'json_object' });
    try {
      return JSON.parse(result);
    } catch (e) {
      console.error('LLM output was not valid JSON:', result, e);
      throw new Error('LLM failed to return structured JSON');
    }
  }
}

module.exports = LLMClient;
