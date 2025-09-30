import Anthropic from '@anthropic-ai/sdk';
import { getAIConfig } from '../config';
import { AIProvider, AIGenerateRequest, AIGenerateResponse, MODEL_CONFIGS } from './types';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private client: Anthropic;

  constructor() {
    const config = getAIConfig('anthropic');
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async generate(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    try {
      // Convert messages to Anthropic format
      const systemMessage = request.messages.find(m => m.role === 'system')?.content;
      const messages = request.messages
        .filter(m => m.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      const response = await this.client.messages.create({
        model: request.model,
        max_tokens: request.maxTokens ?? 1000,
        temperature: request.temperature ?? 0.7,
        system: systemMessage,
        messages,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected content type from Anthropic');
      }

      return {
        content: content.text,
        model: request.model,
        provider: this.name,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Anthropic API error: ${error.message} (${error.status})`);
      }
      throw new Error(`Anthropic error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getAvailableModels(): string[] {
    return Object.keys(MODEL_CONFIGS.anthropic);
  }
}