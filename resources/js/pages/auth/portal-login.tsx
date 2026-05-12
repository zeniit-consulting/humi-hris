import { Head, Link, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';

type Props = {
    status?: string;
    otpSentTo?: string | null;
};

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

export default function PortalLogin({ status, otpSentTo }: Props) {
    const sendForm = useForm({
        phone: otpSentTo ?? '',
    });
    const verifyForm = useForm({
        otp: '',
    });

    const otpRequested = status === 'otp-sent' || Boolean(otpSentTo);
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

        if (!dismissedRecently) {
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
        }
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

    return (
        <>
            <Head title="Portal Karyawan">
                <meta name="theme-color" content="#006069" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
                <meta name="apple-mobile-web-app-title" content="Humi" />
                <meta name="application-name" content="Humi" />
                <link rel="manifest" href="/manifest.webmanifest" />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
            </Head>

            <main className="relative min-h-svh overflow-hidden bg-[#006069] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_92%_8%,rgba(181,232,223,0.2),transparent_24%),linear-gradient(155deg,#006069_0%,#004951_52%,#002f36_100%)]" />
                <div className="absolute -top-28 right-[-90px] h-72 w-72 rounded-full border border-white/15" />
                <div className="absolute bottom-[-150px] left-[-120px] h-96 w-96 rounded-full bg-white/10 blur-3xl" />

                <div className="relative mx-auto flex min-h-svh w-full max-w-md flex-col px-6 py-8">
                    <div className="flex flex-1 flex-col justify-center">
                        <div className="mb-9">
                            <img
                                src="/icons/icon-192.png"
                                alt="Humi"
                                className="mb-6 size-16 rounded-2xl border border-white/25 bg-white/95 p-2 shadow-[0_18px_48px_rgba(0,0,0,0.2)]"
                            />
                            <p className="mb-3 text-xs font-semibold tracking-[0.32em] text-white/65 uppercase">
                                Portal Karyawan
                            </p>
                            <h1 className="max-w-sm text-4xl font-black tracking-[-0.07em] text-white">
                                Masuk cepat dengan OTP WhatsApp.
                            </h1>
                            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
                                Gunakan nomor WhatsApp terdaftar untuk mengakses
                                absensi, cuti, lembur, dan payroll karyawan.
                            </p>
                        </div>

                        <section className="rounded-[28px] border border-white/18 bg-white/[0.12] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    sendForm.post('/portal/login/send-otp');
                                }}
                                className="space-y-4"
                            >
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="phone"
                                        className="text-sm font-semibold text-white"
                                    >
                                        Nomor WhatsApp
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        inputMode="tel"
                                        autoFocus={!otpRequested}
                                        value={sendForm.data.phone}
                                        onChange={(event) =>
                                            sendForm.setData(
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="081234567890"
                                        className="h-12 border-white/20 bg-white text-slate-950 placeholder:text-slate-400"
                                    />
                                    <InputError
                                        className="text-red-100"
                                        message={sendForm.errors.phone}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="h-12 w-full rounded-xl bg-white font-bold text-[#006069] shadow-[0_16px_36px_rgba(0,0,0,0.18)] hover:bg-white/90"
                                    disabled={sendForm.processing}
                                >
                                    {sendForm.processing && <Spinner />}
                                    {otpRequested
                                        ? 'Kirim ulang OTP'
                                        : 'Kirim OTP'}
                                </Button>
                            </form>

                            {otpRequested ? (
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        verifyForm.post(
                                            '/portal/login/verify-otp',
                                        );
                                    }}
                                    className="mt-5 space-y-4 rounded-2xl border border-white/14 bg-white/[0.08] p-4"
                                >
                                    <div className="space-y-3">
                                        <Label
                                            htmlFor="otp"
                                            className="text-sm font-semibold text-white"
                                        >
                                            Kode OTP
                                        </Label>
                                        <InputOTP
                                            id="otp"
                                            maxLength={6}
                                            value={verifyForm.data.otp}
                                            onChange={(value) =>
                                                verifyForm.setData('otp', value)
                                            }
                                            containerClassName="justify-center"
                                            autoFocus
                                        >
                                            <InputOTPGroup className="gap-1">
                                                <InputOTPSlot
                                                    index={0}
                                                    className="border-white/25 bg-white text-slate-950"
                                                />
                                                <InputOTPSlot
                                                    index={1}
                                                    className="border-white/25 bg-white text-slate-950"
                                                />
                                                <InputOTPSlot
                                                    index={2}
                                                    className="border-white/25 bg-white text-slate-950"
                                                />
                                                <InputOTPSlot
                                                    index={3}
                                                    className="border-white/25 bg-white text-slate-950"
                                                />
                                                <InputOTPSlot
                                                    index={4}
                                                    className="border-white/25 bg-white text-slate-950"
                                                />
                                                <InputOTPSlot
                                                    index={5}
                                                    className="border-white/25 bg-white text-slate-950"
                                                />
                                            </InputOTPGroup>
                                        </InputOTP>
                                        <InputError
                                            className="text-red-100"
                                            message={verifyForm.errors.otp}
                                        />
                                        <p className="text-sm text-white/70">
                                            OTP dikirim ke{' '}
                                            {otpSentTo ?? sendForm.data.phone}.
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-12 w-full rounded-xl bg-[#b8fff1] font-bold text-[#003f46] hover:bg-[#d7fff8]"
                                        disabled={verifyForm.processing}
                                    >
                                        {verifyForm.processing && <Spinner />}
                                        Masuk ke portal
                                    </Button>
                                </form>
                            ) : null}
                        </section>

                        <div className="mt-6 text-center text-sm text-white/70">
                            Login admin atau staf internal?{' '}
                            <Link
                                href={login()}
                                className="font-semibold text-white underline decoration-white/35 underline-offset-4 transition hover:decoration-white"
                            >
                                Gunakan login utama
                            </Link>
                        </div>
                    </div>
                </div>

                {showInstallPopup ? (
                    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-4 pb-4">
                        <div className="rounded-[24px] border border-white/20 bg-white p-4 text-slate-950 shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
                            <div className="flex items-start gap-3">
                                <img
                                    src="/icons/icon-192.png"
                                    alt="Humi"
                                    className="size-12 rounded-2xl border border-slate-200 bg-white p-1"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-950">
                                        Install Portal Karyawan
                                    </p>
                                    <p className="mt-1 text-sm leading-5 text-slate-600">
                                        Buka portal lebih cepat dari home screen
                                        untuk absensi, cuti, dan payroll.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={dismissInstallPopup}
                                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                                    aria-label="Tutup popup install PWA"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            {installPrompt ? (
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-11 rounded-xl"
                                        onClick={dismissInstallPopup}
                                    >
                                        Nanti saja
                                    </Button>
                                    <Button
                                        type="button"
                                        className="h-11 rounded-xl bg-[#006069] text-white hover:bg-[#00545c]"
                                        onClick={handleInstallPwa}
                                    >
                                        Install
                                    </Button>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                                    Jika tombol install tidak muncul, gunakan
                                    menu browser lalu pilih{' '}
                                    <span className="font-semibold">
                                        Add to Home Screen
                                    </span>
                                    .
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </main>
        </>
    );
}
