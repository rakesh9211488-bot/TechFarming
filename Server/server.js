const mysql = require('mysql2/promise');
const { loadLocalEnvironment, readConfig } = require('./Config/runtime');
const Repository = require('./lib/repository');
const { createApp } = require('./app');
loadLocalEnvironment();
const config = readConfig();
const base = {
  host: config.database.host, port: config.database.port,
  user: config.database.user, password: config.database.password,
  waitForConnections: true, connectionLimit: 10, queueLimit: 100,
  timezone: 'Z',
};
const users = mysql.createPool({ ...base, database: config.database.users });
const jobs = mysql.createPool({ ...base, database: config.database.jobs });
const app = createApp(new Repository(users, jobs), config);
const server = app.listen(config.port, config.host, () => {
  console.log(`TechFarming API listening at http://${config.host}:${config.port}`);
});
server.on('error', error => { console.error('Server startup failed:', error.code); process.exitCode = 1; });
async function stop() {
  server.close(async () => { await Promise.all([users.end(), jobs.end()]); });
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
