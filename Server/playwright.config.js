const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './test/browser', timeout: 30010, retries: 0, workers: 1,
  use: { baseURL: 'http://localhost:3001', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: {
    command: 'npm --prefix .. run preview', url: 'http://localhost:3001', timeout: 30010,
  },
});
