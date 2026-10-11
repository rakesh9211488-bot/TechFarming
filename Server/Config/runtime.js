const fs = require('node:fs');
const path = require('node:path');

function loadLocalEnvironment() {
  const file = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(file)) return;
  if (typeof process.loadEnvFile !== 'function') {
    throw new Error('Loading Server/.env requires Node.js 22 or newer.');
  }
  process.loadEnvFile(file);
}

function readConfig(env = process.env) {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_USERS_DATABASE', 'DB_JOBS_DATABASE'];
  for (const key of required) {
    if (typeof env[key] !== 'string' || !env[key].trim()) {
      throw new Error(`Missing configuration: ${key}`);
    }
  }
  function port(key, fallback) {
    const raw = env[key] === undefined ? String(fallback) : env[key];
    if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > 65535) {
      throw new Error(`Invalid configuration: ${key}`);
    }
    return Number(raw);
  }
  const origin = env.CLIENT_ORIGIN || 'http://localhost:3001';
  let url;
  try { url = new URL(origin); } catch { throw new Error('Invalid configuration: CLIENT_ORIGIN'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) {
    throw new Error('CLIENT_ORIGIN must be an HTTP(S) origin without a path.');
  }
  if (env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('Production CLIENT_ORIGIN must use HTTPS.');
  }
  return {
    port: port('PORT', 9000),
    host: env.HOST || '127.0.0.1',
    clientOrigin: origin,
    secureCookies: env.NODE_ENV === 'production',
    database: {
      host: env.DB_HOST.trim(),
      port: port('DB_PORT', 3306),
      user: env.DB_USER.trim(),
      password: env.DB_PASSWORD,
      users: env.DB_USERS_DATABASE.trim(),
      jobs: env.DB_JOBS_DATABASE.trim(),
    },
  };
}

module.exports = { loadLocalEnvironment, readConfig };
