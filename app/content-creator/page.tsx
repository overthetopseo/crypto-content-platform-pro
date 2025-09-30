'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, RefreshCw, Sparkles, Bot } from 'lucide-react';
import { useAIGeneration, useAvailableModels, GenerateRequest, AIMessage } from '@/hooks/use-ai-generation';
import { toast } from 'sonner';

export default function ContentCreatorPage() {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  
  const { data: modelsData, isLoading: isLoadingModels, error: modelsError } = useAvailableModels();
  const { mutate: generateContent, isPending, error } = useAIGeneration();

  const handleGenerate = () => {
    if (!selectedProvider || !selectedModel || !prompt.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const messages: AIMessage[] = [
      { role: 'user', content: prompt.trim() }
    ];

    const request: GenerateRequest = {
      provider: selectedProvider as any,
      model: selectedModel,
      messages,
      temperature: temperature[0],
      maxTokens: maxTokens[0],
    };

    generateContent(request, {
      onSuccess: (data) => {
        setGeneratedContent(data.content);
        toast.success(`Content generated using ${data.provider}/${data.model}`);
      },
      onError: (error) => {
        toast.error(`Generation failed: ${error.message}`);
      },
    });
  };

  const handleCopyToClipboard = async () => {
    if (!generatedContent) return;
    
    try {
      await navigator.clipboard.writeText(generatedContent);
      toast.success('Content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleClearContent = () => {
    setGeneratedContent('');
    setPrompt('');
    toast.success('Content cleared');
  };

  if (modelsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load AI models. Please check your server configuration.
            {modelsError instanceof Error && `: ${modelsError.message}`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          AI Content Creation Machine
        </h1>
        <p className="text-muted-foreground text-lg">
          Generate high-quality content using multiple AI providers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Configure your AI model and generation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label htmlFor="provider">AI Provider</Label>
              <Select
                value={selectedProvider}
                onValueChange={(value) => {
                  setSelectedProvider(value);
                  setSelectedModel(''); // Reset model when provider changes
                }}
                disabled={isLoadingModels}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an AI provider..." />
                </SelectTrigger>
                <SelectContent>
                  {modelsData?.providers.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={selectedModel}
                onValueChange={setSelectedModel}
                disabled={!selectedProvider || isLoadingModels}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider && modelsData?.models[selectedProvider]?.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        {model.name}
                        <Badge variant="secondary" className="text-xs">
                          {model.maxTokens} tokens
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Advanced Parameters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">
                  Temperature: {temperature[0]}
                </Label>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Lower values = more focused, higher values = more creative
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">
                  Max Tokens: {maxTokens[0]}
                </Label>
                <Slider
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                  max={4000}
                  min={100}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>

            <Separator />

            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Enter your prompt here... Be specific about what kind of content you want to generate."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32 resize-none"
                disabled={isPending}
              />
            </div>

            {/* Generate Button */}
            <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                disabled={isPending || !selectedProvider || !selectedModel || !prompt.trim()}
                className="flex-1"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleClearContent}
                disabled={isPending}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Content
              {generatedContent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Your AI-generated content will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 min-h-96">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {generatedContent}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <div className="text-center">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generated content will appear here</p>
                  <p className="text-sm">Configure your settings and click Generate Content to start</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}