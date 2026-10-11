import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf,FaSignOutAlt,FaBriefcase,FaSeedling } from 'react-icons/fa';
import Devices from '../../Components/Workspace/Devices';
import { api } from '../../lib/api';
export default function Dashboard(){
  const [user,setUser]=useState(null);const [state,setState]=useState('loading');const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [revision,setRevision]=useState(0);
  useEffect(()=>{const controller=new AbortController();setState('loading');api('/api/users/me',{signal:controller.signal}).then(data=>{setUser(data.user);setState('ready');}).catch(failure=>{if(failure.name!=='AbortError'){setState(failure.status===401?'signedOut':'error');setError(failure.message);}});return()=>controller.abort();},[revision]);
  async function logout(){setBusy(true);setError('');try{await api('/api/users/logout',{method:'POST',body:'{}'});setUser(null);setState('signedOut');}catch(failure){setError(failure.message);}finally{setBusy(false);}}
  if(state==='loading')return <p role="status">Opening your workspace…</p>;
  if(state==='signedOut')return <section className="tf-auth tf-card"><FaLeaf className="tf-feature-icon" aria-hidden="true"/><h1>Your workspace starts here.</h1><p>Sign in to view your account and explore the project.</p><div className="tf-actions"><Link className="tf-button" to="/login">Sign in</Link><Link to="/api/signup/users">Create an account</Link></div></section>;
  if(state==='error')return <div className="tf-card"><h1>We couldn’t open your workspace.</h1><p role="alert">{error}</p><button onClick={()=>setRevision(revision+1)}>Try again</button></div>;
  return <><section className="tf-section-heading"><div><span className="tf-eyebrow">YOUR TECHFARMING WORKSPACE</span><h1>Welcome, {user.name}.</h1><p>{user.email}</p></div><button className="tf-button tf-secondary" onClick={logout} disabled={busy}><FaSignOutAlt aria-hidden="true"/>{busy?'Signing out…':'Sign out'}</button></section>{error&&<p className="tf-error" role="alert">{error}</p>}
    <div className="tf-grid"><Link className="tf-card tf-card-link" to="/products"><FaSeedling aria-hidden="true"/><h2>Product catalog</h2><p>Browse and search demonstration agriculture products.</p></Link><Link className="tf-card tf-card-link" to="/jobs"><FaBriefcase aria-hidden="true"/><h2>Jobs</h2><p>Explore administrator-published opportunities.</p></Link><article className="tf-card"><span className="tf-tag">HARDWARE DEVELOPMENT</span><h2>IoT monitoring</h2><p>Register your sensor below and inspect its reports. Physical sensor integration and rover controls still require hardware verification.</p></article></div>
    <Devices/>
    {user.role==='admin'&&<JobEditor/>}
    <section className="tf-note"><h2>Build with purpose.</h2><p>Better decisions begin with better information. Account access and device reporting are available. Physical hardware and purchasing still need verification or implementation.</p></section>
  </>;
}
function JobEditor(){const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [failed,setFailed]=useState(false);
 async function submit(event){event.preventDefault();const form=event.currentTarget;setBusy(true);setMessage('');try{await api('/api/job/add',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(form)))});form.reset();setFailed(false);setMessage('Job published. Open Jobs to review it.');}catch(error){setFailed(true);setMessage(error.message);}finally{setBusy(false);}}
 return <section className="tf-card tf-editor"><h2>Publish a job</h2><p>Administrator access is checked on the server.</p><form onSubmit={submit}>{[['title','Title',200],['category','Category',150],['location','Location',200],['span','Employment type',100]].map(([name,label,max])=><label key={name}>{label}<input name={name} required maxLength={max}/></label>)}<label>Description<textarea name="description" required maxLength={10000}/></label><label>Requirements (optional)<textarea name="requirements" maxLength={10000}/></label><label>Additional information (optional)<textarea name="additionalInfo" maxLength={10000}/></label>{message&&<p role={failed?'alert':'status'} className={failed?'tf-error':''}>{message}</p>}<button className="tf-button" disabled={busy}>{busy?'Publishing…':'Publish job'}</button></form></section>;
}
