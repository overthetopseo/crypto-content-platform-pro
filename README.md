# AI Content Creation Machine

> Multi-provider AI-powered content generation platform with secure API integration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

## 🚀 Project Overview

The AI Content Creation Machine is a comprehensive platform that integrates multiple AI providers to deliver high-quality content generation. With support for OpenAI, Anthropic Claude, Grok, DeepSeek, and Google AI, this platform provides a unified interface for content creators to harness the power of various AI models.

### Key Features

- 🤖 **Multi-AI Provider Support**: OpenAI, Anthropic, Grok, DeepSeek, Google AI
- 🔒 **Secure Configuration**: Server-side API key management with zero client exposure
- 🎯 **Unified Interface**: Consistent API across all providers
- ⚙️ **Advanced Controls**: Temperature, max tokens, and model selection
- 📋 **Copy & Export**: Easy content management and sharing
- 🎨 **Modern UI**: Clean, responsive design with shadcn/ui components
- 🚀 **Real-time Generation**: Fast content creation with loading states

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Database:** [Supabase](https://supabase.com/) 
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [TanStack Query](https://tanstack.com/query/latest)
- **AI SDKs:** OpenAI, Anthropic, Google Generative AI
- **Type Safety:** TypeScript with Zod validation

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm, yarn, or pnpm** package manager
- **API Keys** from the AI providers you want to use:
  - [OpenAI API Key](https://platform.openai.com/api-keys)
  - [Anthropic API Key](https://console.anthropic.com/)
  - [Grok API Key](https://console.x.ai/)
  - [DeepSeek API Key](https://platform.deepseek.com/)
  - [Google AI API Key](https://makersuite.google.com/app/apikey)
  - [Google Drive API Key](https://console.cloud.google.com/) (if using Drive integration)
- **Supabase Project** for database (optional, but recommended)

## 🛠️ Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/overthetopseo/crypto-content-platform-pro.git
cd crypto-content-platform-pro
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure your AI API keys in `.env.local`:**
   ```env
   # Supabase Configuration (Optional)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # AI API Keys - CRITICAL: Keep these secure and never commit to git
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   GROK_API_KEY=xai-your-actual-grok-api-key-here
   DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key-here
   GOOGLE_AI_API_KEY=AIza-your-actual-google-ai-api-key-here
   ANTHROPIC_API_KEY=sk-ant-api-your-actual-anthropic-api-key-here
   GOOGLE_DRIVE_API_KEY=your-actual-google-drive-api-key-here
   ```

   **⚠️ Security Warning:** Never commit your actual API keys to git. The `.env.local` file is automatically ignored by git.

### Step 4: Verify Configuration

The application will automatically validate your environment variables on startup. If any required keys are missing, you'll see helpful error messages.

### Step 5: Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

🎉 **Open [http://localhost:3000](http://localhost:3000)** to see the application!

## 📖 Getting API Keys

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key starting with `sk-`

### Anthropic API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to "API Keys"
4. Generate a new key starting with `sk-ant-`

### Grok API Key
1. Visit [x.ai Console](https://console.x.ai/)
2. Create an account or sign in
3. Generate an API key starting with `xai-`

### DeepSeek API Key
1. Go to [DeepSeek Platform](https://platform.deepseek.com/)
2. Create an account and sign in
3. Navigate to API section
4. Generate a key starting with `sk-`

### Google AI API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key starting with `AIza`

### Google Drive API Key (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create credentials (API Key)

## 🎯 Usage

### Basic Content Generation

1. **Select Provider**: Choose from OpenAI, Anthropic, Grok, DeepSeek, or Google AI
2. **Choose Model**: Pick the specific model (e.g., GPT-4, Claude-3.5-Sonnet, etc.)
3. **Configure Settings**: 
   - Temperature (0-1): Controls creativity vs focus
   - Max Tokens (100-4000): Sets response length
4. **Enter Prompt**: Describe what content you want to generate
5. **Click Generate**: Get your AI-generated content
6. **Copy & Use**: Copy to clipboard or regenerate with different settings

### API Usage Examples

The platform exposes a REST API for programmatic access:

```javascript
// Generate content
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'openai',
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Write a blog post about AI' }],
    temperature: 0.7,
    maxTokens: 1000
  })
});

// Get available models
const models = await fetch('/api/ai/generate').then(r => r.json());
```

## 🔧 Configuration Options

### Supported Models

**OpenAI**
- gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo

**Anthropic**
- claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022, claude-3-opus-20240229

**Grok**
- grok-beta, grok-vision-beta

**DeepSeek**
- deepseek-chat, deepseek-coder

**Google AI**
- gemini-1.5-pro, gemini-1.5-flash, gemini-pro

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT models |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude models |
| `GROK_API_KEY` | Yes | Grok API key for Grok models |
| `DEEPSEEK_API_KEY` | Yes | DeepSeek API key |
| `GOOGLE_AI_API_KEY` | Yes | Google AI API key for Gemini models |
| `GOOGLE_DRIVE_API_KEY` | Optional | For Google Drive integration |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anonymous key |

## 🏗️ Project Structure

```
ai-content-platform/
├── app/                     # Next.js App Router
│   ├── api/ai/generate/     # AI generation API endpoint
│   ├── content-creator/     # Main content creation interface
│   └── layout.tsx          # Root layout
├── components/             # React components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
│   └── use-ai-generation.ts # AI generation hook
├── lib/                   # Core utilities
│   ├── ai/               # AI service providers
│   │   ├── openai.ts     # OpenAI implementation
│   │   ├── anthropic.ts  # Anthropic implementation
│   │   ├── grok.ts       # Grok implementation
│   │   ├── deepseek.ts   # DeepSeek implementation
│   │   ├── google.ts     # Google AI implementation
│   │   ├── types.ts      # Shared types
│   │   └── index.ts      # AI manager
│   └── config.ts         # Secure configuration
├── .env.example          # Environment template
└── README.md            # This file
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The application works on any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

**Important**: Always add your environment variables in your deployment platform's settings.

## 🔐 Security Best Practices

- ✅ API keys are server-side only
- ✅ Environment variables are validated on startup
- ✅ Input validation with Zod schemas
- ✅ Error handling prevents API key exposure
- ✅ `.env` files are git-ignored

## 🐛 Troubleshooting

### Common Issues

**Error: "Missing required environment variable: OPENAI_API_KEY"**
- Ensure your `.env.local` file exists and contains the API key
- Restart your development server after adding variables

**Error: "Provider openai not found"**
- Check that you're using a valid provider name in your API calls
- Supported providers: `openai`, `anthropic`, `grok`, `deepseek`, `googleAI`

**Error: "Model gpt-4x not available for provider openai"**
- Check the model name against the supported models list
- Models are case-sensitive

**API call fails with 401 Unauthorized**
- Verify your API key is correct and has sufficient credits
- Check that the key hasn't expired

### Getting Help

1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Test individual API keys with their respective provider's documentation
4. Check the server logs for backend errors

## 📝 Development Guidelines

### Adding New AI Providers

1. Create a new service in `lib/ai/new-provider.ts`
2. Implement the `AIProvider` interface
3. Add the provider to `lib/ai/index.ts`
4. Update the model configurations in `lib/ai/types.ts`
5. Test thoroughly with the provider's API

### Code Quality
- TypeScript strict mode enabled
- ESLint configuration for Next.js
- Prettier for code formatting
- Zod for runtime type validation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Made with ❤️ for content creators using AI**