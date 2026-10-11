class Repository {
  constructor(users, jobs) { this.users = users; this.jobs = jobs; }
  async createUser(user, hash) {
    const [result] = await this.users.execute('INSERT INTO user_sign_up (Name, Email, Date_of_Birth, Gender, Password) VALUES (?, ?, ?, ?, ?)', [user.name, user.email, user.dob, user.gender, hash]);
    return result.insertId;
  }
  async findUser(email) {
    const [rows] = await this.users.execute('SELECT ID, Name, Email, Password, Role FROM user_sign_up WHERE Email = ? LIMIT 1', [email]);
    return rows[0];
  }
  async addSession(tokenHash, userId, expires) {
    await this.users.execute('DELETE FROM user_sessions WHERE Expires_At <= UTC_TIMESTAMP()');
    await this.users.execute('INSERT INTO user_sessions (Token_Hash, User_ID, Expires_At) VALUES (?, ?, ?)', [tokenHash, userId, expires]);
  }
  async findSession(tokenHash) {
    const [rows] = await this.users.execute('SELECT u.ID, u.Name, u.Email, u.Role FROM user_sessions s JOIN user_sign_up u ON u.ID = s.User_ID WHERE s.Token_Hash = ? AND s.Expires_At > UTC_TIMESTAMP() LIMIT 1', [tokenHash]);
    return rows[0];
  }
  async removeSession(tokenHash) { await this.users.execute('DELETE FROM user_sessions WHERE Token_Hash = ?', [tokenHash]); }
  async listJobs() {
    const [rows] = await this.jobs.execute('SELECT ID, Job_category, Job_title, Job_location, Job_span, Job_description, Job_requirements, Job_additionInfo FROM jods_list ORDER BY ID DESC LIMIT 100');
    return rows;
  }
  async createJob(job) {
    const [result] = await this.jobs.execute('INSERT INTO jods_list (Job_category, Job_title, Job_location, Job_span, Job_description, Job_requirements, Job_additionInfo) VALUES (?, ?, ?, ?, ?, ?, ?)', Object.values(job));
    return result.insertId;
  }
  async createDevice(userId, name, tokenHash) {
    const [result] = await this.users.execute('INSERT INTO user_devices (User_ID, Name, Token_Hash) VALUES (?, ?, ?)', [userId, name, tokenHash]);
    return result.insertId;
  }
  async listDevices(userId) {
    const [rows] = await this.users.execute('SELECT ID, Name, Last_Seen FROM user_devices WHERE User_ID = ? ORDER BY ID DESC LIMIT 100', [userId]);
    return rows;
  }
  async findDevice(tokenHash) {
    const [rows] = await this.users.execute('SELECT ID FROM user_devices WHERE Token_Hash = ? LIMIT 1', [tokenHash]);
    return rows[0];
  }
  async rotateDevice(userId, deviceId, tokenHash) {
    const [result] = await this.users.execute('UPDATE user_devices SET Token_Hash = ? WHERE ID = ? AND User_ID = ?', [tokenHash, deviceId, userId]);
    return result.affectedRows > 0;
  }
  async addReading(deviceId, reading) {
    const connection = await this.users.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute('INSERT INTO device_readings (Device_ID, Temperature, Humidity, Moisture, PH) VALUES (?, ?, ?, ?, ?)', [deviceId, reading.temperature, reading.humidity, reading.moisture, reading.ph]);
      await connection.execute('UPDATE user_devices SET Last_Seen = UTC_TIMESTAMP(3) WHERE ID = ?', [deviceId]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }
  async listReadings(userId, deviceId) {
    const [device] = await this.users.execute('SELECT ID FROM user_devices WHERE ID = ? AND User_ID = ?', [deviceId, userId]);
    if (!device.length) return null;
    const [rows] = await this.users.execute('SELECT ID, Temperature, Humidity, Moisture, PH, Recorded_At FROM device_readings WHERE Device_ID = ? ORDER BY ID DESC LIMIT 100', [deviceId]);
    return rows;
  }
  async health() {
    await this.users.query('SELECT ID, Role FROM user_sign_up LIMIT 0');
    await this.users.query('SELECT Token_Hash FROM user_sessions LIMIT 0');
    await this.users.query('SELECT ID FROM user_devices LIMIT 0');
    await this.users.query('SELECT ID FROM device_readings LIMIT 0');
    await this.jobs.query('SELECT ID FROM jods_list LIMIT 0');
  }
}
module.exports = Repository;
