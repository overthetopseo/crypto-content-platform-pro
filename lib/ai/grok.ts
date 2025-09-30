import axios from 'axios';
import { AIProvider, GenerationOptions } from './types';

export class GrokAdapter implements AIProvider {
  name = 'Grok';
  private apiKey: string;
  private baseUrl = 'https://api.x.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getAvailableModels(): string[] {
    return [
      'grok-2',
      'grok-2-latest',
      'grok-vision-beta'
    ];
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_xai_api_key_here';
  }

  async generateContent(prompt: string, options?: GenerationOptions): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Grok API key is not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: options?.model || 'grok-2',
          messages: [
            ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
            { role: 'user' as const, content: prompt }
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
          top_p: options?.topP,
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
      console.error('Grok API error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Grok API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw new Error(`Grok API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *generateStream(prompt: string, options?: GenerationOptions): AsyncGenerator<string> {
    if (!this.isConfigured()) {
      throw new Error('Grok API key is not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options?.model || 'grok-2',
          messages: [
            ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
            { role: 'user' as const, content: prompt }
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
          top_p: options?.topP,
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
      console.error('Grok streaming error:', error);
      throw new Error(`Grok streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}