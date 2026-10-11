const test = require('node:test');
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');
const Repository = require('../lib/repository');
const { createApp } = require('../app');
const { readConfig } = require('../Config/runtime');
test('MySQL-backed signup, durable session, admin job and logout', { skip: process.env.MYSQL_INTEGRATION_TEST !== '1' }, async t => {
  assert.equal(process.env.CI, 'true', 'Use a disposable CI database only');
  const config = readConfig();
  assert.equal(config.database.users, 'techfarming_users_ci');
  assert.equal(config.database.jobs, 'techfarming_jobs_ci');
  const base = { host: config.database.host, port: config.database.port, user: config.database.user, password: config.database.password, timezone: 'Z' };
  const users = mysql.createPool({ ...base, database: config.database.users });
  const jobs = mysql.createPool({ ...base, database: config.database.jobs });
  t.after(async () => { await Promise.all([users.end(), jobs.end()]); });
  const server = createApp(new Repository(users, jobs), config).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  async function request(path, body, cookie, headers = {}) {
    const response = await fetch(url + path, { method: body === undefined ? 'GET' : 'POST', headers: { Origin: config.clientOrigin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie') };
  }
  const account = { name: 'Database Integration Test', email: `integration-${Date.now()}@example.com`, password: 'Integration-Test123' };
  assert.equal((await request('/api/health')).status, 200);
  assert.equal((await request('/api/users/signup', account)).status, 201);
  assert.equal((await request('/api/users/signup', account)).status, 409);
  const login = await request('/api/users/login', account);
  assert.equal(login.status, 200);
  const cookie = login.cookie.split(';')[0];
  const tokenHash = require('../app').digest(cookie.split('=')[1]);
  // A new repository instance must recover the session from MySQL, not memory.
  assert.ok(await new Repository(users, jobs).findSession(tokenHash));
  const [stored] = await users.execute('SELECT Password FROM user_sign_up WHERE Email = ?', [account.email]);
  assert.notEqual(stored[0].Password, account.password);
  await users.execute("UPDATE user_sign_up SET Role = 'admin' WHERE Email = ?", [account.email]);
  const job = { category: 'Agriculture', title: 'MySQL integration test job', location: 'Test location', span: 'Test role', description: 'Disposable integration fixture' };
  assert.equal((await request('/api/job/add', job, cookie)).status, 201);
  assert.ok((await request('/api/job')).body.some(row => row.Job_title === job.title));
  const device = await request('/api/devices', { name: 'MySQL device fixture' }, cookie);
  assert.equal(device.status, 201);
  assert.equal((await request('/api/soil-data', { temperature: 21.5, humidity: 62 }, null, { Authorization: `Bearer ${device.body.token}` })).status, 201);
  const readings = await request(`/api/devices/${device.body.device.id}/readings`, undefined, cookie);
  assert.equal(readings.status, 200);
  assert.equal(readings.body.readings[0].Temperature, 21.5);
  assert.equal((await request('/api/users/logout', {}, cookie)).status, 200);
  assert.equal((await request('/api/users/me', undefined, cookie)).status, 401);
});
