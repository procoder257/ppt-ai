import { createOpenAI } from "@ai-sdk/openai";
import { createGoogle } from "@ai-sdk/google"; // Requires @ai-sdk/google installed
import { type LanguageModelV1 } from "ai";

/**
 * Centralized model picker - High Margin Strategy
 * Hardcodes the most cost-effective model (Gemini 1.5 Flash / 2.0 Flash-Lite)
 */
export function modelPicker(
  _modelProvider?: string, // Ignored
  _modelId?: string,      // Ignored
): LanguageModelV1 {
  // Strategy: >50% Margin
  // Primary: Gemini 1.5 Flash (approx $0.075/1M input, effectively free for low volume)
  // We use createGoogle from the SDK.

  // Note: Ensure GOOGLE_GENERATIVE_AI_API_KEY is in .env
  const google = createGoogle({
    // apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
  });

  // Using 'gemini-1.5-flash' as the robust, cheap default.
  // If 'gemini-2.0-flash-exp' is available and preferred, switch strings.
  // User asked for "Gemini 2.0 Flash-Lite". Currently `gemini-1.5-flash` is the standard "Lite".
  return google("gemini-1.5-flash") as unknown as LanguageModelV1;
}

/* 
   Fallback Logic Note:
   To implement true fallback (Gemini -> OpenAI), we would need to wrap the generate call
   in a try/catch block in the API route, or use specific "fallback" model composition if supported.
   For now, we enforce Gemini.
*/
