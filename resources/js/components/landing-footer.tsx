import { Link } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

type LandingFooterProps = {
    hasUser?: boolean;
    trialHref?: string;
};

export function LandingFooter({
    hasUser = false,
    trialHref,
}: LandingFooterProps) {
    const defaultTrialHref = hasUser ? dashboard().url : register().url;
    const resolvedTrialHref = trialHref ?? defaultTrialHref;
    const trialLabel = hasUser ? 'Buka Dashboard' : 'Mulai Trial Gratis';

    return (
        <footer className="bg-[var(--landing-color-ink)] px-5 py-14 text-[var(--landing-color-paper)] sm:px-8 sm:py-20">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[var(--landing-color-accent)] uppercase">
                            <span
                                className="size-2 rounded-full bg-[var(--landing-color-accent)]"
                                aria-hidden="true"
                            />
                            Humi HRIS
                        </span>
                        <p className="mt-6 max-w-[16ch] text-3xl font-semibold tracking-tight [overflow-wrap:anywhere] text-[var(--landing-color-paper)] sm:text-5xl md:text-6xl md:leading-[1.05]">
                            Data yang sama. Keputusan yang lebih mudah.
                        </p>
                        <p className="mt-6 max-w-[36ch] text-sm leading-6 text-[var(--landing-color-paper)]/70">
                            Satukan operasi HR harian dalam satu sistem yang
                            rapi, mudah ditelusuri, dan siap digunakan tim.
                        </p>
                    </div>

                    <nav
                        aria-label="Tautan footer"
                        className="grid min-w-0 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3"
                    >
                        <div className="min-w-0">
                            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--landing-color-accent)] uppercase">
                                Produk
                            </p>
                            <div className="mt-5 grid gap-3 text-sm font-medium text-[var(--landing-color-paper)]">
                                <Link
                                    href="/#product"
                                    className="whitespace-nowrap transition-colors hover:text-[var(--landing-color-accent)]"
                                >
                                    Produk
                                </Link>
                                <Link
                                    href="/features"
                                    className="whitespace-nowrap transition-colors hover:text-[var(--landing-color-accent)]"
                                >
                                    Fitur
                                </Link>
                                <Link
                                    href="/#pricing"
                                    className="whitespace-nowrap transition-colors hover:text-[var(--landing-color-accent)]"
                                >
                                    Harga
                                </Link>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--landing-color-accent)] uppercase">
                                Jelajahi
                            </p>
                            <div className="mt-5 grid gap-3 text-sm font-medium text-[var(--landing-color-paper)]">
                                <Link
                                    href="/#solutions"
                                    className="whitespace-nowrap transition-colors hover:text-[var(--landing-color-accent)]"
                                >
                                    Solusi
                                </Link>
                                <Link
                                    href="/berita"
                                    className="whitespace-nowrap transition-colors hover:text-[var(--landing-color-accent)]"
                                >
                                    Berita
                                </Link>
                                <Link
                                    href="/careers"
                                    className="whitespace-nowrap transition-colors hover:text-[var(--landing-color-accent)]"
                                >
                                    Karier
                                </Link>
                            </div>
                        </div>
                        <div className="col-span-2 min-w-0 sm:col-span-1">
                            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--landing-color-accent)] uppercase">
                                Mulai
                            </p>
                            <div className="mt-5 grid gap-3 text-sm font-medium text-[var(--landing-color-paper)]">
                                <Link
                                    href={resolvedTrialHref}
                                    className="whitespace-nowrap transition-colors hover:text-[var(--landing-color-accent)]"
                                >
                                    {trialLabel}
                                </Link>
                                <Link
                                    href="/contact"
                                    className="whitespace-nowrap transition-colors hover:text-[var(--landing-color-accent)]"
                                >
                                    Kontak kami
                                </Link>
                                {!hasUser ? (
                                    <Link
                                        href={login()}
                                        className="whitespace-nowrap transition-colors hover:text-[var(--landing-color-accent)]"
                                    >
                                        Masuk
                                    </Link>
                                ) : null}
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="mt-14 flex flex-col gap-6 border-t border-[var(--landing-color-paper)]/15 pt-6 sm:flex-row sm:items-end sm:justify-between">
                    <Link
                        href="/"
                        aria-label="Humi — halaman utama"
                        className="inline-flex size-14 items-center justify-center rounded-[var(--landing-radius-card)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-color-focus)]"
                    >
                        <img
                            src="/humi-mark-footer.png"
                            width={64}
                            height={64}
                            className="size-14 object-contain"
                            alt="Humi"
                        />
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-[var(--landing-color-paper)]/70">
                        <span className="whitespace-nowrap">
                            © {new Date().getFullYear()} Humi
                        </span>
                        <span className="whitespace-nowrap">
                            HR lebih rapi, tim lebih siap.
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
