// Unified AI Service Types

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIGenerateRequest {
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIGenerateResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  name: string;
  generate(request: AIGenerateRequest): Promise<AIGenerateResponse>;
  getAvailableModels(): string[];
}

export interface AIError {
  provider: string;
  message: string;
  code?: string;
  status?: number;
}

// Model definitions for each provider
export const MODEL_CONFIGS = {
  openai: {
    'gpt-4o': { name: 'GPT-4o', maxTokens: 4096 },
    'gpt-4o-mini': { name: 'GPT-4o Mini', maxTokens: 4096 },
    'gpt-4-turbo': { name: 'GPT-4 Turbo', maxTokens: 4096 },
    'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', maxTokens: 4096 },
  },
  anthropic: {
    'claude-3-5-sonnet-20241022': { name: 'Claude 3.5 Sonnet', maxTokens: 8192 },
    'claude-3-5-haiku-20241022': { name: 'Claude 3.5 Haiku', maxTokens: 8192 },
    'claude-3-opus-20240229': { name: 'Claude 3 Opus', maxTokens: 4096 },
  },
  grok: {
    'grok-beta': { name: 'Grok Beta', maxTokens: 4096 },
    'grok-vision-beta': { name: 'Grok Vision Beta', maxTokens: 4096 },
  },
  deepseek: {
    'deepseek-chat': { name: 'DeepSeek Chat', maxTokens: 4096 },
    'deepseek-coder': { name: 'DeepSeek Coder', maxTokens: 4096 },
  },
  googleAI: {
    'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', maxTokens: 8192 },
    'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', maxTokens: 8192 },
    'gemini-pro': { name: 'Gemini Pro', maxTokens: 4096 },
  },
} as const;

export type ModelProvider = keyof typeof MODEL_CONFIGS;
export type ModelId<T extends ModelProvider> = keyof typeof MODEL_CONFIGS[T];