import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import aiService from '@/lib/ai';
import { SupportedProvider } from '@/lib/ai/types';

// Request schema for validation
const generateRequestSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google', 'grok', 'deepseek']),
  prompt: z.string().min(1, 'Prompt is required'),
  options: z.object({
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(8000).optional(),
    systemPrompt: z.string().optional(),
    topP: z.number().min(0).max(1).optional(),
    frequencyPenalty: z.number().min(-2).max(2).optional(),
    presencePenalty: z.number().min(-2).max(2).optional(),
  }).optional(),
  stream: z.boolean().default(false),
});

// GET endpoint to get provider information
export async function GET() {
  try {
    const providersInfo = aiService.getAllProvidersInfo();
    const configuration = aiService.validateConfiguration();

    return NextResponse.json({
      providers: providersInfo,
      configuration: {
        isHealthy: configuration.isHealthy,
        configuredProviders: configuration.configuredProviders,
        missingProviders: configuration.missingProviders,
        errors: configuration.errors,
      },
    });
  } catch (error) {
    console.error('Error fetching AI providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI providers information' },
      { status: 500 }
    );
  }
}

// POST endpoint to generate content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateRequestSchema.parse(body);

    const { provider, prompt, options, stream } = validatedData;

    // Check if provider is available and configured
    const providerInfo = aiService.getProviderInfo(provider);
    if (!providerInfo) {
      return NextResponse.json(
        { error: `Provider '${provider}' is not available` },
        { status: 400 }
      );
    }

    if (!providerInfo.isConfigured) {
      return NextResponse.json(
        { error: `Provider '${provider}' is not configured. Please check your API key.` },
        { status: 400 }
      );
    }

    // Validate model if provided
    if (options?.model && !providerInfo.availableModels.includes(options.model)) {
      return NextResponse.json(
        { 
          error: `Model '${options.model}' is not available for provider '${provider}'`,
          availableModels: providerInfo.availableModels
        },
        { status: 400 }
      );
    }

    if (stream) {
      // For streaming, we need to handle it differently
      const encoder = new TextEncoder();
      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of aiService.generateStream(provider, prompt, options)) {
              const data = JSON.stringify({ content: chunk });
              const formattedData = `data: ${data}\n\n`;
              controller.enqueue(encoder.encode(formattedData));
            }
            
            // Send final message
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            const errorData = JSON.stringify({ 
              error: error instanceof Error ? error.message : 'Unknown streaming error' 
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const content = await aiService.generateContent(provider, prompt, options);
      
      return NextResponse.json({
        content,
        provider,
        model: options?.model || providerInfo.availableModels[0],
        usage: {
          // Note: Usage tracking would need to be implemented in each adapter
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      });
    }
  } catch (error) {
    console.error('Error generating content:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}