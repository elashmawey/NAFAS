/* ═══════════════════════════════════════════════════════════════
   نَفَس Pro — Service Worker
   الكاش من أول زيارة → التطبيق يفتح من غير إنترنت للأبد،
   والمتصفح يقدّر يقترح «تثبيت التطبيق» على الشاشة الرئيسية.
   ارفع الملف ده بجانب index.html في جذر الموقع (Vercel).
   ملاحظة: لو حدّثت التطبيق غيّر رقم CACHE (nafas-pro-v4 مثلاً)
   عشان الزوار ياخدوا النسخة الجديدة فوراً.
   ═══════════════════════════════════════════════════════════════ */
const CACHE='nafas-pro-v4';
const ASSETS=['/','/index.html'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return; // الإعلانات والخطوط الخارجية تمرّ كما هي
  e.respondWith(
    caches.match(e.request,{ignoreSearch:true}).then(hit=>
      hit||fetch(e.request).then(res=>{
        if(res.ok&&res.type==='basic'){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
        }
        return res;
      }).catch(()=>caches.match('/index.html'))
    )
  );
});
