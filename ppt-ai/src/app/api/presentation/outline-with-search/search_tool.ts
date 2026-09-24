import { env } from "@/env";
import { tavily } from "@tavily/core";
import { type Tool } from "ai";
import z from "zod";

// Created on first use so importing this module (e.g. during `next build`)
// doesn't require TAVILY_API_KEY.
let tavilyService: ReturnType<typeof tavily> | undefined;
function getTavily() {
  tavilyService ??= tavily({ apiKey: env.TAVILY_API_KEY });
  return tavilyService;
}

export const search_tool: Tool = {
  description:
    "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events like news, weather, stock price etc. Input should be a search query.",
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }: { query: string }) => {
    try {
      const response = await getTavily().search(query, { max_results: 5 });
      return JSON.stringify(response);
    } catch (error) {
      console.error("Search error:", error);
      return "Search failed";
    }
  },
};
