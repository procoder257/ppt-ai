import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
    // Unit tests must not need real secrets or a local .env file.
    // Modules that import "@/env" skip schema validation under test.
    env: {
      SKIP_ENV_VALIDATION: "1",
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
