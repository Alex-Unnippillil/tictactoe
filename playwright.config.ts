import { defineConfig } from '@playwright/test';

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || `http://${host}:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npx http-server site -p ${port} -a ${host}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
