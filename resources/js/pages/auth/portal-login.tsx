import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Download, ShieldCheck, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import SeoHead from '@/components/seo-head';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
};

const isPwaStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean })
            .standalone === true);

export default function PortalLogin() {
    const form = useForm({
        employee_code: '',
        phone: '',
    });
    const [installPrompt, setInstallPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPopup, setShowInstallPopup] = useState(false);

    useEffect(() => {
        if (isPwaStandalone()) {
            return;
        }

        const dismissedAt = Number(
            window.localStorage.getItem('portal-pwa-install-dismissed-at') ?? 0,
        );
        const dismissedRecently =
            dismissedAt > 0 && Date.now() - dismissedAt < 24 * 60 * 60 * 1000;

        if (dismissedRecently) {
            return;
        }

        const fallbackTimer = window.setTimeout(() => {
            setShowInstallPopup(true);
        }, 1200);

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            window.clearTimeout(fallbackTimer);
            setInstallPrompt(event as BeforeInstallPromptEvent);
            setShowInstallPopup(true);
        };

        const handleAppInstalled = () => {
            window.clearTimeout(fallbackTimer);
            setShowInstallPopup(false);
            setInstallPrompt(null);
        };

        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt,
        );
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.clearTimeout(fallbackTimer);
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt,
            );
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const dismissInstallPopup = () => {
        window.localStorage.setItem(
            'portal-pwa-install-dismissed-at',
            String(Date.now()),
        );
        setShowInstallPopup(false);
    };

    const handleInstallPwa = async () => {
        if (!installPrompt) {
            return;
        }

        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;

        if (choice.outcome === 'accepted') {
            setShowInstallPopup(false);
        }

        setInstallPrompt(null);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/portal/login/authenticate');
    };

    return (
        <>
            <Head title="Portal Karyawan">
                <meta name="theme-color" content="#006069" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                />
                <meta name="apple-mobile-web-app-title" content="Humi" />
                <meta name="application-name" content="Humi" />
                <link rel="manifest" href="/manifest.webmanifest" />
                <link
                    rel="apple-touch-icon"
                    href="/icons/apple-touch-icon.png"
                />
            </Head>
            <SeoHead
                title="Portal Karyawan Humi HRIS"
                description="Login portal karyawan Humi menggunakan ID karyawan dan nomor WhatsApp terdaftar."
                canonicalPath="/portal/login"
                noIndex
            />

            <main className="portal-auth">
                <header className="portal-auth__header">
                    <Link
                        href="/portal/login"
                        className="portal-auth__brand portal-focus-ring"
                    >
                        <img
                            src="/icons/icon-192.png"
                            alt=""
                            className="portal-auth__logo"
                        />
                        <span>Humi</span>
                    </Link>
                    <span className="portal-auth__context">
                        Portal karyawan
                    </span>
                </header>

                <div className="portal-auth__layout">
                    <section
                        className="portal-auth__intro"
                        aria-labelledby="portal-title"
                    >
                        <div>
                            <p className="portal-auth__eyebrow">
                                Ruang kerja karyawan
                            </p>
                            <h1
                                id="portal-title"
                                className="portal-auth__title portal-display"
                            >
                                Masuk dan lanjutkan pekerjaan Anda.
                            </h1>
                            <p className="portal-auth__lead">
                                Gunakan identitas karyawan yang tercatat di
                                Humi.
                            </p>
                        </div>

                        <div className="portal-auth__trust">
                            <ShieldCheck aria-hidden="true" />
                            <span>Akses khusus karyawan terdaftar</span>
                        </div>
                    </section>

                    <section
                        className="portal-auth__form-panel"
                        aria-label="Form login portal karyawan"
                    >
                        <div className="portal-auth__form-heading">
                            <p className="portal-auth__eyebrow">
                                Selamat datang
                            </p>
                            <h2>Masuk ke portal</h2>
                            <p>
                                ID karyawan dan nomor WhatsApp harus sesuai
                                dengan data perusahaan.
                            </p>
                        </div>

                        <form onSubmit={submit} className="portal-auth__form">
                            <div className="portal-auth__field">
                                <Label htmlFor="employee_code">
                                    ID Karyawan
                                </Label>
                                <Input
                                    id="employee_code"
                                    name="employee_code"
                                    value={form.data.employee_code}
                                    onChange={(event) =>
                                        form.setData(
                                            'employee_code',
                                            event.target.value,
                                        )
                                    }
                                    autoComplete="username"
                                    autoCapitalize="characters"
                                    placeholder="Contoh: EMP001"
                                    autoFocus
                                    className="portal-auth__input portal-focus-ring"
                                />
                                <div
                                    className="portal-auth__error"
                                    aria-live="polite"
                                >
                                    <InputError
                                        message={form.errors.employee_code}
                                    />
                                </div>
                            </div>

                            <div className="portal-auth__field">
                                <Label htmlFor="phone">Nomor WhatsApp</Label>
                                <div className="portal-auth__input-wrap">
                                    <Smartphone aria-hidden="true" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        inputMode="tel"
                                        value={form.data.phone}
                                        onChange={(event) =>
                                            form.setData(
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="tel"
                                        placeholder="0812 3456 7890"
                                        className="portal-auth__input portal-auth__input--icon portal-focus-ring"
                                    />
                                </div>
                                <div
                                    className="portal-auth__error"
                                    aria-live="polite"
                                >
                                    <InputError message={form.errors.phone} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="portal-auth__submit portal-pressable portal-focus-ring"
                                disabled={form.processing}
                            >
                                <span>
                                    {form.processing ? 'Memeriksa...' : 'Masuk'}
                                </span>
                                {form.processing ? (
                                    <Spinner />
                                ) : (
                                    <ArrowRight aria-hidden="true" />
                                )}
                            </button>
                        </form>

                        <p className="portal-auth__admin-link">
                            Admin atau staf internal?{' '}
                            <Link href={login()} className="portal-focus-ring">
                                Gunakan login utama
                            </Link>
                        </p>
                    </section>
                </div>

                <footer className="portal-auth__footer">
                    <span>Humi - Easy HR Management</span>
                    <span>{new Date().getFullYear()}</span>
                </footer>

                {showInstallPopup ? (
                    <div className="portal-auth__install-wrap">
                        <section
                            className="portal-auth__install portal-material portal-sheet-panel"
                            aria-label="Instal Portal Karyawan"
                        >
                            <img src="/icons/icon-192.png" alt="" />
                            <div className="portal-auth__install-copy">
                                <strong>Instal Portal Karyawan</strong>
                                <span>
                                    Akses Humi langsung dari layar utama.
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={dismissInstallPopup}
                                className="portal-auth__icon-button portal-pressable portal-focus-ring"
                                aria-label="Tutup"
                            >
                                <X aria-hidden="true" />
                            </button>
                            {installPrompt ? (
                                <button
                                    type="button"
                                    className="portal-auth__install-button portal-pressable portal-focus-ring"
                                    onClick={handleInstallPwa}
                                >
                                    <Download aria-hidden="true" />
                                    Instal
                                </button>
                            ) : null}
                        </section>
                    </div>
                ) : null}
            </main>
        </>
    );
}
