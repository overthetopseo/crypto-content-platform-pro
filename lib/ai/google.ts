import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAIConfig } from '../config';
import { AIProvider, AIGenerateRequest, AIGenerateResponse, MODEL_CONFIGS } from './types';

export class GoogleAIProvider implements AIProvider {
  name = 'googleAI';
  private client: GoogleGenerativeAI;

  constructor() {
    const config = getAIConfig('googleAI');
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async generate(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    try {
      const model = this.client.getGenerativeModel({ model: request.model });

      // Convert messages to Google AI format
      const systemInstruction = request.messages.find(m => m.role === 'system')?.content;
      const messages = request.messages.filter(m => m.role !== 'system');
      
      // Build conversation history
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) {
        throw new Error('No messages provided');
      }

      const chat = model.startChat({
        history,
        systemInstruction,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? 1000,
        },
      });

      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No content in Google AI response');
      }

      return {
        content: text,
        model: request.model,
        provider: this.name,
        usage: response.usageMetadata ? {
          inputTokens: response.usageMetadata.promptTokenCount || 0,
          outputTokens: response.usageMetadata.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata.totalTokenCount || 0,
        } : undefined,
      };
    } catch (error) {
      throw new Error(`Google AI error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getAvailableModels(): string[] {
    return Object.keys(MODEL_CONFIGS.googleAI);
  }
}