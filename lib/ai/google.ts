import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, GenerationOptions } from './types';

export class GoogleAIAdapter implements AIProvider {
  name = 'Google AI';
  private client: GoogleGenerativeAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  getAvailableModels(): string[] {
    return [
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash-8b',
      'gemini-pro',
      'gemini-pro-vision'
    ];
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_google_ai_api_key_here';
  }

  async generateContent(prompt: string, options?: GenerationOptions): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Google AI API key is not configured');
    }

    try {
      const modelName = options?.model || 'gemini-1.5-pro';
      const model = this.client.getGenerativeModel({ model: modelName });

      const fullPrompt = options?.systemPrompt 
        ? `${options.systemPrompt}\n\n${prompt}`
        : prompt;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Google AI API error:', error);
      throw new Error(`Google AI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *generateStream(prompt: string, options?: GenerationOptions): AsyncGenerator<string> {
    if (!this.isConfigured()) {
      throw new Error('Google AI API key is not configured');
    }

    try {
      const modelName = options?.model || 'gemini-1.5-pro';
      const model = this.client.getGenerativeModel({ model: modelName });

      const fullPrompt = options?.systemPrompt 
        ? `${options.systemPrompt}\n\n${prompt}`
        : prompt;

      const result = await model.generateContentStream(fullPrompt);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      console.error('Google AI streaming error:', error);
      throw new Error(`Google AI streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}