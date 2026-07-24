import { defineConfig, devices } from "@playwright/test";

// Real-browser acceptance tests against the PRODUCTION build (dev-server
// chunk loading is unreliable under WebKit, and acceptance evidence
// should come from the artifact that ships). Kept out of the unit gate;
// run via `npm run e2e`.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3105",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /registry-failure/,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: /registry-failure/,
    },
    {
      // Failure injection renames shared server state (the registry), so
      // it runs strictly AFTER every parallel browser project completes
      name: "failure-injection",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /registry-failure/,
      dependencies: ["chromium", "webkit"],
    },
  ],
  webServer: {
    command: "npm run e2e:server",
    url: "http://localhost:3105",
    env: { PORT: "3105" },
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
