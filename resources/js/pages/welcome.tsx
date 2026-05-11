import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarClock,
    ChartColumn,
    CheckCircle2,
    CircleDollarSign,
    Clock,
    Fingerprint,
    NotebookPen,
    Shield,
    Sparkles,
    Users,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';

const modules = [
    {
        icon: NotebookPen,
        title: 'Rekrutmen Terpadu',
        description:
            'Kelola lowongan, tahapan seleksi, dan kandidat dalam satu alur yang terstruktur.',
    },
    {
        icon: Users,
        title: 'Data Karyawan',
        description:
            'Database personal, jabatan, dokumen, dan riwayat kerja terpusat dalam satu dashboard.',
    },
    {
        icon: CalendarClock,
        title: 'Absensi Real-time',
        description:
            'Kehadiran, lembur, cuti, dan jadwal shift terpantau real-time dari web maupun mobile.',
    },
    {
        icon: CircleDollarSign,
        title: 'Payroll Otomatis',
        description:
            'Generate payroll otomatis dengan komponen gaji, kasbon, denda, dan tunjangan fleksibel.',
    },
    {
        icon: ChartColumn,
        title: 'Analitik SDM',
        description:
            'Tren produktivitas, turnover, dan efektivitas tenaga kerja dalam visualisasi yang intuitif.',
    },
    {
        icon: Fingerprint,
        title: 'Approval Berlapis',
        description:
            'Workflow approval lintas jabatan dengan SLA dan notifikasi otomatis tanpa bottleneck.',
    },
];

const stats = [
    { label: 'Efisiensi proses HR', value: '70%' },
    { label: 'Waktu proses payroll', value: '< 10 mnt' },
    { label: 'Akurasi data', value: '99.9%' },
];

