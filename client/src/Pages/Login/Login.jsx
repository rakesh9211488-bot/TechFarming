import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
export default function Login() {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try { await api('/api/users/login', { method:'POST', body:JSON.stringify(values) }); navigate('/dashboard'); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  return <section className="tf-auth tf-card"><span className="tf-eyebrow">WELCOME BACK</span><h1>Sign in to your workspace.</h1><p>Your session stays private and is checked by the server.</p><form onSubmit={submit}>
    <label>Email<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required minLength={8} /></label>
    {error && <p className="tf-error" role="alert">{error}</p>}
    <button className="tf-button" disabled={busy}>{busy?'Signing in…':'Sign in'}</button>
  </form><p>New to TechFarming? <Link to="/api/signup/users">Create an account</Link></p></section>;
}
