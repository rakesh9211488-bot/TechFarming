import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
export default function SignUp() {
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [done,setDone]=useState(false);
  async function submit(event) {
    event.preventDefault(); setError('');
    const values=Object.fromEntries(new FormData(event.currentTarget));
    if(values.password!==values.confirmPassword) {setError('Passwords do not match');return;}
    setBusy(true);
    try {await api('/api/users/signup',{method:'POST',body:JSON.stringify(values)});setDone(true);}
    catch(failure){setError(failure.message);}finally{setBusy(false);}
  }
  return <section className="tf-auth tf-card"><span className="tf-eyebrow">START WITH A STRONG FOUNDATION</span><h1>Create your account.</h1>{done?<div role="status"><p>Your account is ready. Sign in to open your workspace.</p><Link className="tf-button" to="/login">Sign in</Link></div>:<><p>We only need your name, email and password.</p><form onSubmit={submit}>
    <label>Name<input name="name" autoComplete="name" required maxLength={150}/></label>
    <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
    <label>Password<input name="password" type="password" autoComplete="new-password" required minLength={8} aria-describedby="tf-password-hint"/></label>
    <small id="tf-password-hint">Use at least 8 characters. Maximum: 72 UTF-8 bytes.</small>
    <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8}/></label>
    {error&&<p className="tf-error" role="alert">{error}</p>}<button className="tf-button" disabled={busy}>{busy?'Creating account…':'Create account'}</button>
    </form><p>Already have an account? <Link to="/login">Sign in</Link></p></>}</section>;
}
