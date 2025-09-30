import axios from 'axios';
import { AIProvider, GenerationOptions } from './types';

export class DeepseekAdapter implements AIProvider {
  name = 'Deepseek';
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getAvailableModels(): string[] {
    return [
      'deepseek-chat',
      'deepseek-coder',
      'deepseek-chat-v3',
      'deepseek-coder-v2'
    ];
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_deepseek_api_key_here';
  }

  async generateContent(prompt: string, options?: GenerationOptions): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Deepseek API key is not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: options?.model || 'deepseek-chat',
          messages: [
            ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
            { role: 'user' as const, content: prompt }
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
          top_p: options?.topP,
          frequency_penalty: options?.frequencyPenalty,
          presence_penalty: options?.presencePenalty,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Deepseek API error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Deepseek API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw new Error(`Deepseek API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *generateStream(prompt: string, options?: GenerationOptions): AsyncGenerator<string> {
    if (!this.isConfigured()) {
      throw new Error('Deepseek API key is not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options?.model || 'deepseek-chat',
          messages: [
            ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
            { role: 'user' as const, content: prompt }
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
          top_p: options?.topP,
          frequency_penalty: options?.frequencyPenalty,
          presence_penalty: options?.presencePenalty,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Deepseek streaming error:', error);
      throw new Error(`Deepseek streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}