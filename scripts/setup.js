const { spawnSync } = require('node:child_process');
const path = require('node:path');
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run this helper with npm run setup.');
for (const folder of ['Server', 'client']) {
  const result = spawnSync(process.execPath, [npm, 'ci'], {
    cwd: path.resolve(__dirname, '..', folder), stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
