import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    env: {
      NEXTAUTH_SECRET: "test-secret-at-least-32-bytes-long-for-hs256",
      GOOGLE_CLIENT_ID: "test-google-client-id",
      GOOGLE_CLIENT_SECRET: "test-google-client-secret",
      BACKEND_URL: "http://localhost:8000",
      INTERNAL_SECRET: "test-internal-secret",
    },
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      all: true,
      include: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "components/INTEGRATION.tsx"],
      // No enforced threshold yet — report only, until real coverage exists
      // to set a meaningful baseline against.
    },
  },
});
