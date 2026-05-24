import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // sequential to avoid DB races in local runs
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI'] ? 'github' : 'list',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],

  // Start both server and client before E2E run (requires both to be configured)
  // webServer: [
  //   { command: 'npm run dev', cwd: 'server', url: 'http://localhost:5000/health', timeout: 30000 },
  //   { command: 'npm run dev', cwd: 'client', url: 'http://localhost:5173', timeout: 30000 },
  // ],
})
