/* Usly Service Worker for Web Push Notifications */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[Service Worker] Push event received with no data.');
    return;
  }

  try {
    const data = event.data.json();

    const rawTitle = (data.title || 'New update').trim();
    const title = rawTitle.toLowerCase().startsWith('usly')
      ? rawTitle
      : `Usly • ${rawTitle}`;
    const options = {
      body: data.body || 'You have a new update in Usly.',
      icon: data.icon || '/letter-icon.png',
      badge: data.badge || '/letter-icon.png',
      tag: data.data?.notificationId || 'usly-notification',
      renotify: true,
      data: {
        url: data.url || '/',
        ...data.data,
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.focus();
          return client.navigate(targetUrl);
        }
      }
      // If no window open, open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
