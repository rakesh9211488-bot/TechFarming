const { createPools } = require('./lib/pools');
const { loadLocalEnvironment, readConfig } = require('./Config/runtime');
const Repository = require('./lib/repository');
const { createApp } = require('./app');
loadLocalEnvironment();
const config = readConfig();
const { users, jobs } = createPools(config);
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
