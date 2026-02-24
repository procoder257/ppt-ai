# Multi-Provider AI Model Setup Guide

This application now supports multiple AI providers for presentation generation! Choose from OpenAI, Google, Anthropic (Claude), Mistral, Cohere, and local models.

## 🌟 Supported Providers

### ☁️ Cloud Providers

1. **OpenAI** - GPT-4o, GPT-4o-mini, GPT-4 Turbo, o1, o3-mini, and more
2. **Google** - Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash
3. **Anthropic (Claude)** - Claude Opus 4.5, Claude Sonnet 4.5, Claude 3.5 Haiku
4. **Mistral AI** - Mistral Large, Mistral Small, Pixtral Large
5. **Cohere** - Command R+, Command R

### 🖥️ Local Providers

6. **Ollama** - Run models locally on your machine
7. **LM Studio** - Local model hosting

## 🔑 Getting API Keys

### OpenAI
1. Visit [platform.openai.com](https://platform.openai.com)
2. Go to API Keys section
3. Create new secret key
4. Add to `.env` as `OPENAI_API_KEY`

### Google (Gemini)
1. Visit [ai.google.dev](https://ai.google.dev)
2. Click "Get API key"
3. Create API key in Google AI Studio
4. Add to `.env` as `GOOGLE_GENERATIVE_AI_API_KEY`

### Anthropic (Claude)
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Go to API Keys
3. Create new API key
4. Add to `.env` as `ANTHROPIC_API_KEY`

### Mistral AI
1. Visit [console.mistral.ai](https://console.mistral.ai)
2. Navigate to API keys
3. Generate new key
4. Add to `.env` as `MISTRAL_API_KEY`

### Cohere
1. Visit [dashboard.cohere.com](https://dashboard.cohere.com)
2. Go to API Keys section
3. Create production key
4. Add to `.env` as `COHERE_API_KEY`

## ⚙️ Configuration

### Environment Variables

Add the following to your `.env` file (only add keys for providers you want to use):

```bash
# AI Provider API Keys (Optional - add only what you need)
OPENAI_API_KEY="sk-..."
GOOGLE_GENERATIVE_AI_API_KEY="..."
ANTHROPIC_API_KEY="sk-ant-..."
MISTRAL_API_KEY="..."
COHERE_API_KEY="..."
```

**Note:** The application will work with any combination of these keys. Only the providers with valid API keys will be functional.

## 📊 Available Models by Provider

### OpenAI Models
- **GPT-4o** - Most capable GPT-4 model
- **GPT-4o-mini** - Fast and efficient (default)
- **GPT-4 Turbo** - High-performance GPT-4
- **GPT-4** - Original GPT-4
- **o3-mini** - Latest reasoning model
- **o1** - Advanced reasoning
- **GPT-3.5 Turbo** - Fast and cost-effective

### Google Models
- **Gemini 2.0 Flash** - Latest Gemini (experimental)
- **Gemini 1.5 Pro** - Most capable Gemini
- **Gemini 1.5 Flash** - Fast and efficient
- **Gemini 1.5 Flash 8B** - Smallest Gemini

### Anthropic Models
- **Claude Opus 4.5** - Most capable Claude
- **Claude Sonnet 4.5** - Balanced performance
- **Claude 3.5 Sonnet** - Previous generation
- **Claude 3.5 Haiku** - Fast Claude model

### Mistral Models
- **Mistral Large** - Most capable
- **Mistral Small** - Cost-effective
- **Pixtral Large** - Vision model

### Cohere Models
- **Command R+** - Most capable
- **Command R** - Balanced model

## 🎯 How to Use

1. **Set up your API keys** in `.env` file
2. **Restart your development server** for env changes to take effect
3. **Select your preferred model** in the UI:
   - Navigate to presentation generation
   - Click the "Text Model" dropdown
   - Choose from available providers and models
4. **Generate presentations** - The system automatically routes to the correct provider!

## 🔍 Model Selection

Models are organized by provider in the dropdown:
- **OpenAI** - Bot icon
- **Google** - Sparkles icon
- **Anthropic (Claude)** - Brain icon
- **Mistral AI** - Zap icon
- **Cohere** - Zap icon
- **Ollama (Local)** - CPU icon
- **LM Studio (Local)** - Monitor icon

## 💡 Tips

### Cost Optimization
- Use **GPT-4o-mini** or **Gemini 1.5 Flash** for most tasks (faster and cheaper)
- Use **GPT-4o** or **Claude Opus 4.5** for complex presentations requiring deep reasoning
- Use **o3-mini** or **o1** for presentations requiring advanced logical reasoning

### Performance
- **Fastest:** GPT-3.5 Turbo, Gemini 1.5 Flash 8B
- **Balanced:** GPT-4o-mini, Gemini 1.5 Flash, Claude Sonnet
- **Most Capable:** GPT-4o, Claude Opus, Gemini 1.5 Pro

### Local Models
For complete privacy and no API costs:
1. Install [Ollama](https://ollama.ai) or [LM Studio](https://lmstudio.ai)
2. Download your preferred models
3. Select them from the "Local" sections in the dropdown

## 🚨 Troubleshooting

### "Model not working" or API errors
1. **Verify API key** is correct in `.env`
2. **Check API key permissions** on the provider's dashboard
3. **Ensure you have credits** (most providers require payment setup)
4. **Restart dev server** after changing `.env`

### Models not appearing in dropdown
- Only models from providers with valid API keys will appear
- Check console for any error messages
- Verify the `.env` file format is correct

### Rate limiting
- Most providers have rate limits on free tiers
- Consider upgrading your plan or switching providers temporarily
- The app automatically tracks which provider was used

## 📝 Technical Details

### Architecture
- **Model Configuration:** `src/lib/ai-models-config.ts`
- **Routing Logic:** `src/lib/model-picker.ts`
- **UI Component:** `src/components/presentation/dashboard/ModelPicker.tsx`
- **Environment Validation:** `src/env.js`

### Adding New Models
To add new models from existing providers, edit `src/lib/ai-models-config.ts`:

```typescript
{
  id: "model-id-from-api",
  name: "Display Name",
  provider: "openai", // or google, anthropic, etc.
  description: "Short description",
  category: "gpt",
  requiresApiKey: true,
}
```

### Adding New Providers
1. Install the AI SDK provider: `pnpm add @ai-sdk/[provider]`
2. Add to `ai-models-config.ts`
3. Add routing logic to `model-picker.ts`
4. Add API key to `.env.example` and `src/env.js`

## 🔗 Useful Links

- [Vercel AI SDK Documentation](https://ai-sdk.dev)
- [OpenAI Platform](https://platform.openai.com)
- [Google AI Studio](https://ai.google.dev)
- [Anthropic Console](https://console.anthropic.com)
- [Mistral Platform](https://console.mistral.ai)
- [Cohere Dashboard](https://dashboard.cohere.com)

---

**Need help?** Check the console logs or create an issue on GitHub!
