import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node scripts/serve.js --port 4173',
    url: 'http://127.0.0.1:4173/tictactoe/',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
