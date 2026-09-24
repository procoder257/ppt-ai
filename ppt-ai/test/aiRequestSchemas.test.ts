import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_SLIDES,
  outlineRequestSchema,
  slidesRequestSchema,
} from "@/lib/ai-request-schemas";
import { localModelsAllowed } from "@/lib/model-picker";

describe("outlineRequestSchema", () => {
  const valid = { prompt: "  Climate change  ", numberOfCards: 5, language: "en-US" };

  it("accepts a normal request and applies defaults", () => {
    const result = outlineRequestSchema.parse({ ...valid, messages: [] });
    expect(result).toEqual({
      prompt: "Climate change",
      numberOfCards: 5,
      language: "en-US",
      modelProvider: "openai",
      modelId: undefined,
    });
  });

  it("rejects empty prompts and out-of-range slide counts", () => {
    expect(outlineRequestSchema.safeParse({ ...valid, prompt: "   " }).success).toBe(false);
    expect(outlineRequestSchema.safeParse({ ...valid, numberOfCards: 0 }).success).toBe(false);
    expect(outlineRequestSchema.safeParse({ ...valid, numberOfCards: MAX_SLIDES + 1 }).success).toBe(false);
    expect(outlineRequestSchema.safeParse({ ...valid, numberOfCards: 2.5 }).success).toBe(false);
  });

  it("rejects oversized prompts and unknown providers", () => {
    expect(outlineRequestSchema.safeParse({ ...valid, prompt: "x".repeat(4001) }).success).toBe(false);
    expect(outlineRequestSchema.safeParse({ ...valid, modelProvider: "anthropic-proxy" }).success).toBe(false);
  });

  it("treats null/empty model fields as defaults", () => {
    const result = outlineRequestSchema.parse({ ...valid, modelProvider: null, modelId: "" });
    expect(result.modelProvider).toBe("openai");
    expect(result.modelId).toBeUndefined();
  });
});

describe("slidesRequestSchema", () => {
  const valid = {
    title: "Deck",
    prompt: "About things",
    outline: ["# One\n- a", "# Two\n- b"],
    language: "en-US",
    tone: "professional",
  };

  it("accepts a normal request", () => {
    expect(slidesRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing or oversized outlines", () => {
    expect(slidesRequestSchema.safeParse({ ...valid, outline: [] }).success).toBe(false);
    expect(slidesRequestSchema.safeParse({ ...valid, outline: "not-an-array" }).success).toBe(false);
    expect(
      slidesRequestSchema.safeParse({ ...valid, outline: Array(MAX_SLIDES + 1).fill("x") }).success,
    ).toBe(false);
  });

  it("caps search results", () => {
    const tooMany = Array(11).fill({ query: "q", results: [] });
    expect(slidesRequestSchema.safeParse({ ...valid, searchResults: tooMany }).success).toBe(false);
    expect(slidesRequestSchema.safeParse({ ...valid, searchResults: [{ query: "q", results: [{}] }] }).success).toBe(true);
  });

  it("defaults tone and prompt when null", () => {
    const result = slidesRequestSchema.parse({ ...valid, tone: null, prompt: null });
    expect(result.tone).toBe("professional");
    expect(result.prompt).toBe("");
  });
});

describe("localModelsAllowed", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is off in production by default", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOW_LOCAL_MODELS", "");
    expect(localModelsAllowed()).toBe(false);
  });

  it("can be enabled explicitly in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOW_LOCAL_MODELS", "true");
    expect(localModelsAllowed()).toBe(true);
  });

  it("is on in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(localModelsAllowed()).toBe(true);
  });
});
