import OpenAI from 'openai';
import { getAIConfig } from '../config';
import { AIProvider, AIGenerateRequest, AIGenerateResponse, MODEL_CONFIGS } from './types';

export class GrokProvider implements AIProvider {
  name = 'grok';
  private client: OpenAI;

  constructor() {
    const config = getAIConfig('grok');
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.x.ai/v1',
    });
  }

  async generate(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: request.model,
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1000,
        stream: false,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error('No content in Grok response');
      }

      return {
        content: choice.message.content,
        model: request.model,
        provider: this.name,
        usage: response.usage ? {
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`Grok API error: ${error.message} (${error.status})`);
      }
      throw new Error(`Grok error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getAvailableModels(): string[] {
    return Object.keys(MODEL_CONFIGS.grok);
  }
}