import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_WEB_URL ?? 'http://127.0.0.1:15174';

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  outputDir: 'test-results',
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
  ],
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  retries: process.env.CI ? 1 : 0,
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
});
