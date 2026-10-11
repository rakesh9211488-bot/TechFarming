const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './test/browser', timeout: 30000, retries: 0, workers: 1,
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'node server.js', url: 'http://127.0.0.1:9000/api/health', timeout: 30000 },
    { command: 'npm --prefix ../client run preview', url: 'http://localhost:3000', timeout: 30000 },
  ],
});
