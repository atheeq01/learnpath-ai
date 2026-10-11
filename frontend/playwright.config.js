import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5174",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 5174",
    url: "http://localhost:5174",
    reuseExistingServer: false,
    env: { VITE_API_URL: "/api" },
  },
  projects: [
    {
      name: "desktop",
      testMatch: "**/ui.spec.js",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      testMatch: "**/ui.spec.js",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "live",
      testMatch: "**/live-api.spec.js",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
