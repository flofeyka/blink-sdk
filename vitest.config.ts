import { defineConfig } from "vitest/config";
import { configDotenv } from "dotenv";

configDotenv();

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
});
