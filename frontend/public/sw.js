self.addEventListener("install", (event) => {
  // Minimal install: no offline precache; focus on push notifications only
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try {
    payload = event.data.json();
  } catch (error) {
    console.warn("Non-JSON push payload", error);
    payload = { title: "FurAdopt", body: event.data.text() };
  }

  const {
    title = "FurAdopt",
    body = "New update from FurAdopt",
    icon = "/icons/icon-192x192.png",
    badge = "/icons/icon-192x192.png",
    data = {},
  } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  // In a full implementation, we'd re-subscribe here by contacting the app.
  console.warn("Push subscription change detected", event);
});
