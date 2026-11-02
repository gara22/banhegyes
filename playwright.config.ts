import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/reference/**"],
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4399", timezoneId: "Europe/Budapest" },
  webServer: {
    command: "npm run build && node scripts/serve-dist.mjs 4399",
    url: "http://localhost:4399",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
