const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
const { loadLocalEnvironment, readConfig } = require('../Server/Config/runtime');
loadLocalEnvironment();
const config = readConfig();
if (!['http://localhost:3001', 'http://127.0.0.1:3001'].includes(config.clientOrigin)) {
  throw new Error('The local helper requires CLIENT_ORIGIN=http://localhost:3001 or http://127.0.0.1:3001.');
}
const vite = path.join(root, 'client/node_modules/vite/bin/vite.js');
if (!fs.existsSync(vite)) throw new Error('Dependencies missing. Run npm run setup first.');
const preview = process.argv.includes('--preview');
const address = ['0.0.0.0', '::'].includes(config.host) ? '127.0.0.1' : config.host;
const host = address.includes(':') ? `[${address}]` : address;
const target = `http://${host}:${config.port}`;
const definitions = [
  { folder: 'Server', args: [...(preview ? [] : ['--watch']), 'server.js'] },
  { folder: 'client', args: [vite, ...(preview ? ['preview'] : []), '--host', '127.0.0.1', '--port', '3001', '--strictPort'] },
];
let stopping = false;
const children = [];
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill('SIGTERM');
}
for (const definition of definitions) {
  const child = spawn(process.execPath, definition.args, {
    cwd: path.join(root, definition.folder), stdio: 'inherit',
    env: { ...process.env, TF_API_TARGET: target },
  });
  children.push(child);
  child.on('error', error => { console.error('Startup failed:', error.code); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code || 1); });
}
console.log(`Open ${config.clientOrigin}. Press Ctrl+C to stop both services.`);
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
