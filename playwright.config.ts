import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 8 * 60 * 60 * 1000,
  globalTimeout: 8 * 60 * 60 * 1000,
  use: {
    actionTimeout: 0,
    navigationTimeout: 0,
  },
  webServer: {
    command: 'npx playwright run-server --port 9323 --host 0.0.0.0',
    url: 'http://0.0.0.0:9323',
    timeout: 8 * 60 * 60 * 1000,
    reuseExistingServer: false,
  },
});
