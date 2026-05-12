import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';
import type { PortalLinkMap } from './lib';
import { PortalNavbar } from './navbar';
import { PortalToastViewport } from './toast';

type PortalShellProps = PropsWithChildren<{
    title: string;
    eyebrow: string;
    description?: string;
    active: 'home' | 'attendance' | 'payroll' | 'profile';
    links: PortalLinkMap;
    headerAction?: ReactNode;
    hideNavbar?: boolean;
}>;

export function PortalShell({
    children,
    title,
    active,
    links,
    headerAction,
    hideNavbar = false,
}: PortalShellProps) {
    return (
        <>
            <Head title={title}>
                <meta name="theme-color" content="#006069" />
                <link rel="manifest" href="/manifest.webmanifest" />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
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
                <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white px-4 pt-4 pb-28 sm:max-w-lg">
                    <header className="-mx-4 mb-4 border-b border-stone-200 bg-white px-4 pb-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (window.history.length > 1) {
                                            window.history.back();
                                            return;
                                        }

                                        window.location.href = '/portal';
                                    }}
                                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-900"
                                    aria-label="Kembali"
                                >
                                    <ArrowLeft className="size-4" />
                                </button>
                                <h1 className="truncate text-xl font-extrabold tracking-[-0.04em] text-slate-950">
                                    {title}
                                </h1>
                            </div>
                            {headerAction ? <div>{headerAction}</div> : null}
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
