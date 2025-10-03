import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:8080';
const webServerURL = process.env.PLAYWRIGHT_WEBSERVER_URL ?? new URL('/404.html', baseURL).toString();

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL,
  },
  webServer: {
    command: 'npm run serve',
    url: webServerURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
