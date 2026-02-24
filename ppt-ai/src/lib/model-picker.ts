import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createMistral } from "@ai-sdk/mistral";
import { createCohere } from "@ai-sdk/cohere";
import { type LanguageModelV1 } from "ai";
import { createOllama } from "ollama-ai-provider";
import {
  getAIModelById,
  getDefaultAIModel,
  type AIProvider,
} from "./ai-models-config";

/**
 * Centralized model picker function for all AI generation routes
 * Supports: OpenAI, Google, Anthropic, Mistral, Cohere, Ollama, LM Studio
 */
export function modelPicker(
  modelProvider: string,
  modelId?: string,
): LanguageModelV1 {
  // Handle local models
  if (modelProvider === "ollama" && modelId) {
    const ollama = createOllama();
    return ollama(modelId) as unknown as LanguageModelV1;
  }

  if (modelProvider === "lmstudio" && modelId) {
    const lmstudio = createOpenAI({
      name: "lmstudio",
      baseURL: "http://localhost:1234/v1",
      apiKey: "lmstudio",
    });
    return lmstudio(modelId) as unknown as LanguageModelV1;
  }

  // Get model configuration
  const modelConfig = modelId ? getAIModelById(modelId) : null;
  const provider = (modelConfig?.provider ?? modelProvider) as AIProvider;
  const actualModelId = modelId ?? getDefaultAIModel().id;

  // Route to the appropriate provider
  switch (provider) {
    case "openai": {
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      return openai(actualModelId) as unknown as LanguageModelV1;
    }

    case "google": {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });
      return google(actualModelId) as unknown as LanguageModelV1;
    }

    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      return anthropic(actualModelId) as unknown as LanguageModelV1;
    }

    case "mistral": {
      const mistral = createMistral({
        apiKey: process.env.MISTRAL_API_KEY,
      });
      return mistral(actualModelId) as unknown as LanguageModelV1;
    }

    case "cohere": {
      const cohere = createCohere({
        apiKey: process.env.COHERE_API_KEY,
      });
      return cohere(actualModelId) as unknown as LanguageModelV1;
    }

    default: {
      // Fallback to OpenAI with default model
      console.warn(
        `Unknown provider: ${provider}, falling back to OpenAI default`,
      );
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const defaultModel = getDefaultAIModel();
      return openai(defaultModel.id) as unknown as LanguageModelV1;
    }
  }
}
