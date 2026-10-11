const test = require('node:test');
const assert = require('node:assert/strict');
const { checksum, applyMigration } = require('../scripts/migration-core');
const migration = { name: '001_example.sql', sql: 'CREATE TABLE example (id INT)' };
function database(existing = [], failDDL = false) {
  const calls = [];
  return { calls,
    async execute(sql, values) {
      calls.push({ sql, values });
      return [sql.startsWith('SELECT') ? existing : {}];
    },
    async query(sql) { calls.push({ sql }); if (failDDL) throw new Error('DDL failed'); },
  };
}
test('records start before DDL and success afterward', async () => {
  const db = database();
  assert.equal(await applyMigration(db, migration), 'applied');
  assert.match(db.calls[1].sql, /INSERT/);
  assert.equal(db.calls[2].sql, migration.sql);
  assert.match(db.calls[3].sql, /status = 'applied'/);
});
test('repeated successful migration performs no DDL', async () => {
  const db = database([{ checksum: checksum(migration.sql), status: 'applied' }]);
  assert.equal(await applyMigration(db, migration), 'skipped');
  assert.equal(db.calls.length, 1);
});
test('modified applied migrations are rejected', async () => {
  const db = database([{ checksum: 'different', status: 'applied' }]);
  await assert.rejects(applyMigration(db, migration), /Migration changed/);
  assert.equal(db.calls.length, 1);
});
test('interrupted migration requires manual recovery', async () => {
  const db = database([{ checksum: checksum(migration.sql), status: 'started' }]);
  await assert.rejects(applyMigration(db, migration), /manual recovery/);
  assert.equal(db.calls.length, 1);
});
test('failed DDL is never recorded as applied', async () => {
  const db = database([], true);
  await assert.rejects(applyMigration(db, migration), /DDL failed/);
  assert.equal(db.calls.length, 3);
});
