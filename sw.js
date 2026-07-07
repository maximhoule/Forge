const CACHE='forge-v27';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png'];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>k===CACHE?null:caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  if(req.mode==='navigate'){
    e.respondWith(
      fetch(req).then(r=>{ const c=r.clone(); caches.open(CACHE).then(x=>x.put('./index.html', c)); return r; })
                .catch(()=> caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit=> hit || fetch(req).then(r=>{
      if(r && (r.ok || r.type==='opaque')){ const c=r.clone(); caches.open(CACHE).then(x=>x.put(req, c)); }
      return r;
    }).catch(()=> new Response('', {status:504, statusText:'offline'})))
  );
});
