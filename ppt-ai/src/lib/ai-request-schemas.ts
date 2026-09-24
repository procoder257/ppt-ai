import { z } from "zod";

/**
 * Request validation for the AI generation routes. Bounds keep a single
 * request from driving unbounded model / search spend.
 */
export const MAX_PROMPT_LENGTH = 4000;
export const MAX_SLIDES = 30;
export const MAX_OUTLINE_ITEM_LENGTH = 3000;

export const modelProviderSchema = z.enum(["openai", "ollama", "lmstudio"]);

const modelFields = {
  modelProvider: modelProviderSchema.nullish().transform((v) => v ?? "openai"),
  modelId: z
    .string()
    .max(100)
    .nullish()
    .transform((v) => v || undefined),
};

const languageSchema = z.string().trim().min(1).max(40);

export const outlineRequestSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required").max(MAX_PROMPT_LENGTH),
  numberOfCards: z.coerce.number().int().min(1).max(MAX_SLIDES),
  language: languageSchema,
  ...modelFields,
});

export type OutlineRequest = z.infer<typeof outlineRequestSchema>;

const searchResultSchema = z.object({
  query: z.string().max(500).optional().default(""),
  results: z.array(z.unknown()).max(20).optional().default([]),
});

export const slidesRequestSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  prompt: z.string().max(MAX_PROMPT_LENGTH).nullish().transform((v) => v ?? ""),
  outline: z
    .array(z.string().max(MAX_OUTLINE_ITEM_LENGTH))
    .min(1, "Outline is required")
    .max(MAX_SLIDES),
  language: languageSchema,
  tone: z.string().max(100).nullish().transform((v) => v ?? "professional"),
  searchResults: z.array(searchResultSchema).max(10).nullish(),
  ...modelFields,
});

export type SlidesRequest = z.infer<typeof slidesRequestSchema>;

/** Formats zod issues into a short client-safe message. */
export function formatValidationError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
    .join("; ");
}
