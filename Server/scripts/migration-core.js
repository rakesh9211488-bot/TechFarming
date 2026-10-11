const crypto = require('node:crypto');

function checksum(sql) {
  return crypto.createHash('sha256').update(sql).digest('hex');
}

async function applyMigration(connection, migration) {
  const digest = checksum(migration.sql);
  const [rows] = await connection.execute(
    'SELECT checksum, status FROM techfarming_migrations WHERE name = ?', [migration.name]);
  if (rows.length) {
    if (rows[0].checksum !== digest) throw new Error(`Migration changed: ${migration.name}`);
    if (rows[0].status !== 'applied') throw new Error(`Migration needs manual recovery: ${migration.name}`);
    return 'skipped';
  }
  await connection.execute(
    "INSERT INTO techfarming_migrations (name, checksum, status) VALUES (?, ?, 'started')",
    [migration.name, digest]);
  // MySQL DDL implicitly commits. A started record intentionally survives errors.
  // Do not retry or roll back automatically after a partial DDL operation.
  await connection.query(migration.sql);
  await connection.execute(
    "UPDATE techfarming_migrations SET status = 'applied', applied_at = CURRENT_TIMESTAMP WHERE name = ?",
    [migration.name]);
  return 'applied';
}

module.exports = { checksum, applyMigration };
