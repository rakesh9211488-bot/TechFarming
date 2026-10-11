const fs = require('node:fs');
const path = require('node:path');
const { checksum, applyMigration } = require('./migration-core');
const { loadLocalEnvironment, readConfig } = require('../Config/runtime');

function migrations(group) {
  const folder = path.resolve(__dirname, '../../Database/migrations', group);
  return fs.readdirSync(folder).filter(name => /^\d+_[a-z_]+\.sql$/.test(name)).sort()
    .map(name => ({ name, sql: fs.readFileSync(path.join(folder, name), 'utf8') }));
}

async function main() {
  const argument = process.argv[2];
  if (process.argv.length > 3 || (argument && argument !== '--plan')) {
    throw new Error('Usage: node scripts/migrate.js [--plan]');
  }
  const groups = ['users', 'jobs'];
  if (argument === '--plan') {
    for (const group of groups) {
      for (const migration of migrations(group)) {
        console.log(`${group}/${migration.name} ${checksum(migration.sql)}`);
      }
    }
    return;
  }
  loadLocalEnvironment();
  const config = readConfig();
  if (config.database.users === config.database.jobs) {
    throw new Error('User and jobs databases must have different names.');
  }
  const mysql = require('mysql2/promise');
  for (const group of groups) {
    const database = config.database[group];
    const connection = await mysql.createConnection({
      host: config.database.host, port: config.database.port,
      user: config.database.user, password: config.database.password, database,
    });
    const lock = `tf-migrate-${checksum(database).slice(0, 40)}`;
    let locked = false;
    try {
      const [rows] = await connection.execute('SELECT GET_LOCK(?, 0) AS acquired', [lock]);
      if (rows[0].acquired !== 1) throw new Error(`Another migration is running for ${group}.`);
      locked = true;
      await connection.query(`CREATE TABLE IF NOT EXISTS techfarming_migrations (
        name VARCHAR(200) NOT NULL PRIMARY KEY,
        checksum CHAR(64) NOT NULL,
        status VARCHAR(20) NOT NULL,
        applied_at TIMESTAMP NULL
      ) ENGINE=InnoDB`);
      for (const migration of migrations(group)) {
        console.log(`${group}/${migration.name}: ${await applyMigration(connection, migration)}`);
      }
    } finally {
      try {
        if (locked) await connection.execute('SELECT RELEASE_LOCK(?)', [lock]);
      } finally { await connection.end(); }
    }
  }
}

main().catch(error => {
  // Driver error messages can include database details; avoid exposing them.
  console.error(error.code ? `Migration failed (${error.code}). Review database state before retrying.` : error.message);
  process.exitCode = 1;
});
