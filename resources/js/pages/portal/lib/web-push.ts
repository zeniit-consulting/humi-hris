const vapidPublicKey = import.meta.env.VITE_WEB_PUSH_VAPID_PUBLIC_KEY as
    | string
    | undefined;

const urlBase64ToUint8Array = (value: string) => {
    const padding = '='.repeat((4 - (value.length % 4)) % 4);
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);

    return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
};

export const webPushIsSupported = () =>
    Boolean(
        vapidPublicKey &&
            window.isSecureContext &&
            'serviceWorker' in navigator &&
            'PushManager' in window &&
            'Notification' in window,
    );

export async function enableWebPush(): Promise<PushSubscription> {
    if (!webPushIsSupported() || !vapidPublicKey) {
        throw new Error('Web Push Safari belum dikonfigurasi atau tidak didukung.');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        throw new Error('Izin notifikasi belum diberikan.');
    }

    const registration = await navigator.serviceWorker.register(
        '/web-push-worker.js',
        { scope: '/' },
    );
    const existing = await registration.pushManager.getSubscription();

    return (
        existing ??
        registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        })
    );
}

export const serializeWebPushSubscription = (subscription: PushSubscription) =>
    subscription.toJSON() as Record<string, unknown>;
