// Service worker for the owner dashboard: shows push notifications (orders, requests,
// messages, live chats, team chat) and keeps the number on the home-screen icon up to date.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = { title: "Shop update", body: "", url: "/admin" };
  try { data = { ...data, ...event.data.json() }; } catch {}
  const tasks = [
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url },
      tag: `${Date.now()}`, // each one stays in the list (3, 5, 10... all show)
    }),
  ];
  // the number on the home-screen icon
  if (typeof data.badge === "number" && self.navigator.setAppBadge) tasks.push(data.badge > 0 ? self.navigator.setAppBadge(data.badge) : self.navigator.clearAppBadge());
  event.waitUntil(Promise.all(tasks).catch(() => {}));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) { c.navigate(url); return c.focus(); }
      }
      return self.clients.openWindow(url);
    })
  );
});
