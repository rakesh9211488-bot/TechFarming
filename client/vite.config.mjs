import { defineConfig } from 'vite';
const target = process.env.TF_API_TARGET || 'http://127.0.0.1:9000';
export default defineConfig({
  // React Router includes RSC directives; this standalone SPA does not use RSC.
  build: { rolldownOptions: { onLog(level, log, handler) {
    if (log.code === 'MODULE_LEVEL_DIRECTIVE' && log.message.includes('use client')) return;
    handler(level, log);
  } } },
  server: { proxy: { '/api': target } },
  preview: { proxy: { '/api': target } },
});
