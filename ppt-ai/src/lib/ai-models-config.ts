/**
 * Comprehensive AI Model Configuration
 * Supports multiple providers: OpenAI, Google, Anthropic, Mistral, Cohere, Ollama, LM Studio
 */

export type AIProvider =
  | "openai"
  | "google"
  | "anthropic"
  | "mistral"
  | "cohere"
  | "ollama"
  | "lmstudio";

export interface ModelCapabilities {
  supportsSystemMessages: boolean;
  supportsTools: boolean;
  supportsStreaming: boolean;
  supportsTemperature: boolean;
  supportsVision: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  isDefault?: boolean;
  requiresApiKey?: boolean;
  category?: "gpt" | "reasoning" | "vision" | "embedding" | "local";
  capabilities?: ModelCapabilities;
}

export const AI_MODELS: AIModel[] = [
  // ==================== OPENAI MODELS ====================
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Most capable GPT-4 model",
    category: "gpt",
    requiresApiKey: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o-mini",
    provider: "openai",
    description: "Fast and efficient",
    category: "gpt",
    requiresApiKey: true,
    isDefault: true,
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    description: "High-performance GPT-4",
    category: "gpt",
    requiresApiKey: true,
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "openai",
    description: "Original GPT-4",
    category: "gpt",
    requiresApiKey: true,
  },
  {
    id: "o1",
    name: "o1",
    provider: "openai",
    description: "Advanced reasoning",
    category: "reasoning",
    requiresApiKey: true,
    capabilities: {
      supportsSystemMessages: false,
      supportsTools: false,
      supportsStreaming: true,
      supportsTemperature: false,
      supportsVision: false,
    },
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    provider: "openai",
    description: "Latest reasoning model",
    category: "reasoning",
    requiresApiKey: true,
    capabilities: {
      supportsSystemMessages: true, // Treated as developer message
      supportsTools: true,
      supportsStreaming: true,
      supportsTemperature: false,
      supportsVision: false,
    },
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    description: "Fast and cost-effective",
    category: "gpt",
    requiresApiKey: true,
  },

  // ==================== GOOGLE MODELS ====================
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    provider: "google",
    description: "Latest Gemini model (experimental)",
    category: "gpt",
    requiresApiKey: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    description: "Most capable Gemini model",
    category: "gpt",
    requiresApiKey: true,
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    description: "Fast and efficient Gemini",
    category: "gpt",
    requiresApiKey: true,
  },
  {
    id: "gemini-1.5-flash-8b",
    name: "Gemini 1.5 Flash 8B",
    provider: "google",
    description: "Smallest Gemini model",
    category: "gpt",
    requiresApiKey: true,
  },

  // ==================== ANTHROPIC MODELS ====================
  {
    id: "claude-opus-4.5",
    name: "Claude Opus 4.5",
    provider: "anthropic",
    description: "Most capable Claude model",
    category: "gpt",
    requiresApiKey: true,
  },
  {
    id: "claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    description: "Balanced performance",
    category: "gpt",
    requiresApiKey: true,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    description: "Previous generation Sonnet",
    category: "gpt",
    requiresApiKey: true,
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    description: "Fast Claude model",
    category: "gpt",
    requiresApiKey: true,
  },

  // ==================== MISTRAL MODELS ====================
  {
    id: "mistral-large-latest",
    name: "Mistral Large",
    provider: "mistral",
    description: "Most capable Mistral model",
    category: "gpt",
    requiresApiKey: true,
  },
  {
    id: "mistral-small-latest",
    name: "Mistral Small",
    provider: "mistral",
    description: "Cost-effective Mistral",
    category: "gpt",
    requiresApiKey: true,
  },
  {
    id: "pixtral-large-latest",
    name: "Pixtral Large",
    provider: "mistral",
    description: "Mistral vision model",
    category: "vision",
    requiresApiKey: true,
  },

  // ==================== COHERE MODELS ====================
  {
    id: "command-r-plus",
    name: "Command R+",
    provider: "cohere",
    description: "Most capable Cohere model",
    category: "gpt",
    requiresApiKey: true,
  },
  {
    id: "command-r",
    name: "Command R",
    provider: "cohere",
    description: "Balanced Cohere model",
    category: "gpt",
    requiresApiKey: true,
  },
];

/**
 * Get the default AI model
 */
export function getDefaultAIModel(): AIModel {
  return AI_MODELS.find((model) => model.isDefault) ?? AI_MODELS[0]!;
}

/**
 * Get an AI model by ID
 */
export function getAIModelById(id: string): AIModel | undefined {
  return AI_MODELS.find((model) => model.id === id);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: AIProvider): AIModel[] {
  return AI_MODELS.filter((model) => model.provider === provider);
}

/**
 * Check if a model ID is valid
 */
export function isValidAIModel(id: string): boolean {
  return AI_MODELS.some((model) => model.id === id);
}

/**
 * Get all providers
 */
export function getAllProviders(): AIProvider[] {
  const providers = new Set<AIProvider>();
  AI_MODELS.forEach((model) => providers.add(model.provider));
  return Array.from(providers);
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: AIProvider): string {
  const displayNames: Record<AIProvider, string> = {
    openai: "OpenAI",
    google: "Google",
    anthropic: "Anthropic (Claude)",
    mistral: "Mistral AI",
    cohere: "Cohere",
    ollama: "Ollama (Local)",
    lmstudio: "LM Studio (Local)",
  };
  return displayNames[provider];
}

/**
 * Get default capabilities for models without explicit configuration
 */
function getDefaultCapabilities(): ModelCapabilities {
  return {
    supportsSystemMessages: true,
    supportsTools: true,
    supportsStreaming: true,
    supportsTemperature: true,
    supportsVision: false,
  };
}

/**
 * Get model capabilities
 */
export function getModelCapabilities(modelId: string): ModelCapabilities {
  const model = getAIModelById(modelId);
  return model?.capabilities ?? getDefaultCapabilities();
}

/**
 * Check if model supports a specific feature
 */
export function modelSupports(
  modelId: string,
  feature: keyof ModelCapabilities,
): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities[feature];
}
