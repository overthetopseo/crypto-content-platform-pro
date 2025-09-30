import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { GrokProvider } from './grok';
import { DeepSeekProvider } from './deepseek';
import { GoogleAIProvider } from './google';
import { AIProvider, AIGenerateRequest, AIGenerateResponse, MODEL_CONFIGS, ModelProvider } from './types';

export * from './types';

class AIManager {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('grok', new GrokProvider());
    this.providers.set('deepseek', new DeepSeekProvider());
    this.providers.set('googleAI', new GoogleAIProvider());
  }

  async generate(
    provider: ModelProvider,
    request: Omit<AIGenerateRequest, 'model'> & { model: string }
  ): Promise<AIGenerateResponse> {
    const aiProvider = this.providers.get(provider);
    if (!aiProvider) {
      throw new Error(`Provider ${provider} not found`);
    }

    // Validate model exists for provider
    const availableModels = aiProvider.getAvailableModels();
    if (!availableModels.includes(request.model)) {
      throw new Error(`Model ${request.model} not available for provider ${provider}`);
    }

    try {
      return await aiProvider.generate({
        ...request,
        model: request.model,
      });
    } catch (error) {
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getAvailableModels(): Record<ModelProvider, { id: string; name: string; maxTokens: number }[]> {
    const result = {} as Record<ModelProvider, { id: string; name: string; maxTokens: number }[]>;
    
    for (const [providerKey, modelConfig] of Object.entries(MODEL_CONFIGS)) {
      const provider = providerKey as ModelProvider;
      result[provider] = Object.entries(modelConfig).map(([id, config]) => ({
        id,
        name: config.name,
        maxTokens: config.maxTokens,
      }));
    }
    
    return result;
  }

  getProvider(provider: ModelProvider): AIProvider | undefined {
    return this.providers.get(provider);
  }

  getAllProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Singleton instance
let aiManager: AIManager | null = null;

export function getAIManager(): AIManager {
  if (!aiManager) {
    aiManager = new AIManager();
  }
  return aiManager;
}