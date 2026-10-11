const mysql = require('mysql2/promise');
function createPools(config) {
  const base = {
    host: config.database.host, port: config.database.port,
    user: config.database.user, password: config.database.password,
    waitForConnections: true, connectionLimit: 10, queueLimit: 100, timezone: 'Z',
  };
  function pool(database) {
    const value = mysql.createPool({ ...base, database });
    // Driver timezone controls Date serialization; MySQL session timezone also
    // needs UTC so TIMESTAMP receipt times are decoded consistently.
    value.on('connection', connection => {
      connection.query("SET time_zone = '+00:00'", error => {
        if (error) connection.destroy();
      });
    });
    return value;
  }
  return { users: pool(config.database.users), jobs: pool(config.database.jobs) };
}
module.exports = { createPools };
