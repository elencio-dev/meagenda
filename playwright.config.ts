import { defineConfig, devices } from "@playwright/test"

/**
 * MeAgenda — Playwright E2E Configuration
 * Run: npm run test:e2e
 * UI mode: npm run test:e2e:ui
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // sequential: each test may depend on DB state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "pt-BR",
  },

  projects: [
    // Global setup (seed test data once before all tests)
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },
    // Main test suite
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true, // reutiliza se já estiver rodando em outro terminal no PC
    timeout: 120_000,
  },
})
