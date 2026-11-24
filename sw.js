// TUBC 2027 tracker service worker: shows tag notifications and opens the right task when one is tapped.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const data = e.notification.data || {};
  const url = data.url || self.registration.scope;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (c.url.startsWith(self.registration.scope)) {
        await c.focus();
        if (data.task) c.postMessage({ task: data.task });
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
