import { useMutation, useQuery } from '@tanstack/react-query';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerateRequest {
  provider: 'openai' | 'anthropic' | 'grok' | 'deepseek' | 'googleAI';
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function generateContent(request: GenerateRequest): Promise<GenerateResponse> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const result: APIResponse<GenerateResponse> = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to generate content');
  }

  return result.data;
}

async function fetchAvailableModels() {
  const response = await fetch('/api/ai/generate');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const result: APIResponse<{
    models: Record<string, { id: string; name: string; maxTokens: number }[]>;
    providers: string[];
  }> = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch models');
  }

  return result.data;
}

export function useAIGeneration() {
  return useMutation({
    mutationFn: generateContent,
  });
}

export function useAvailableModels() {
  return useQuery({
    queryKey: ['ai-models'],
    queryFn: fetchAvailableModels,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}