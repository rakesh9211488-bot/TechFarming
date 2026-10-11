const test = require('node:test');
const assert = require('node:assert/strict');
const { readConfig } = require('../Config/runtime');
const valid = { DB_HOST: 'localhost', DB_USER: 'app', DB_PASSWORD: 'private-test-value', DB_USERS_DATABASE: 'users', DB_JOBS_DATABASE: 'jobs' };

test('requires explicit database credentials and never reports their value', () => {
  for (const field of Object.keys(valid)) {
    const env = { ...valid }; delete env[field];
    assert.throws(() => readConfig(env), { message: `Missing configuration: ${field}` });
  }
});
test('defaults to a loopback listener and one frontend origin', () => {
  const config = readConfig(valid);
  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.port, 9000);
  assert.equal(config.clientOrigin, 'http://localhost:3000');
  assert.equal(config.database.password, valid.DB_PASSWORD);
});
test('rejects malformed and out-of-range ports', () => {
  for (const field of ['PORT', 'DB_PORT']) {
    for (const value of ['0', '65536', 'abc', '9000abc', '']) {
      assert.throws(() => readConfig({ ...valid, [field]: value }), { message: `Invalid configuration: ${field}` });
    }
  }
});
test('rejects wildcard origins, credentials and paths', () => {
  for (const origin of ['*', 'file:///tmp', 'https://example.com/path', 'https://user:pass@example.com']) {
    assert.throws(() => readConfig({ ...valid, CLIENT_ORIGIN: origin }));
  }
  assert.equal(readConfig({ ...valid, CLIENT_ORIGIN: 'https://example.com' }).clientOrigin, 'https://example.com');
});

test('production requires HTTPS and secure cookies', () => {
  assert.throws(() => readConfig({ ...valid, NODE_ENV: 'production' }), /HTTPS/);
  assert.equal(readConfig({ ...valid, NODE_ENV: 'production', CLIENT_ORIGIN: 'https://example.com' }).secureCookies, true);
});
