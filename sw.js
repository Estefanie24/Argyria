const CACHE='argyria-core-v3';
const CORE=[
  './','./index.html','./games.html','./manifest.json',
  './icon-192.png','./icon-512.png',
  './motion-lab/','./motion-lab/index.html',
  './aether-cauldron/','./aether-cauldron/index.html',
  './zone-runner/','./zone-runner/index.html',
  './route-lab/','./route-lab/index.html',
  './wellness-center/','./wellness-center/index.html',
  './wellness-center/css/wellness.css','./wellness-center/js/wellness.js'
];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  const results=await Promise.all(CORE.map(async path=>{
    try{await cache.add(path);return {path,ok:true};}
    catch(error){return {path,ok:false};}
  }));
  const failed=results.filter(item=>!item.ok).map(item=>item.path);
  if(failed.length)console.warn('Argyria: resources not precached:',failed);
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('argyria-core-')&&key!==CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==location.origin)return;
  event.respondWith((async()=>{
    const cached=await caches.match(request);
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone());}
      return response;
    }catch(error){
      if(request.mode==='navigate')return (await caches.match('./index.html'))||Response.error();
      return Response.error();
    }
  })());
});
