const mysql = require('mysql2/promise');
async function main() {
  if (process.env.CI !== 'true') throw new Error('This helper is restricted to disposable CI databases.');
  if (process.env.DB_USERS_DATABASE !== 'techfarming_users_ci' || process.env.DB_JOBS_DATABASE !== 'techfarming_jobs_ci') {
    throw new Error('Unexpected CI schema names.');
  }
  const connection = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD });
  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS techfarming_users_ci CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('CREATE DATABASE IF NOT EXISTS techfarming_jobs_ci CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  } finally { await connection.end(); }
}
main().catch(error => { console.error(error.code || error.message); process.exitCode = 1; });
