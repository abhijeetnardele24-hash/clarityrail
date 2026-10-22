import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
    ["html", { open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:4173/clarityrail/",
    trace: "on-first-retry",
    video: "off",
  },
  projects: [
    {
      name: "Mobile Small (320px)",
      testMatch: /clarityrail\.spec\.ts/,
      use: {
        viewport: { width: 320, height: 568 },
        isMobile: true,
      },
    },
    {
      name: "Mobile Standard (360px)",
      testMatch: /clarityrail\.spec\.ts/,
      use: {
        viewport: { width: 360, height: 800 },
        isMobile: true,
      },
    },
    {
      name: "Mobile Modern (390px)",
      testMatch: /clarityrail\.spec\.ts/,
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
    {
      name: "Tablet Portrait (768px)",
      testMatch: /clarityrail\.spec\.ts/,
      use: {
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "Laptop (1024px)",
      testMatch: /clarityrail\.spec\.ts/,
      use: {
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: "Desktop HD (1440px)",
      testMatch: /clarityrail\.spec\.ts/,
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "Desktop Large (1920px)",
      testMatch: /clarityrail\.spec\.ts/,
      use: {
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "Chromium Deep Verification",
      testMatch: /resilience\.spec\.ts/,
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
