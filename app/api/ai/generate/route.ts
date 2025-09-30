import { NextRequest, NextResponse } from 'next/server';
import { getAIManager, ModelProvider, AIMessage } from '@/lib/ai';
import { validateConfig } from '@/lib/config';
import { z } from 'zod';

// Request validation schema
const generateRequestSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'grok', 'deepseek', 'googleAI']),
  model: z.string(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate configuration
    const configValidation = validateConfig();
    if (!configValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Server configuration error',
          details: configValidation.errors,
        },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = generateRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request format',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { provider, model, messages, temperature, maxTokens } = validation.data;

    // Get AI manager and generate response
    const aiManager = getAIManager();
    
    const response = await aiManager.generate(provider as ModelProvider, {
      model,
      messages: messages as AIMessage[],
      temperature,
      maxTokens,
    });

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve available models
export async function GET() {
  try {
    const configValidation = validateConfig();
    if (!configValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Server configuration error',
          details: configValidation.errors,
        },
        { status: 500 }
      );
    }

    const aiManager = getAIManager();
    const availableModels = aiManager.getAvailableModels();
    
    return NextResponse.json({
      success: true,
      data: {
        models: availableModels,
        providers: aiManager.getAllProviders(),
      },
    });

  } catch (error) {
    console.error('Get Models Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve models',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}