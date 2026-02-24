/**
 * Configuration for available OpenAI models
 * This list can be updated as new models become available
 */

export interface OpenAIModel {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
}

export const OPENAI_MODELS: OpenAIModel[] = [
  {
    id: "gpt-5.2",
    name: "GPT-5.2",
    description: "Latest GPT-5 model (most advanced)",
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    description: "Next-generation GPT model",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    description: "Latest GPT-4 generation model",
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1-mini",
    description: "Efficient GPT-4.1 variant",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Optimized GPT-4 model for complex tasks",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o-mini",
    description: "Fast and efficient model for most tasks",
    isDefault: true,
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "High-performance GPT-4 variant",
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    description: "Original GPT-4 model",
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    description: "Latest reasoning model (recommended for reasoning tasks)",
  },
  {
    id: "o1",
    name: "o1",
    description: "Previous generation reasoning model",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "Fast and cost-effective model",
  },
];

/**
 * Get the default OpenAI model
 */
export function getDefaultOpenAIModel(): OpenAIModel {
  return OPENAI_MODELS.find((model) => model.isDefault) ?? OPENAI_MODELS[0]!;
}

/**
 * Get an OpenAI model by ID
 */
export function getOpenAIModelById(id: string): OpenAIModel | undefined {
  return OPENAI_MODELS.find((model) => model.id === id);
}

/**
 * Check if a model ID is a valid OpenAI model
 */
export function isValidOpenAIModel(id: string): boolean {
  return OPENAI_MODELS.some((model) => model.id === id);
}
