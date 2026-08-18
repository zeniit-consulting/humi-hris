import { getApp, getApps, initializeApp } from 'firebase/app';
import {
    getMessaging,
    getToken,
    isSupported,
    onMessage,
} from 'firebase/messaging';

const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const withTimeout = async <T>(promise: Promise<T>, label: string): Promise<T> =>
    Promise.race([
        promise,
        new Promise<never>((_, reject) => {
            window.setTimeout(
                () =>
                    reject(
                        new Error(
                            `${label} memakan waktu terlalu lama. Coba refresh halaman, lalu periksa izin notifikasi browser.`,
                        ),
                    ),
                15_000,
            );
        }),
    ]);

const firebaseApp = () =>
    getApps().length > 0 ? getApp() : initializeApp(config);

let stopForegroundListener: (() => void) | null = null;

const waitUntilActive = async (
    registration: ServiceWorkerRegistration,
): Promise<ServiceWorkerRegistration> => {
    if (registration.active) return registration;

    const worker = registration.installing ?? registration.waiting;
    if (!worker) {
        throw new Error('Service worker notifikasi tidak dapat diaktifkan.');
    }

    return new Promise((resolve, reject) => {
        worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') resolve(registration);
            if (worker.state === 'redundant') {
                reject(
                    new Error('Service worker notifikasi gagal diaktifkan.'),
                );
            }
        });
    });
};

export async function enableAttendancePush(): Promise<string> {
    if (!(await isSupported()) || !import.meta.env.VITE_FCM_VAPID_KEY) {
        throw new Error(
            'Notifikasi browser tidak didukung atau belum dikonfigurasi.',
        );
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted')
        throw new Error('Izin notifikasi belum diberikan.');
    const firebaseRegistration = await withTimeout(
        navigator.serviceWorker.register('/firebase-messaging-worker', {
            scope: '/firebase-cloud-messaging-push-scope/',
            updateViaCache: 'none',
        }),
        'Registrasi service worker',
    );
    const registration = await withTimeout(
        waitUntilActive(firebaseRegistration),
        'Aktivasi service worker',
    );
    const messaging = getMessaging(firebaseApp());
    const token = await withTimeout(
        getToken(messaging, {
            vapidKey: import.meta.env.VITE_FCM_VAPID_KEY,
            serviceWorkerRegistration: registration,
        }),
        'Pengambilan token notifikasi',
    );
    if (!token) throw new Error('Token notifikasi belum tersedia.');

    stopForegroundListener?.();
    stopForegroundListener = onMessage(messaging, (payload) => {
        void registration.showNotification(
            payload.notification?.title ?? 'Humi',
            {
                body: payload.notification?.body ?? 'Ada pengingat baru.',
                icon: '/icons/icon-192.png',
                data: { url: payload.data?.url ?? '/portal/attendance' },
            },
        );
    });

    return token;
}
