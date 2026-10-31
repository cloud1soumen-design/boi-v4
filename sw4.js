const V='brd4-v17',FILES=['v4.html','manifest4.json','icon4-192.png','icon4-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k.startsWith('brd4-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method==='POST'&&u.searchParams.has('share')){
  e.respondWith((async()=>{
   try{
    const fd=await r.formData(),c=await caches.open('share-inbox');
    for(const k of await c.keys())await c.delete(k);
    const files=fd.getAll('book').filter(f=>f&&f.name);
    let i=0;
    for(const f of files)await c.put(new URL('__share/f'+(i++),self.registration.scope).href,new Response(f,{headers:{'x-name':encodeURIComponent(f.name),'content-type':f.type||'application/octet-stream'}}));
    const text=[fd.get('title'),fd.get('text'),fd.get('url')].filter(x=>typeof x==='string'&&x).join(' ');
    await c.put(new URL('__share/meta',self.registration.scope).href,new Response(JSON.stringify({n:files.length,text})));
   }catch(err){}
   return Response.redirect(new URL('v4.html?shared=1',self.registration.scope).href,303);
  })());
  return;
 }
 if(r.method!=='GET'||u.origin!==location.origin)return;
 if(/\.(txt|csv|json)$/.test(u.pathname)&&!/manifest4\.json$/.test(u.pathname))return;
 e.respondWith((async()=>{
  const hit=await caches.match(r,{ignoreSearch:true});
  const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>null);
  return hit||(await net)||(await caches.match('v4.html'));
 })());
});
