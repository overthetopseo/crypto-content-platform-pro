/**
 * Server-side configuration module for AI API keys and other sensitive credentials.
 * This module ensures API keys are only accessible server-side and never exposed to the client bundle.
 */

// AI Configuration Types
export interface AIConfig {
  openai: {
    apiKey: string;
    baseURL?: string;
  };
  grok: {
    apiKey: string;
    baseURL?: string;
  };
  deepseek: {
    apiKey: string;
    baseURL?: string;
  };
  googleAI: {
    apiKey: string;
  };
  anthropic: {
    apiKey: string;
  };
  googleDrive: {
    apiKey: string;
  };
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface AppConfig {
  ai: AIConfig;
  supabase: SupabaseConfig;
  nodeEnv: string;
}

/**
 * Validates that a required environment variable is present
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Gets configuration with validation.
 * This function should only be called server-side.
 */
export function getConfig(): AppConfig {
  // Verify we're running server-side
  if (typeof window !== 'undefined') {
    throw new Error('Config should only be accessed server-side');
  }

  return {
    ai: {
      openai: {
        apiKey: requireEnv('OPENAI_API_KEY'),
        baseURL: process.env.OPENAI_BASE_URL,
      },
      grok: {
        apiKey: requireEnv('GROK_API_KEY'),
        baseURL: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
      },
      deepseek: {
        apiKey: requireEnv('DEEPSEEK_API_KEY'),
        baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
      },
      googleAI: {
        apiKey: requireEnv('GOOGLE_AI_API_KEY'),
      },
      anthropic: {
        apiKey: requireEnv('ANTHROPIC_API_KEY'),
      },
      googleDrive: {
        apiKey: requireEnv('GOOGLE_DRIVE_API_KEY'),
      },
    },
    supabase: {
      url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    },
    nodeEnv: process.env.NODE_ENV || 'development',
  };
}

/**
 * Get specific AI service configuration
 */
export function getAIConfig(service: keyof AIConfig) {
  const config = getConfig();
  return config.ai[service];
}

/**
 * Check if all required environment variables are present
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const requiredVars = [
    'OPENAI_API_KEY',
    'GROK_API_KEY',
    'DEEPSEEK_API_KEY',
    'GOOGLE_AI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_DRIVE_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing environment variable: ${varName}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}