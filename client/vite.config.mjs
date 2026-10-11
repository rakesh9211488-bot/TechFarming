import { defineConfig } from 'vite';
export default defineConfig({
  // React Router includes RSC directives; this standalone SPA does not use RSC.
  build: { rolldownOptions: { onLog(level, log, handler) {
    if (log.code === 'MODULE_LEVEL_DIRECTIVE' && log.message.includes('use client')) return;
    handler(level, log);
  } } },
  server: { proxy: { '/api': 'http://127.0.0.1:9000' } },
  preview: { proxy: { '/api': 'http://127.0.0.1:9000' } },
});
