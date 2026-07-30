import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { login } from '@/routes';

export const landingPrimaryActionClass =
    'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--landing-radius-control)] bg-[var(--landing-color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--landing-color-accent-ink)] transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none';

export const landingSecondaryActionClass =
    'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--landing-radius-control)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--landing-color-ink)] transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none';

export function LandingNav({
    hasUser,
    trialHref,
}: {
    hasUser: boolean;
    trialHref: string;
}) {
    return (
        <header className="fixed inset-x-0 top-0 z-[var(--landing-z-sticky)] border-b border-[var(--landing-color-rule)] bg-[color-mix(in_oklch,var(--landing-color-paper)_94%,transparent)] backdrop-blur-xl backdrop-saturate-125">
            <nav
                aria-label="Navigasi utama"
                className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8"
            >
                <Link
                    href="/"
                    aria-label="Humi — halaman utama"
                    className="flex h-11 w-[7.625rem] shrink-0 items-center justify-center rounded-[var(--landing-radius-control)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)]"
                >
                    <img
                        src="/humi-wordmark.png"
                        width={122}
                        height={32}
                        className="h-8 w-full object-contain"
                        alt="Humi"
                    />
                </Link>

                <div className="hidden items-center lg:flex">
                    {[
                        ['Produk', '#product'],
                        ['Solusi', '#solutions'],
                        ['Harga', '#pricing'],
                        ['Berita', '/berita'],
                    ].map(([label, href]) => (
                        <Link
                            key={href}
                            href={href}
                            className="inline-flex min-h-11 items-center rounded-[var(--landing-radius-control)] px-3 text-sm font-medium whitespace-nowrap text-[var(--landing-color-ink-soft)] hover:text-[var(--landing-color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)]"
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="landing-nav-actions flex shrink-0 items-center gap-2">
                    {!hasUser ? (
                        <Link
                            href={login()}
                            className="inline-flex min-h-11 items-center rounded-[var(--landing-radius-control)] px-3 text-sm font-medium whitespace-nowrap text-[var(--landing-color-ink-soft)] hover:text-[var(--landing-color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)]"
                        >
                            Masuk
                        </Link>
                    ) : null}

                    <Link
                        href={trialHref}
                        className={landingPrimaryActionClass}
                    >
                        <span className="sm:hidden">
                            {hasUser ? 'Dashboard' : 'Mulai Trial'}
                        </span>
                        <span className="hidden sm:inline">
                            {hasUser ? 'Buka Dashboard' : 'Mulai Trial Gratis'}
                        </span>
                        <ArrowRight
                            className="size-4 shrink-0"
                            aria-hidden="true"
                        />
                    </Link>
                </div>
            </nav>
        </header>
    );
}
