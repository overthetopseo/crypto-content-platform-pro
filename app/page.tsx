"use client"

import { useState } from 'react'
import { Hero } from '@/components/ui/animated-hero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Sparkles, CheckCircle, XCircle } from 'lucide-react'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('')
  const [temperature, setTemperature] = useState([0.7])
  const [maxTokens, setMaxTokens] = useState([2000])
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [providersInfo, setProvidersInfo] = useState<any[]>([])
  const [isProvidersLoaded, setIsProvidersLoaded] = useState(false)
  const { toast } = useToast()

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/ai/generate')
      const data = await res.json()
      setProvidersInfo(data.providers || [])
      setIsProvidersLoaded(true)
      
      // Set default model for selected provider
      const selectedProvider = data.providers?.find((p: any) => p.name.toLowerCase() === provider.toLowerCase())
      if (selectedProvider?.availableModels?.length > 0) {
        setModel(selectedProvider.availableModels[0])
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
      toast({
        title: "Error",
        description: "Failed to load AI providers",
        variant: "destructive",
      })
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          prompt,
          options: {
            model: model || undefined,
            temperature: temperature[0],
            maxTokens: maxTokens[0],
          },
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to generate content')
      }

      const data = await res.json()
      setResponse(data.content)
      
      toast({
        title: "Success",
        description: "Content generated successfully",
      })
    } catch (error) {
      console.error('Generation error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate content',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider)
    const selectedProvider = providersInfo.find(p => p.name.toLowerCase() === newProvider.toLowerCase())
    if (selectedProvider?.availableModels?.length > 0) {
      setModel(selectedProvider.availableModels[0])
    }
  }

  const selectedProviderInfo = providersInfo.find(p => p.name.toLowerCase() === provider.toLowerCase())
  const availableModels = selectedProviderInfo?.availableModels || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <Hero />
      
      {/* AI Content Generator Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-2xl font-bold">AI Content Generator</CardTitle>
              </div>
              <CardDescription>
                Generate content using multiple AI providers including OpenAI, Anthropic, Google AI, Grok, and Deepseek
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider Status */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {isProvidersLoaded ? (
                  providersInfo.map((providerInfo) => (
                    <div key={providerInfo.name} className="flex items-center gap-2 p-2 rounded-lg border">
                      {providerInfo.isConfigured ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{providerInfo.name}</span>
                    </div>
                  ))
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={fetchProviders}
                    className="w-full"
                  >
                    Load Provider Status
                  </Button>
                )}
              </div>

              {/* Provider Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">AI Provider</Label>
                  <Select value={provider} onValueChange={handleProviderChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                      <SelectItem value="google">Google AI (Gemini)</SelectItem>
                      <SelectItem value="grok">Grok (xAI)</SelectItem>
                      <SelectItem value="deepseek">Deepseek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel} disabled={availableModels.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((modelOption: string) => (
                        <SelectItem key={modelOption} value={modelOption}>
                          {modelOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature: {temperature[0]}</Label>
                  <Slider
                    id="temperature"
                    min={0}
                    max={2}
                    step={0.1}
                    value={temperature}
                    onValueChange={setTemperature}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls randomness: 0 = focused, 2 = creative
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens: {maxTokens[0]}</Label>
                  <Slider
                    id="maxTokens"
                    min={100}
                    max={4000}
                    step={100}
                    value={maxTokens}
                    onValueChange={setMaxTokens}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum length of generated content
                  </p>
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !prompt.trim()}
                className="w-full"
              >
                {isLoading ? (
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

              {/* Response */}
              {response && (
                <div className="space-y-2">
                  <Label>Generated Content</Label>
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
