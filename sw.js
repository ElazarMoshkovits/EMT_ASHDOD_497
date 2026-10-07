// הגרסה הישנה של האפליקציה כבר לא זמינה כאן. הקובץ הזה מחליף את ה־service worker הישן,
// מוחק את כל המטמונים ששמר, ומסיר את עצמו, כדי שמכשירים שהתקינו את האפליקציה יקבלו את דף ההודעה.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.navigate(c.url));
  })());
});
