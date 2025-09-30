import { OpenAIAdapter } from './openai';
import { AnthropicAdapter } from './anthropic';
import { GoogleAIAdapter } from './google';
import { GrokAdapter } from './grok';
import { DeepseekAdapter } from './deepseek';
import { AIProvider, SupportedProvider, GenerationOptions } from './types';

class AIService {
  private providers: Map<SupportedProvider, AIProvider> = new Map();
  private initialized = false;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    if (this.initialized) return;

    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIAdapter(process.env.OPENAI_API_KEY));
    }

    // Initialize Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', new AnthropicAdapter(process.env.ANTHROPIC_API_KEY));
    }

    // Initialize Google AI
    if (process.env.GOOGLE_AI_API_KEY) {
      this.providers.set('google', new GoogleAIAdapter(process.env.GOOGLE_AI_API_KEY));
    }

    // Initialize Grok
    if (process.env.XAI_API_KEY) {
      this.providers.set('grok', new GrokAdapter(process.env.XAI_API_KEY));
    }

    // Initialize Deepseek
    if (process.env.DEEPSEEK_API_KEY) {
      this.providers.set('deepseek', new DeepseekAdapter(process.env.DEEPSEEK_API_KEY));
    }

    this.initialized = true;
  }

  public getProvider(providerName: SupportedProvider): AIProvider | undefined {
    return this.providers.get(providerName);
  }

  public getAvailableProviders(): SupportedProvider[] {
    return Array.from(this.providers.keys());
  }

  public getConfiguredProviders(): SupportedProvider[] {
    return Array.from(this.providers.entries())
      .filter(([, provider]) => provider.isConfigured())
      .map(([name]) => name);
  }

  public getProviderInfo(providerName: SupportedProvider) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      return null;
    }

    return {
      name: provider.name,
      isConfigured: provider.isConfigured(),
      availableModels: provider.getAvailableModels(),
    };
  }

  public getAllProvidersInfo() {
    const providers: SupportedProvider[] = ['openai', 'anthropic', 'google', 'grok', 'deepseek'];
    return providers.map(name => this.getProviderInfo(name));
  }

  public async generateContent(
    providerName: SupportedProvider,
    prompt: string,
    options?: GenerationOptions
  ): Promise<string> {
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`Provider '${providerName}' is not available. Please configure the API key.`);
    }

    if (!provider.isConfigured()) {
      throw new Error(`Provider '${providerName}' is not configured. Please check your API key.`);
    }

    return await provider.generateContent(prompt, options);
  }

  public async *generateStream(
    providerName: SupportedProvider,
    prompt: string,
    options?: GenerationOptions
  ): AsyncGenerator<string> {
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`Provider '${providerName}' is not available. Please configure the API key.`);
    }

    if (!provider.isConfigured()) {
      throw new Error(`Provider '${providerName}' is not configured. Please check your API key.`);
    }

    if (!provider.generateStream) {
      throw new Error(`Provider '${providerName}' does not support streaming.`);
    }

    yield* provider.generateStream(prompt, options);
  }

  public validateConfiguration(): {
    isHealthy: boolean;
    configuredProviders: SupportedProvider[];
    missingProviders: SupportedProvider[];
    errors: string[];
  } {
    const errors: string[] = [];
    const configuredProviders: SupportedProvider[] = [];
    const missingProviders: SupportedProvider[] = [];

    const allProviders: SupportedProvider[] = ['openai', 'anthropic', 'google', 'grok', 'deepseek'];

    allProviders.forEach(providerName => {
      const provider = this.providers.get(providerName);
      
      if (!provider) {
        missingProviders.push(providerName);
        errors.push(`${providerName}: API key not found in environment variables`);
      } else if (!provider.isConfigured()) {
        missingProviders.push(providerName);
        errors.push(`${providerName}: Invalid API key`);
      } else {
        configuredProviders.push(providerName);
      }
    });

    return {
      isHealthy: errors.length === 0,
      configuredProviders,
      missingProviders,
      errors
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;