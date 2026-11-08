import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: /.*\.spec\.ts/,
  timeout: 120_000,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3100" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
