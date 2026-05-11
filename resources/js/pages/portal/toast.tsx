import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PortalToastPayload, PortalToastType } from './lib';

type PortalToastItem = PortalToastPayload & {
    id: number;
    leaving: boolean;
};

const TOAST_TIMEOUT = 3600;

const toneClass: Record<PortalToastType, string> = {
    success: 'border-[#b9dfe0] bg-[#f3fbfb] text-[#006069]',
    error: 'border-rose-200 bg-rose-50 text-rose-900',
    info: 'border-slate-200 bg-white text-slate-900',
};

const ToastIcon = ({ type }: { type: PortalToastType }) => {
    if (type === 'success') {
        return <CircleCheck className="mt-0.5 size-4 shrink-0" />;
    }

    if (type === 'error') {
        return <CircleAlert className="mt-0.5 size-4 shrink-0" />;
    }

    return <Info className="mt-0.5 size-4 shrink-0" />;
};

export function PortalToastViewport() {
    const [toasts, setToasts] = useState<PortalToastItem[]>([]);
    const seenRef = useRef<Record<string, number>>({});

    useEffect(() => {
        const pushToast = (payload: PortalToastPayload) => {
            const normalizedMessage = payload.message.trim();

            if (normalizedMessage === '') {
                return;
            }

            const key = `${payload.type}:${normalizedMessage}`;
            const now = Date.now();
            const lastAt = seenRef.current[key];

            if (lastAt && now - lastAt < 1200) {
                return;
            }

            seenRef.current[key] = now;

            const id = now + Math.floor(Math.random() * 1000);
            setToasts((current) => [
                ...current,
                {
                    id,
                    type: payload.type,
                    message: normalizedMessage,
                    leaving: false,
                },
            ]);

            window.setTimeout(() => {
                setToasts((current) =>
                    current.map((toast) =>
                        toast.id === id ? { ...toast, leaving: true } : toast,
                    ),
                );

                window.setTimeout(() => {
                    setToasts((current) =>
                        current.filter((toast) => toast.id !== id),
                    );
                }, 220);
            }, TOAST_TIMEOUT);
        };

        const handleToast = (event: Event) => {
            const payload = (event as CustomEvent<PortalToastPayload>).detail;

            if (!payload) {
                return;
            }

            pushToast(payload);
        };

        const handleOffline = () => {
            pushToast({
                type: 'error',
                message:
                    'Anda sedang offline. Data yang tersedia berasal dari cache.',
            });
        };

        const handleOnline = () => {
            pushToast({
                type: 'success',
                message: 'Koneksi tersambung kembali.',
            });
        };

        window.addEventListener('portal-toast', handleToast);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('portal-toast', handleToast);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed top-4 left-1/2 z-[90] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:max-w-md">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-start gap-2 rounded-[10px] border px-4 py-3 text-sm shadow-[0_12px_32px_rgba(15,23,42,0.14)] transition-all duration-200 ${
                        toneClass[toast.type]
                    } ${
                        toast.leaving
                            ? '-translate-y-2 opacity-0'
                            : 'translate-y-0 opacity-100'
                    }`}
                >
                    <ToastIcon type={toast.type} />
                    <p className="leading-5">{toast.message}</p>
                </div>
            ))}
        </div>
    );
}
