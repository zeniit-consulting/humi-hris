self.addEventListener('push', (event) => {
    const payload = event.data?.json?.() ?? {};
    const title = payload.title || 'Humi';

    event.waitUntil(
        self.registration.showNotification(title, {
            body: payload.body || 'Ada pengingat baru.',
            icon: '/icons/icon-192.png',
            data: { url: payload.url || '/portal/attendance' },
        }),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(self.clients.openWindow(event.notification.data?.url || '/portal/attendance'));
});
