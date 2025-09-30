# AI Content Generation Platform

> Multi-provider AI content generation platform with support for OpenAI, Anthropic, Google AI, Grok, and Deepseek

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

## 🚀 Overview

The AI Content Generation Platform is a comprehensive, multi-provider AI system that enables content creation using the latest AI models from leading providers. Built with a modern architecture, it provides scalable content generation with support for streaming, multiple models, and advanced configuration options.

## 🤖 Supported AI Providers

- **OpenAI:** GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, GPT-4o, GPT-4o-mini
- **Anthropic:** Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku  
- **Google AI:** Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini Pro
- **Grok (xAI):** Grok-2, Grok-vision-beta
- **Deepseek:** Deepseek-Chat, Deepseek-Coder, Deepseek-V2

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Database:** [Supabase](https://supabase.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **AI SDKs:** OpenAI, Anthropic, Google AI, custom adapters for Grok & Deepseek

## Prerequisites

Before you begin, ensure you have the following:
- Node.js 18+ installed
- API keys for AI providers you want to use
- A [Supabase](https://supabase.com/) account for database (optional)
- Generated project documents from [CodeGuide](https://codeguide.dev/) for best development experience

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-content-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables Setup**
   - Copy the `.env.example` file to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Add your AI API keys to `.env.local` (see Configuration section below)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) with your browser to see the AI Content Generator.**

## 🔧 Configuration

### API Keys Setup

You need to obtain API keys from the AI providers you want to use:

#### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key in the API keys section
3. Add it as `OPENAI_API_KEY` in your `.env.local`

#### Anthropic (Claude)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add it as `ANTHROPIC_API_KEY` in your `.env.local`

#### Google AI (Gemini)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it as `GOOGLE_AI_API_KEY` in your `.env.local`

#### Grok (xAI)
1. Go to [xAI Console](https://console.x.ai/)
2. Create an API key
3. Add it as `XAI_API_KEY` in your `.env.local`

#### Deepseek
1. Go to [Deepseek Platform](https://platform.deepseek.com/)
2. Create an API key
3. Add it as `DEEPSEEK_API_KEY` in your `.env.local`

## 📋 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key_here
XAI_API_KEY=your_xai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database (Optional)
DATABASE_URL=your_database_url_here

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Application Settings
NODE_ENV=development
```

## ✨ Features

- 🤖 **Multi-Provider Support:** Access to all major AI providers
- 🎛️ **Advanced Configuration:** Temperature, max tokens, model selection
- 🌊 **Streaming Support:** Real-time content generation
- 🔒 **Secure Configuration:** Environment-based API key management
- 🎨 **Modern UI:** Clean, responsive interface with real-time status
- 📊 **Provider Health Monitoring:** Check which providers are configured
- 🚀 **High Performance:** Optimized API calls with error handling
- 🔄 **Unified Interface:** Consistent API across all providers

## 📁 Project Structure

```
ai-content-platform/
├── app/
│   ├── api/
│   │   └── ai/
│   │       └── generate/          # Main AI generation API endpoint
│   ├── page.tsx                   # AI Content Generator UI
│   └── layout.tsx                 # Root layout
├── components/
│   └── ui/                        # shadcn/ui components
├── lib/
│   └── ai/                        # AI service layer
│       ├── types.ts               # Type definitions
│       ├── index.ts               # Main AI service
│       ├── openai.ts              # OpenAI adapter
│       ├── anthropic.ts           # Anthropic adapter
│       ├── google.ts              # Google AI adapter
│       ├── grok.ts                # Grok adapter
│       └── deepseek.ts            # Deepseek adapter
├── documentation/                 # Project documentation
├── .env.example                   # Environment variables template
├── .env.local                     # Your actual API keys (do not commit)
└── README.md                      # This file
```

## 🎯 Usage Examples

### Basic Content Generation

```javascript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'openai',
    prompt: 'Write a blog post about AI technology',
    options: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000
    }
  })
});

const data = await response.json();
console.log(data.content);
```

### Streaming Generation

```javascript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'anthropic',
    prompt: 'Tell me a story',
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log(chunk);
}
```

### Checking Provider Status

```javascript
const response = await fetch('/api/ai/generate');
const data = await response.json();

console.log('Available providers:', data.providers);
console.log('Configuration status:', data.configuration);
```

## 🛠 API Reference

### POST /api/ai/generate

Generate content using a specified AI provider.

**Request Body:**
```json
{
  "provider": "openai" | "anthropic" | "google" | "grok" | "deepseek",
  "prompt": "Your prompt here",
  "options": {
    "model": "string",
    "temperature": 0.7,
    "maxTokens": 2000,
    "systemPrompt": "Optional system prompt",
    "topP": 1.0,
    "frequencyPenalty": 0.0,
    "presencePenalty": 0.0
  },
  "stream": false
}
```

**Response:**
```json
{
  "content": "Generated content here",
  "provider": "openai",
  "model": "gpt-4",
  "usage": {
    "promptTokens": 50,
    "completionTokens": 150,
    "totalTokens": 200
  }
}
```

### GET /api/ai/generate

Get information about available AI providers and their configuration status.

**Response:**
```json
{
  "providers": [
    {
      "name": "OpenAI",
      "isConfigured": true,
      "availableModels": ["gpt-4", "gpt-4-turbo", ...]
    }
  ],
  "configuration": {
    "isHealthy": true,
    "configuredProviders": ["openai", "anthropic"],
    "missingProviders": ["google", "grok", "deepseek"],
    "errors": []
  }
}
```

## 🔒 Security Notes

- **Never commit `.env.local` to version control** - it contains sensitive API keys
- The `.env.local` file is already included in `.gitignore`
- API keys are loaded server-side only and never exposed to the client
- Use HTTPS in production to protect API calls
- Consider implementing rate limiting for production use

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Docker

```bash
# Build the image
docker build -t ai-content-platform .

# Run the container
docker run -p 3000:3000 --env-file .env.local ai-content-platform
```

### Traditional Server

1. Install dependencies on the server
2. Build the application: `npm run build`
3. Start the production server: `npm start`
4. Use a reverse proxy like Nginx for SSL termination

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Project Structure

```
codeguide-starter/
├── app/                # Next.js app router pages
├── components/         # React components
├── utils/             # Utility functions
├── public/            # Static assets
├── styles/            # Global styles
├── documentation/     # Generated documentation from CodeGuide
└── supabase/          # Supabase configurations and migrations
```

## Documentation Setup

To implement the generated documentation from CodeGuide:

1. Create a `documentation` folder in the root directory:
   ```bash
   mkdir documentation
   ```

2. Place all generated markdown files from CodeGuide in this directory:
   ```bash
   # Example structure
   documentation/
   ├── project_requirements_document.md             
   ├── app_flow_document.md
   ├── frontend_guideline_document.md
   └── backend_structure_document.md
   ```

3. These documentation files will be automatically tracked by git and can be used as a reference for your project's features and implementation details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
