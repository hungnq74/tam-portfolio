import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "src/test/mocks/server-only.ts"),
    },
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    restoreMocks: true,
    setupFiles: ["src/test/setup.ts"],
  },
})
