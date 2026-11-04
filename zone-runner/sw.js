// Bump V whenever you ship a new index.html so installed copies refresh.
const V='zone-runner-v10',CORE=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(
  caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  // Same-origin files plus Google Fonts only; everything else passes through.
  if(r.method!=='GET'||(u.origin!==location.origin&&!/(^|\.)(googleapis|gstatic)\.com$/.test(u.hostname)))return;
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{
    // Stale-while-revalidate: answer from cache instantly, refresh in the background.
    const net=fetch(r).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}
      return res;
    }).catch(()=>hit||(r.mode==='navigate'?caches.match('index.html'):Response.error()));
    e.waitUntil(net.catch(()=>{}));
    return hit||net;
  }));
});
