import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
export default function Listings({ type = 'products' }) {
  const [items,setItems]=useState([]); const [state,setState]=useState('loading'); const [error,setError]=useState(''); const [search,setSearch]=useState('');const [retry,setRetry]=useState(0);
  useEffect(()=>{const controller=new AbortController();setState('loading');setError('');
    api(type==='jobs'?'/api/job':'/api/products',{signal:controller.signal}).then(data=>{setItems(type==='jobs'?data:data.products);setState('ready');}).catch(failure=>{if(failure.name!=='AbortError'){setError(failure.message);setState('error');}});
    return()=>controller.abort();
  },[type,retry]);
  const filtered=items.filter(item=>(type==='jobs'?[item.Job_title,item.Job_category,item.Job_location,item.Job_description]:[item.name,item.category,item.description]).join(' ').toLowerCase().includes(search.toLowerCase()));
  return <section><div className="tf-section-heading"><div><span className="tf-eyebrow">{type==='jobs'?'OPPORTUNITIES':'SAMPLE AGRICULTURE CATALOG'}</span><h1>{type==='jobs'?'Jobs and opportunities':'Explore the catalog'}</h1><p>{type==='jobs'?'Listings published by the project administrator.':'Demonstration products and prices. Purchasing is not available.'}</p></div><label className="tf-search">Search {type}<input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search by name, category or location"/></label></div>
    {state==='loading'&&<p role="status">Loading {type}…</p>}{state==='error'&&<div className="tf-error" role="alert"><p>{error}</p><button onClick={()=>setRetry(retry+1)}>Try again</button></div>}
    {state==='ready'&&<><p className="tf-muted" role="status">{filtered.length} {filtered.length===1?'result':'results'}</p>{!filtered.length&&<div className="tf-card"><h2>{items.length?'No matching results':'Nothing published yet'}</h2><p>{items.length?'Try another search.':'Check back after the administrator adds listings.'}</p></div>}<div className="tf-grid">{filtered.map((item,index)=><article className="tf-card" key={item.ID||item.name||index}><span className="tf-tag">{item.Job_category||item.category}</span><h2>{item.Job_title||item.name}</h2>{type==='jobs'?<><p>{item.Job_location} · {item.Job_span}</p><p>{item.Job_description}</p>{item.Job_requirements&&<p><strong>Requirements:</strong> {item.Job_requirements}</p>}</>:<><p>{item.description}</p><p className="tf-price">Sample price: {item.price}</p></>}</article>)}</div></>}
  </section>;
}
