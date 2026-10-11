const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const validation = require('./lib/validation');
const COOKIE = 'techfarming_session';
const TTL = 12 * 60 * 60 * 1000;
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const safeUser = user => ({ id: user.ID, name: user.Name, email: user.Email, role: user.Role });
const route = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
function sessionToken(req) {
  const cookie = (req.headers.cookie || '').split(';').find(item => item.trim().startsWith(`${COOKIE}=`));
  const token = cookie ? cookie.trim().slice(COOKIE.length + 1) : '';
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}
function createApp(repository, config, options = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  const cookies = { httpOnly: true, sameSite: 'strict', secure: Boolean(config.secureCookies), path: '/' };
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (req.path !== '/soil-data' && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin !== config.clientOrigin) {
      return res.status(403).json({ error: 'Request origin is not allowed' });
    }
    next();
  });
  const attempts = new Map();
  function limit(req, res, next) {
    const now = Date.now();
    for (const [ip, entry] of attempts) if (entry.expires <= now) attempts.delete(ip);
    const key = req.ip;
    const entry = attempts.get(key) || { count: 0, expires: now + 15 * 60 * 1000 };
    if (!attempts.has(key) && attempts.size >= 10000) return res.status(429).json({ error: 'Please try again later' });
    entry.count++; attempts.set(key, entry);
    if (entry.count > (options.authLimit || 20)) {
      res.set('Retry-After', String(Math.ceil((entry.expires - now) / 1000)));
      return res.status(429).json({ error: 'Too many attempts. Please try again later' });
    }
    next();
  }
  const requireUser = route(async (req, res, next) => {
    const token = sessionToken(req);
    const user = token ? await repository.findSession(digest(token)) : null;
    if (!user) { res.status(401).json({ error: 'Sign in to continue' }); return; }
    req.user = user;
    next();
  });
  function requireAdmin(req, res, next) {
    if (req.user.Role !== 'admin') return res.status(403).json({ error: 'Administrator access required' });
    next();
  }
  app.get('/api/health', route(async (req, res) => {
    await repository.health(); res.json({ status: 'ok' });
  }));
  app.get(['/api/users', '/api/sellers'], (req, res) => res.status(403).json({ error: 'Account listing is unavailable' }));
  app.post('/api/users/signup', limit, route(async (req, res) => {
    const user = validation.signup(req.body);
    const hash = await bcrypt.hash(user.password, 12);
    await repository.createUser(user, hash);
    res.status(201).json({ message: 'Signup successful' });
  }));
  app.post('/api/users/login', limit, route(async (req, res) => {
    const credentials = validation.credentials(req.body);
    const user = await repository.findUser(credentials.email);
    // Always run a password comparison, including when an account is absent.
    const fallback = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.1lujPZKdbuA6ZvGpHEVCpCnDuNsNVQm';
    const valid = await bcrypt.compare(credentials.password, user ? user.Password : fallback);
    if (!user || !valid) return res.status(401).json({ error: 'Invalid email or password' });
    const previous = sessionToken(req);
    if (previous) await repository.removeSession(digest(previous));
    const token = crypto.randomBytes(32).toString('hex');
    await repository.addSession(digest(token), user.ID, new Date(Date.now() + TTL));
    res.cookie(COOKIE, token, { ...cookies, maxAge: TTL });
    res.json({ message: 'Login successful', user: safeUser(user) });
  }));
  app.get('/api/users/me', requireUser, (req, res) => res.json({ user: safeUser(req.user) }));
  app.post('/api/users/logout', route(async (req, res) => {
    const token = sessionToken(req);
    if (token) await repository.removeSession(digest(token));
    res.clearCookie(COOKIE, cookies); res.json({ message: 'Signed out' });
  }));
  app.get('/api/job', route(async (req, res) => res.json(await repository.listJobs())));
  app.post('/api/job/add', requireUser, requireAdmin, route(async (req, res) => {
    const id = await repository.createJob(validation.job(req.body));
    res.status(201).json({ message: 'Job opening added successfully', id });
  }));
  app.get('/api/devices', requireUser, route(async (req, res) => {
    res.json({ devices: await repository.listDevices(req.user.ID) });
  }));
  app.post('/api/devices', requireUser, route(async (req, res) => {
    const name = validation.text(req.body?.name, 'device name', 100);
    const token = crypto.randomBytes(32).toString('hex');
    const id = await repository.createDevice(req.user.ID, name, digest(token));
    res.status(201).json({ device: { id, name }, token });
  }));
  app.post('/api/devices/:id/rotate', requireUser, route(async (req, res) => {
    if (!/^[1-9]\d{0,14}$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid device id' });
    const token = crypto.randomBytes(32).toString('hex');
    if (!await repository.rotateDevice(req.user.ID, req.params.id, digest(token))) return res.status(404).json({ error: 'Device not found' });
    res.json({ token });
  }));
  app.get('/api/devices/:id/readings', requireUser, route(async (req, res) => {
    if (!/^[1-9]\d{0,14}$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid device id' });
    const readings = await repository.listReadings(req.user.ID, req.params.id);
    if (readings === null) return res.status(404).json({ error: 'Device not found' });
    res.json({ readings });
  }));
  // Firmware uses a per-device Bearer token, never a browser session cookie.
  app.post('/api/soil-data', route(async (req, res) => {
    const match = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization || '');
    const device = match ? await repository.findDevice(digest(match[1])) : null;
    if (!device) return res.status(401).json({ error: 'Invalid device credential' });
    await repository.addReading(device.ID, validation.reading(req.body));
    res.status(201).json({ status: 'recorded' });
  }));
  app.get('/api/products', route(async (req, res) => {
    const data = JSON.parse(await fs.readFile(path.join(__dirname, 'ProductsPage/Products.json'), 'utf8'));
    res.json({ products: data.products, source: 'sample_catalog', purchasingAvailable: false });
  }));
  // These prototype integrations have no verified implementation or model.
  app.all(['/classify-image', '/add-product', '/api/sellers/signup'], (req, res) => {
    res.status(501).json({ error: 'This prototype feature is not available yet' });
  });
  app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'An account with this email already exists' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large' });
    if (error.status === 400) return res.status(400).json({ error: error.message });
    console.error('Request failed:', error.code || error.name || 'UNKNOWN');
    res.status(503).json({ error: 'Service temporarily unavailable. Check the database setup and try again' });
  });
  return app;
}
module.exports = { createApp, digest };
