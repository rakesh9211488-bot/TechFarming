const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp, digest } = require('../app');
const origin = 'http://localhost:3000';
class MemoryRepository {
  constructor() { this.users = []; this.sessions = new Map(); this.jobs = []; this.devices = []; this.readings = []; }
  async createUser(user, hash) {
    if (this.users.some(item => item.Email === user.email)) throw Object.assign(new Error(), { code: 'ER_DUP_ENTRY' });
    this.users.push({ ID: this.users.length + 1, Name: user.name, Email: user.email, Password: hash, Role: 'user' });
  }
  async findUser(email) { return this.users.find(user => user.Email === email); }
  async addSession(hash, userId, expires) { this.sessions.set(hash, { userId, expires }); }
  async findSession(hash) {
    const session = this.sessions.get(hash);
    return session && session.expires > new Date() ? this.users.find(user => user.ID === session.userId) : null;
  }
  async removeSession(hash) { this.sessions.delete(hash); }
  async listJobs() { return this.jobs; }
  async createJob(job) { this.jobs.push(job); return this.jobs.length; }
  async createDevice(userId, name, tokenHash) { this.devices.push({ ID: this.devices.length + 1, User_ID: userId, Name: name, Token_Hash: tokenHash, Last_Seen: null }); return this.devices.length; }
  async listDevices(userId) { return this.devices.filter(d => d.User_ID === userId).map(({ ID, Name, Last_Seen }) => ({ ID, Name, Last_Seen })); }
  async findDevice(hash) { return this.devices.find(d => d.Token_Hash === hash); }
  async rotateDevice(userId, deviceId, tokenHash) { const device = this.devices.find(d => d.User_ID === userId && d.ID === Number(deviceId)); if (!device) return false; device.Token_Hash = tokenHash; return true; }
  async addReading(deviceId, reading) { this.readings.push({ Device_ID: deviceId, ...reading }); }
  async listReadings(userId, deviceId) { if (!this.devices.some(d => d.User_ID === userId && d.ID === Number(deviceId))) return null; return this.readings.filter(r => r.Device_ID === Number(deviceId)); }
  async health() {}
}
async function fixture(t, options) {
  const repository = new MemoryRepository();
  const server = createApp(repository, { clientOrigin: origin }, options).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, body, cookie, headers = {}) {
    const response = await fetch(base + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { Origin: origin, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie') };
  }
  return { repository, request };
}
const user = { name: 'Test Farmer', email: 'TEST@example.com', password: 'Test-Password123', dob: '2000-01-01', gender: '' };
test('signup, persistent session, protected profile and logout', async t => {
  const { repository, request } = await fixture(t);
  assert.equal((await request('/api/users/me')).status, 401);
  assert.equal((await request('/api/users/signup', user)).status, 201);
  assert.notEqual(repository.users[0].Password, user.password);
  assert.equal((await request('/api/users/signup', user)).status, 409);
  assert.equal((await request('/api/users/login', { ...user, password: 'Wrong-Password' })).status, 401);
  const login = await request('/api/users/login', user);
  assert.equal(login.status, 200);
  assert.match(login.cookie, /HttpOnly/); assert.match(login.cookie, /SameSite=Strict/);
  assert.equal(login.body.user.email, 'test@example.com');
  assert.equal(login.body.user.Password, undefined);
  const cookie = login.cookie.split(';')[0];
  const token = cookie.split('=')[1];
  assert.ok(repository.sessions.has(digest(token)));
  assert.ok(!repository.sessions.has(token));
  assert.equal((await request('/api/users/me', undefined, cookie)).status, 200);
  assert.equal((await request('/api/users/logout', {}, cookie)).status, 200);
  assert.equal((await request('/api/users/me', undefined, cookie)).status, 401);
});
test('only administrators can create validated jobs', async t => {
  const { repository, request } = await fixture(t);
  const job = { category: 'Agriculture', title: 'Field technician', location: 'Bremen', span: 'Full time', description: 'Example test listing' };
  assert.equal((await request('/api/job/add', job)).status, 401);
  await request('/api/users/signup', user);
  const cookie = (await request('/api/users/login', user)).cookie.split(';')[0];
  assert.equal((await request('/api/job/add', job, cookie)).status, 403);
  repository.users[0].Role = 'admin';
  assert.equal((await request('/api/job/add', { ...job, title: '' }, cookie)).status, 400);
  assert.equal((await request('/api/job/add', job, cookie)).status, 201);
  assert.equal((await request('/api/job')).body.length, 1);
});
test('validates signup, rejects untrusted origins and keeps account collections private', async t => {
  const { request } = await fixture(t);
  assert.equal((await request('/api/users/signup', { ...user, dob: '2000-02-31' })).status, 400);
  assert.equal((await request('/api/users/signup', { ...user, password: 'x'.repeat(73) })).status, 400);
  assert.equal((await request('/api/users/signup', user, null, { Origin: 'https://attacker.example' })).status, 403);
  assert.equal((await request('/api/users')).status, 403);
  assert.equal((await request('/api/sellers')).status, 403);
  const products = await request('/api/products');
  assert.equal(products.status, 200); assert.ok(products.body.products.length);
  assert.equal(products.body.purchasingAvailable, false);
});
test('invalid and expired session tokens fail authentication', async t => {
  const { repository, request } = await fixture(t);
  await request('/api/users/signup', user);
  const login = await request('/api/users/login', user);
  const cookie = login.cookie.split(';')[0];
  for (const entry of repository.sessions.values()) entry.expires = new Date(0);
  assert.equal((await request('/api/users/me', undefined, cookie)).status, 401);
  assert.equal((await request('/api/users/me', undefined, 'techfarming_session=bad')).status, 401);
});
test('rate limits repeated authentication requests', async t => {
  const { request } = await fixture(t, { authLimit: 2 });
  await request('/api/users/login', {}); await request('/api/users/login', {});
  assert.equal((await request('/api/users/login', {})).status, 429);
});

test('rotates login tokens and rejects the old session', async t => {
  const { request } = await fixture(t);
  await request('/api/users/signup', user);
  const first = (await request('/api/users/login', user)).cookie.split(';')[0];
  const second = (await request('/api/users/login', user, first)).cookie.split(';')[0];
  assert.notEqual(first, second);
  assert.equal((await request('/api/users/me', undefined, first)).status, 401);
  assert.equal((await request('/api/users/me', undefined, second)).status, 200);
});
test('database outages return a controlled error without internal details', async t => {
  const { repository, request } = await fixture(t);
  repository.listJobs = async () => { throw Object.assign(new Error('PRIVATE_DATABASE_DETAIL'), { code: 'ECONNREFUSED' }); };
  const result = await request('/api/job');
  assert.equal(result.status, 503);
  assert.ok(!JSON.stringify(result.body).includes('PRIVATE_DATABASE_DETAIL'));
});

test('device telemetry is validated and isolated by account', async t => {
  const { repository, request } = await fixture(t);
  await request('/api/users/signup', user);
  const cookie = (await request('/api/users/login', user)).cookie.split(';')[0];
  const device = await request('/api/devices', { name: 'Test sensor' }, cookie);
  assert.equal(device.status, 201);
  assert.equal(repository.devices[0].Token_Hash, digest(device.body.token));
  const devices = await request('/api/devices', undefined, cookie);
  assert.equal(devices.body.devices[0].Token_Hash, undefined);
  assert.equal((await request('/api/soil-data', { temperature: 23 }, null, { Authorization: `Bearer ${device.body.token}`, Origin: '' })).status, 201);
  assert.equal((await request('/api/soil-data', { humidity: 120 }, null, { Authorization: `Bearer ${device.body.token}` })).status, 400);
  assert.equal((await request('/api/soil-data', { temperature: 23 })).status, 401);
  assert.equal((await request('/api/devices/1/readings', undefined, cookie)).body.readings.length, 1);
  const other = { ...user, email: 'another@example.com' };
  await request('/api/users/signup', other);
  const otherCookie = (await request('/api/users/login', other)).cookie.split(';')[0];
  assert.equal((await request('/api/devices/1/readings', undefined, otherCookie)).status, 404);
  assert.equal((await request('/api/devices/1/rotate', {}, otherCookie)).status, 404);
  const rotation = await request('/api/devices/1/rotate', {}, cookie);
  assert.equal(rotation.status, 200);
  assert.equal((await request('/api/soil-data', { temperature: 24 }, null, { Authorization: `Bearer ${device.body.token}` })).status, 401);
  assert.equal((await request('/api/soil-data', { temperature: 24 }, null, { Authorization: `Bearer ${rotation.body.token}` })).status, 201);
});
