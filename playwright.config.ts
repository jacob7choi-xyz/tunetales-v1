import { defineConfig, devices } from "@playwright/test";

// Real-browser acceptance tests. Kept out of the unit gate (npm test);
// run via `npm run e2e`. The dev server hosts the harness page that
// mounts the cinema components before the Phase-3 flip.
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
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3105",
    env: { PORT: "3105" },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
