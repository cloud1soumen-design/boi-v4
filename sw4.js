const V='brd4-v6',FILES=['v4.html','manifest4.json','icon4-192.png','icon4-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k.startsWith('brd4-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin)return;
 if(/\.(txt|csv|json)$/.test(u.pathname)&&!/manifest4\.json$/.test(u.pathname))return;
 e.respondWith((async()=>{
  const hit=await caches.match(r,{ignoreSearch:true});
  const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>null);
  return hit||(await net)||(await caches.match('v4.html'));
 })());
});
