import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';
import type { PortalLinkMap } from './lib';
import { PortalNavbar } from './navbar';
import { PortalToastViewport } from './toast';

// Hallmark · component: portal header · genre: modern-minimal · theme: Quiet
// Hallmark · contrast: pass (46–50) · interaction: direct press + visible focus
// Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4

type PortalShellProps = PropsWithChildren<{
    title: string;
    eyebrow: string;
    description?: string;
    active: 'home' | 'attendance' | 'activity' | 'payroll' | 'profile' | 'approvals';
    links: PortalLinkMap;
    headerAction?: ReactNode;
    hideNavbar?: boolean;
    fullBleed?: boolean;
}>;

export function PortalShell({
    children,
    title,
    active,
    links,
    headerAction,
    hideNavbar = false,
    fullBleed = false,
}: PortalShellProps) {
    return (
        <>
            <Head title={title}>
                <meta name="theme-color" content="#006069" />
                <meta
                    name="theme-color"
                    content="#006069"
                    media="(prefers-color-scheme: light)"
                />
                <meta
                    name="theme-color"
                    content="#006069"
                    media="(prefers-color-scheme: dark)"
                />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
                <meta name="apple-mobile-web-app-title" content="Humi" />
                <link rel="manifest" href="/manifest.webmanifest" />
                <link
                    rel="apple-touch-icon"
                    href="/icons/apple-touch-icon.png"
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-white text-slate-900">
                <PortalToastViewport />
                <div
                    className={`mx-auto flex min-h-screen w-full flex-col bg-white px-4 pt-4 ${
                        fullBleed
                            ? 'max-w-none pb-0'
                            : 'max-w-md pb-28 sm:max-w-lg'
                    }`}
                >
                    <header className="-mx-4 mb-4 border-b border-stone-200 bg-white px-4 pb-4">
                        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                            <div className="min-w-0 justify-self-start">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (window.history.length > 1) {
                                            window.history.back();
                                            return;
                                        }

                                        window.location.href = '/portal';
                                    }}
                                    className="portal-pressable portal-focus-ring inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-900 disabled:cursor-not-allowed disabled:opacity-55"
                                    aria-label="Kembali"
                                >
                                    <ArrowLeft className="size-4" />
                                </button>
                            </div>
                            <h1 className="max-w-[calc(100vw-10rem)] justify-self-center truncate text-center text-xl font-extrabold tracking-[-0.04em] text-slate-950">
                                {title}
                            </h1>
                            <div className="min-w-0 justify-self-end">
                                {headerAction}
                            </div>
                        </div>
                    </header>

                    <main className="flex-1">{children}</main>

                    {hideNavbar ? null : (
                        <PortalNavbar active={active} links={links} />
                    )}
                </div>
            </div>
        </>
    );
}
