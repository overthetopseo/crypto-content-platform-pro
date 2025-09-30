export interface AIProvider {
  name: string;
  generateContent(prompt: string, options?: GenerationOptions): Promise<string>;
  generateStream?(prompt: string, options?: GenerationOptions): Promise<AsyncGenerator<string>>;
  isConfigured(): boolean;
  getAvailableModels(): string[];
}

export interface GenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type SupportedProvider = 
  | 'openai'
  | 'anthropic' 
  | 'google'
  | 'grok'
  | 'deepseek';

export interface ProviderConfig {
  name: string;
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
  availableModels: string[];
}