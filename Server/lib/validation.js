function text(value, name, max, required = true) {
  if (value == null && !required) return null;
  if (typeof value !== 'string' || (required && !value.trim()) || value.trim().length > max) {
    const error = new Error(`Invalid ${name}`); error.status = 400; throw error;
  }
  return value.trim() || null;
}
function credentials(body = {}) {
  const email = text(body.email, 'email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('Invalid email'), { status: 400 });
  if (typeof body.password !== 'string' || body.password.length < 8 || Buffer.byteLength(body.password, 'utf8') > 72) {
    throw Object.assign(new Error('Password must contain at least 8 characters and at most 72 UTF-8 bytes'), { status: 400 });
  }
  return { email, password: body.password };
}
function signup(body = {}) {
  const result = { ...credentials(body), name: text(body.name, 'name', 150), gender: text(body.gender, 'gender', 50, false), dob: null };
  if (body.dob) {
    const dob = text(body.dob, 'date of birth', 10);
    const date = new Date(`${dob}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dob || date > new Date()) {
      throw Object.assign(new Error('Invalid date of birth'), { status: 400 });
    }
    result.dob = dob;
  }
  return result;
}
function job(body = {}) {
  return {
    category: text(body.category, 'category', 150), title: text(body.title, 'title', 200),
    location: text(body.location, 'location', 200), span: text(body.span, 'span', 100),
    description: text(body.description, 'description', 10000),
    requirements: text(body.requirements, 'requirements', 10000, false),
    additionalInfo: text(body.additionalInfo, 'additional information', 10000, false),
  };
}
function reading(body = {}) {
  const limits = { temperature: [-40, 85], humidity: [0, 100], moisture: [0, 100], ph: [0, 14] };
  const result = {};
  let count = 0;
  for (const [key, [min, max]] of Object.entries(limits)) {
    const value = body[key];
    if (value === undefined || value === null) { result[key] = null; continue; }
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
      throw Object.assign(new Error(`Invalid ${key} reading`), { status: 400 });
    }
    result[key] = value; count++;
  }
  if (!count) throw Object.assign(new Error('At least one supported reading is required'), { status: 400 });
  return result;
}
module.exports = { text, credentials, signup, job, reading };
