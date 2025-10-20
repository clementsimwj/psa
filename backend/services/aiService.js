// backend/services/aiService.js
const axios = require('axios');
const { PSA_SYSTEM_PROMPT, PSA_CONTEXT_TEMPLATE } = require('../prompts/systemPrompt');

/**
 * Azure OpenAI Service
 * Handles all interactions with PSA's Azure OpenAI deployment
 */
class AIService {
  constructor() {
    this.apiUri = process.env.PSA_API_URI;
    this.apiKey = process.env.PSA_PRIMARY_KEY;
    this.apiVersion = process.env.PSA_API_VERSION;
    this.deploymentId = process.env.PSA_DEPLOYMENT_ID;
    
    // Use enhanced system prompt
    this.systemPrompt = PSA_SYSTEM_PROMPT;
  }

  /**
   * Send a question to Azure OpenAI and get a response
   * @param {string} userQuestion - The user's question
   * @param {Array} conversationHistory - Previous messages for context (optional)
   * @param {Object} metrics - Dashboard metrics object (optional)
   * @returns {Promise<string>} - AI response
   */
  async askQuestion(userQuestion, conversationHistory = [], metrics = null) {
    try {
      // Build messages array with system prompt and context
      const messages = [
        {
          role: 'system',
          content: this.systemPrompt
        }
      ];

      // Add dashboard context if metrics provided
      if (metrics) {
        const contextText = PSA_CONTEXT_TEMPLATE(metrics);
        messages.push({
          role: 'system',
          content: contextText
        });
      }

      // Add conversation history (last 10 messages for context)
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory);

      // Add current user question
      messages.push({
        role: 'user',
        content: userQuestion
      });

      console.log('🤖 Calling Azure OpenAI...');
      console.log('📝 Messages count:', messages.length);

      // Call Azure OpenAI API
      const response = await axios.post(
        this.apiUri,
        {
          messages: messages,
          temperature: 0.7,
          max_tokens: 800,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey
          },
          timeout: 30000 // 30 second timeout
        }
      );

      // Extract the AI's response
      const aiResponse = response.data.choices[0].message.content;
      console.log('✅ AI Response received');
      
      return aiResponse;

    } catch (error) {
      console.error('❌ AI Service Error:', error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - AI is taking too long to respond');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed - Invalid API key');
      }
      
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded - Too many requests');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Azure OpenAI service error - Please try again');
      }
      
      throw new Error('Failed to get AI response: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Generate a summary of key insights from dashboard data
   * @param {Object} dashboardData - Parsed dashboard metrics
   * @returns {Promise<string>} - AI-generated summary
   */
  async generateInsights(dashboardData) {
    const prompt = `Based on the following dashboard metrics, provide a concise executive summary with key observations and recommendations:

${JSON.stringify(dashboardData, null, 2)}

Format your response with:
📊 Key Observations
💼 Business Impact
🎯 Recommended Actions`;

    return await this.askQuestion(prompt);
  }
}

// Export singleton instance
module.exports = new AIService();
