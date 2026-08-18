import { Link } from '@inertiajs/react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { login } from '@/routes';

export const landingPrimaryActionClass =
    'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--landing-radius-control)] bg-[var(--landing-color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--landing-color-accent-ink)] transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none';

export const landingSecondaryActionClass =
    'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--landing-radius-control)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--landing-color-ink)] transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none';

const navLinks = [
    { label: 'Produk', href: '/#product' },
    { label: 'Solusi', href: '/#solutions' },
    { label: 'Fitur', href: '/features' },
    { label: 'Harga', href: '/#pricing' },
    { label: 'Berita', href: '/berita' },
    { label: 'Kontak', href: '/contact' },
];

export function LandingNav({
    hasUser,
    trialHref,
}: {
    hasUser: boolean;
    trialHref: string;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                    {navLinks.map(({ label, href }) => (
                        <Link
                            key={href}
                            href={href}
                            className="inline-flex min-h-11 items-center rounded-[var(--landing-radius-control)] px-3 text-sm font-medium whitespace-nowrap text-[var(--landing-color-ink-soft)] transition-colors hover:text-[var(--landing-color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)]"
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="landing-nav-actions flex shrink-0 items-center gap-2">
                    {!hasUser ? (
                        <Link
                            href={login()}
                            className="hidden min-h-11 items-center rounded-[var(--landing-radius-control)] px-3 text-sm font-medium whitespace-nowrap text-[var(--landing-color-ink-soft)] transition-colors hover:text-[var(--landing-color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] sm:inline-flex"
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

                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-expanded={isMobileMenuOpen}
                        aria-label={
                            isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'
                        }
                        className="inline-flex size-11 items-center justify-center rounded-[var(--landing-radius-control)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] text-[var(--landing-color-ink)] transition-colors hover:bg-[var(--landing-color-surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] lg:hidden"
                    >
                        {isMobileMenuOpen ? (
                            <X className="size-5" />
                        ) : (
                            <Menu className="size-5" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div
                    id="mobile-nav-menu"
                    className="border-t border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] px-5 py-6 shadow-[var(--landing-shadow-panel)] sm:px-8 lg:hidden"
                >
                    <div className="grid gap-2">
                        {navLinks.map(({ label, href }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex min-h-12 items-center rounded-[var(--landing-radius-card)] px-4 text-base font-medium text-[var(--landing-color-ink)] transition-colors hover:bg-[var(--landing-color-surface-soft)]"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 border-t border-[var(--landing-color-rule)] pt-6">
                        {!hasUser ? (
                            <Link
                                href={login()}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={landingSecondaryActionClass}
                            >
                                Masuk ke Akun
                            </Link>
                        ) : null}

                        <Link
                            href={trialHref}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={landingPrimaryActionClass}
                        >
                            {hasUser ? 'Buka Dashboard' : 'Mulai Trial Gratis'}
                            <ArrowRight className="size-4 shrink-0" />
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
