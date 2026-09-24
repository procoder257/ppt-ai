import { createOpenAI } from "@ai-sdk/openai";
import { type LanguageModelV1 } from "ai";
import { createOllama } from "ollama-ai-provider";

/**
 * Local providers make the *server* call localhost, which is only meaningful
 * when the app runs on a developer's machine. They are off in production
 * unless ALLOW_LOCAL_MODELS=true.
 */
export function localModelsAllowed(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_LOCAL_MODELS === "true"
  );
}

/**
 * Centralized model picker function for all presentation generation routes
 * Supports OpenAI, Ollama, and LM Studio models
 */
export function modelPicker(
  modelProvider: string,
  modelId?: string,
): LanguageModelV1 {
  if (!localModelsAllowed()) {
    modelProvider = "openai";
  }

  if (modelProvider === "ollama" && modelId) {
    // Use Ollama AI provider
    const ollama = createOllama();
    return ollama(modelId) as unknown as LanguageModelV1;
  }

  if (modelProvider === "lmstudio" && modelId) {
    // Use LM Studio with OpenAI compatible provider
    const lmstudio = createOpenAI({
      name: "lmstudio",
      baseURL: "http://localhost:1234/v1",
      apiKey: "lmstudio",
    });
    return lmstudio(modelId) as unknown as LanguageModelV1;
  }

  // Default to OpenAI
  const openai = createOpenAI();
  return openai("gpt-4o-mini") as unknown as LanguageModelV1;
}