const benefits = [
    'Implementasi cepat tanpa perlu training lama',
    'Mendukung struktur multi divisi dan jabatan bertingkat',
    'Mengurangi kesalahan manual pada perhitungan payroll',
    'Akses berbasis role dengan audit log lengkap',
];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Humi - HR Information System">
                <meta
                    name="description"
                    content="Humi adalah platform HRIS terpadu untuk kelola karyawan, absensi, cuti, dan payroll dengan workflow yang sederhana."
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-screen bg-white text-slate-900"
                style={{
                    fontFamily:
                        'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
                }}
            >
                {/* Header */}
                <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="Humi"
                                className="h-8 w-auto"
                            />
                        </Link>

                        <nav className="hidden items-center gap-1 md:flex">
                            <a
                                href="#features"
                                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                            >
                                Fitur
                            </a>
                            <a
                                href="#benefits"
                                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                            >
                                Keunggulan
                            </a>
                            <a
                                href="#pricing"
                                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                            >
                                Harga
                            </a>
                        </nav>

                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#0d4d52] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0a3e42]"
                                >
                                    Dashboard
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:text-[#14a8b0] sm:inline-flex"
                                    >
                                        Masuk
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-[#0d4d52] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0a3e42]"
                                        >
                                            Coba Gratis
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main>
                    {/* Hero Section */}
                    <section className="relative overflow-hidden">
                        <div className="absolute inset-0 -z-10">
                            <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#14a8b0]/10 to-transparent blur-3xl" />
                        </div>

                        <div className="mx-auto max-w-6xl px-6 pt-20 pb-20 text-center md:pt-28">
                            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                <Sparkles className="h-3 w-3 text-[#14a8b0]" />
                                Platform HRIS untuk bisnis modern
                            </div>

                            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
                                Kelola tim Anda{' '}
                                <span className="text-[#14a8b0]">
                                    dengan lebih sederhana
                                </span>
                            </h1>

                            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                                Humi adalah HRIS terpadu untuk perusahaan
                                modern. Otomatisasi absensi, cuti, payroll, dan
                                approval dalam satu platform yang mudah
                                digunakan.
                            </p>

                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Link
                                    href={auth.user ? dashboard() : login()}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0d4d52] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3e42] sm:w-auto"
                                >
                                    {auth.user
                                        ? 'Buka Dashboard'
                                        : 'Mulai Sekarang'}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <a
                                    href="#features"
                                    className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 sm:w-auto"
                                >
                                    Lihat Fitur
                                </a>
                            </div>

                            {/* Stats */}
                            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 border-t border-slate-100 pt-10">
                                {stats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="text-center"
                                    >
                                        <p className="text-2xl font-bold text-[#0d4d52] md:text-3xl">
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 md:text-sm">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section
                        id="features"
                        className="border-t border-slate-100 bg-slate-50/50 py-20"
                    >
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="mx-auto max-w-2xl text-center">
                                <p className="text-xs font-semibold tracking-[0.12em] text-[#14a8b0] uppercase">
                                    Fitur Utama
                                </p>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                                    Semua yang Anda butuhkan untuk HR
                                </h2>
                                <p className="mt-4 text-base text-slate-600">
                                    Modul lengkap dari rekrutmen hingga payroll
                                    dalam satu platform terintegrasi.
                                </p>
                            </div>

                            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
                                {modules.map((module) => (
                                    <article
                                        key={module.title}
                                        className="bg-white p-8 transition hover:bg-slate-50"
                                    >
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#14a8b0]/10 text-[#0d4d52]">
                                            <module.icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="mt-5 text-lg font-semibold text-slate-900">
                                            {module.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                            {module.description}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Benefits Section */}
                    <section id="benefits" className="py-20">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="grid items-center gap-12 lg:grid-cols-2">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.12em] text-[#14a8b0] uppercase">
                                        Mengapa Humi
                                    </p>
                                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                                        Dirancang untuk tim modern yang ingin
                                        bergerak cepat
                                    </h2>
                                    <p className="mt-4 text-base leading-relaxed text-slate-600">
                                        Humi membantu tim HR mengurangi
                                        pekerjaan manual sehingga fokus pada
                                        strategi pengembangan SDM yang lebih
                                        bernilai.
                                    </p>

                                    <div className="mt-8 space-y-3">
                                        {benefits.map((benefit) => (
                                            <div
                                                key={benefit}
                                                className="flex items-start gap-3"
                                            >
                                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#14a8b0]" />
                                                <span className="text-sm text-slate-700">
                                                    {benefit}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-[#14a8b0]/10" />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        Dashboard Karyawan
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Hari ini, 09:30
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                Active
                                            </span>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            <div className="rounded-xl bg-slate-50 p-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-slate-600">
                                                        Total Karyawan
                                                    </p>
                                                    <Users className="h-3.5 w-3.5 text-[#14a8b0]" />
                                                </div>
                                                <p className="mt-1 text-xl font-bold text-slate-900">
                                                    248
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="rounded-xl bg-slate-50 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-slate-600">
                                                            Hadir
                                                        </p>
                                                        <Clock className="h-3.5 w-3.5 text-emerald-600" />
                                                    </div>
                                                    <p className="mt-1 text-lg font-bold text-slate-900">
                                                        232
                                                    </p>
                                                </div>
                                                <div className="rounded-xl bg-slate-50 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-slate-600">
                                                            Cuti
                                                        </p>
                                                        <CalendarClock className="h-3.5 w-3.5 text-amber-600" />
                                                    </div>
                                                    <p className="mt-1 text-lg font-bold text-slate-900">
                                                        12
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="rounded-xl bg-gradient-to-br from-[#0d4d52] to-[#14a8b0] p-4 text-white">
                                                <p className="text-xs tracking-wider uppercase opacity-80">
                                                    Payroll Bulan Ini
                                                </p>
                                                <p className="mt-1 text-xl font-bold">
                                                    Rp 1.2M
                                                </p>
                                                <p className="mt-1 text-xs opacity-80">
                                                    Siap diproses
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute -top-4 -right-4 -z-10 h-full w-full rounded-2xl bg-[#14a8b0]/10" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Security & Trust Section */}
                    <section className="border-t border-slate-100 bg-slate-50/50 py-16">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="grid gap-8 md:grid-cols-3">
                                <div>
                                    <Shield className="h-6 w-6 text-[#14a8b0]" />
                                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                                        Keamanan Tinggi
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Akses berbasis role, enkripsi data, dan
                                        audit log untuk menjaga keamanan
                                        informasi karyawan.
                                    </p>
                                </div>
                                <div>
                                    <Clock className="h-6 w-6 text-[#14a8b0]" />
                                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                                        Setup Cepat
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Implementasi dalam hitungan hari, tim HR
                                        bisa langsung onboarding karyawan baru.
                                    </p>
                                </div>
                                <div>
                                    <Sparkles className="h-6 w-6 text-[#14a8b0]" />
                                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                                        Selalu Update
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Fitur baru dan peningkatan keamanan
                                        rutin tanpa downtime di sisi pengguna.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section id="pricing" className="py-20">
                        <div className="mx-auto max-w-4xl px-6">
                            <div className="rounded-3xl bg-gradient-to-br from-[#0d4d52] to-[#14a8b0] px-8 py-12 text-center text-white md:px-12 md:py-16">
                                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                                    Siap mengelola HR dengan lebih baik?
                                </h2>
                                <p className="mx-auto mt-4 max-w-xl text-base opacity-90">
                                    Mulai gratis hari ini. Tidak perlu kartu
                                    kredit, setup dalam hitungan menit.
                                </p>

                                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <Link
                                        href={
                                            auth.user
                                                ? dashboard()
                                                : canRegister
                                                  ? register()
                                                  : login()
                                        }
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0d4d52] transition hover:bg-slate-100 sm:w-auto"
                                    >
                                        {auth.user
                                            ? 'Lanjut ke Dashboard'
                                            : 'Coba Gratis Sekarang'}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    {!auth.user && (
                                        <Link
                                            href={login()}
                                            className="inline-flex w-full items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
                                        >
                                            Sudah punya akun? Masuk
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-100">
                    <div className="mx-auto max-w-6xl px-6 py-10">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <img
                                    src="/logo.png"
                                    alt="Humi"
                                    className="h-7 w-auto"
                                />
                            </div>

                            <p className="text-xs text-slate-500">
                                &copy; {new Date().getFullYear()} Humi. All
                                rights reserved.
                            </p>

                            <div className="flex gap-4 text-xs text-slate-500">
                                <a
                                    href="#"
                                    className="transition hover:text-slate-900"
                                >
                                    Privacy
                                </a>
                                <a
                                    href="#"
                                    className="transition hover:text-slate-900"
                                >
                                    Terms
                                </a>
                                <a
                                    href="#"
                                    className="transition hover:text-slate-900"
                                >
                                    Contact
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
