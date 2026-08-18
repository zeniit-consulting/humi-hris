import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    BriefcaseBusiness,
    Building2,
    CalendarClock,
    CheckCircle2,
    CircleDollarSign,
    ClipboardCheck,
    Factory,
    FolderKanban,
    ShieldCheck,
    Store,
    Users,
} from 'lucide-react';
import {
    frontHeroSubtitleClass,
    frontHeroTealTextClass,
    frontHeroTitleClass,
} from '@/components/front-hero-typography';
import { LandingFooter } from '@/components/landing-footer';
import {
    LandingNav,
    landingPrimaryActionClass,
    landingSecondaryActionClass,
} from '@/components/landing-nav';
import SeoHead from '@/components/seo-head';
import { dashboard, register } from '@/routes';

const WHATSAPP_CONTACT_URL =
    'https://wa.me/6285710999144?text=Halo%20Humi%2C%20saya%20ingin%20konsultasi%20fitur%20HRIS.';

const featureGroups = [
    {
        icon: Users,
        title: 'Manajemen Karyawan',
        description:
            'Simpan profil, jabatan, dokumen, kontrak, dan riwayat kerja karyawan dalam satu database HR yang rapi.',
        items: ['Data personal', 'Dokumen karyawan', 'Struktur organisasi'],
    },
    {
        icon: CalendarClock,
        title: 'Absensi & Jadwal',
        description:
            'Pantau kehadiran, jadwal shift, koreksi absensi, lembur, cuti, dan izin secara real-time.',
        items: ['Absensi harian', 'Jadwal shift', 'Cuti dan lembur'],
    },
    {
        icon: CircleDollarSign,
        title: 'Payroll',
        description:
            'Hitung gaji dengan komponen dinamis seperti tunjangan, potongan, kasbon, dan denda keterlambatan.',
        items: ['Slip gaji', 'Kasbon', 'Komponen payroll'],
    },
    {
        icon: BriefcaseBusiness,
        title: 'Rekrutmen',
        description:
            'Kelola lowongan, publikasi karier, kandidat, tahapan seleksi, dan dokumen offer letter.',
        items: ['Lowongan publik', 'Pipeline kandidat', 'Dokumen rekrutmen'],
    },
    {
        icon: FolderKanban,
        title: 'Asset Management',
        description:
            'Catat aset perusahaan, pemegang aset, status penggunaan, dan riwayat pengembalian.',
        items: ['Inventaris aset', 'Penanggung jawab', 'Status aset'],
    },
    {
        icon: BarChart3,
        title: 'Performance Tracker',
        description:
            'Gabungkan KPI, OKR, review manajer, dan data kehadiran untuk membaca performa tim.',
        items: ['KPI dan OKR', 'Review manajer', 'Skor performa'],
    },
];

const workflow = [
    {
        title: 'Setup organisasi',
        description:
            'Masukkan data divisi, posisi, user, dan aturan operasional perusahaan.',
    },
    {
        title: 'Jalankan proses HR',
        description:
            'Tim menggunakan absensi, cuti, approval, payroll, dan portal karyawan setiap hari.',
    },
    {
        title: 'Pantau dan evaluasi',
        description:
            'Manajemen melihat tren kehadiran, payroll, approval, dan performa dari dashboard.',
    },
];

const industrySolutions = [
    {
        icon: Building2,
        title: 'Outsourcing',
        text: 'Sub-company, lokasi klien, manpower request, absensi lapangan, payroll, dan billing klien.',
        href: '/hris-outsourcing',
    },
    {
        icon: Store,
        title: 'Retail & F&B',
        text: 'Shift outlet, absensi, cuti, lembur, kasbon, dan payroll untuk tim cabang.',
        href: '/hris-retail-fnb',
    },
    {
        icon: Factory,
        title: 'Manufaktur Shift',
        text: 'Roster, koreksi absensi, lembur, payroll, dan KPI untuk tim produksi.',
        href: '/hris-manufaktur-shift',
    },
];

const SEO_TITLE =
    'Fitur Humi HRIS - Absensi, Payroll, Rekrutmen, dan Portal Karyawan';
const SEO_DESCRIPTION =
    'Lihat fitur Humi HRIS untuk manajemen karyawan, absensi, cuti, lembur, payroll, rekrutmen, asset management, performance tracker, dan portal karyawan.';

export default function Features() {
    const { auth } = usePage().props as {
        auth: { user?: unknown };
    };
    const hasUser = Boolean(auth.user);
    const trialHref = hasUser ? dashboard().url : register().url;
    const trialLabel = hasUser ? 'Buka Dashboard' : 'Mulai Trial Gratis';

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Humi HRIS',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: SEO_DESCRIPTION,
        featureList: featureGroups.map((feature) => feature.title),
    };

    return (
        <>
            <SeoHead
                title={SEO_TITLE}
                description={SEO_DESCRIPTION}
                keywords="fitur HRIS, aplikasi absensi karyawan, software payroll, performance tracker, rekrutmen online, portal karyawan"
                canonicalPath="/features"
                structuredData={structuredData}
            />

            <div className="min-h-screen overflow-x-clip bg-[var(--landing-color-paper)] font-[family-name:var(--landing-font-body)] text-[var(--landing-color-ink)]">
                <LandingNav hasUser={hasUser} trialHref={trialHref} />

                <main>
                    <section className="pt-28 pb-16 sm:pt-32 sm:pb-20">
                        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                            <div>
                                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-[var(--landing-color-accent)] uppercase">
                                    <span
                                        className="size-2 rounded-full bg-[var(--landing-color-accent)]"
                                        aria-hidden="true"
                                    />
                                    Fitur Humi HRIS
                                </span>
                                <h1
                                    className={`mt-4 max-w-2xl ${frontHeroTitleClass}`}
                                >
                                    Satu sistem untuk operasional HR{' '}
                                    <span className={frontHeroTealTextClass}>
                                        dari awal sampai evaluasi.
                                    </span>
                                </h1>
                                <p
                                    className={`mt-5 max-w-xl ${frontHeroSubtitleClass}`}
                                >
                                    Humi menyatukan data karyawan, absensi,
                                    cuti, lembur, payroll, rekrutmen, aset, dan
                                    performa dalam alur kerja yang mudah dipakai
                                    oleh HR, manajer, dan karyawan.
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={trialHref}
                                        className={landingPrimaryActionClass}
                                    >
                                        {trialLabel}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className={landingSecondaryActionClass}
                                    >
                                        Konsultasi Fitur
                                    </Link>
                                </div>
                            </div>

                            <div className="grid gap-3 rounded-[var(--landing-radius-panel)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-5 shadow-[var(--landing-shadow-panel)] sm:p-6">
                                {[
                                    [
                                        'Database Karyawan',
                                        'Dokumen, kontrak, dan struktur organisasi',
                                    ],
                                    [
                                        'Absensi Real-time',
                                        'Cuti, lembur, shift, dan approval terintegrasi',
                                    ],
                                    [
                                        'Payroll Otomatis',
                                        'Slip gaji digital, kasbon, dan komponen dinamis',
                                    ],
                                    [
                                        'Performance & KPI',
                                        'OKR, KPI, dan review manajer transparan',
                                    ],
                                ].map(([title, text]) => (
                                    <div
                                        key={title}
                                        className="rounded-[var(--landing-radius-card)] bg-[var(--landing-color-surface-soft)] p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--landing-color-accent)]" />
                                            <div>
                                                <p className="font-semibold text-[var(--landing-color-ink)]">
                                                    {title}
                                                </p>
                                                <p className="mt-1 text-sm text-[var(--landing-color-ink-soft)]">
                                                    {text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-[var(--landing-color-surface)] py-20 sm:py-24">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8">
                            <header className="max-w-3xl pb-12 sm:pb-16">
                                <h2 className="text-[length:var(--landing-text-display-small)] leading-tight font-semibold tracking-[-0.035em] text-[var(--landing-color-ink)]">
                                    Modul lengkap untuk setiap kebutuhan tim.
                                </h2>
                                <p className="mt-4 text-base leading-7 text-[var(--landing-color-ink-soft)]">
                                    Semua fitur saling terhubung tanpa perlu
                                    sinkronisasi data manual antar aplikasi.
                                </p>
                            </header>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {featureGroups.map((feature) => (
                                    <article
                                        key={feature.title}
                                        className="rounded-[var(--landing-radius-panel)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] p-7 shadow-xs transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px"
                                    >
                                        <div className="flex size-12 items-center justify-center rounded-[var(--landing-radius-card)] bg-[var(--landing-color-accent-soft)] text-[var(--landing-color-accent)]">
                                            <feature.icon className="size-6" />
                                        </div>
                                        <h3 className="mt-5 text-xl font-semibold text-[var(--landing-color-ink)]">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-[var(--landing-color-ink-soft)]">
                                            {feature.description}
                                        </p>
                                        <ul className="mt-5 space-y-2 border-t border-[var(--landing-color-rule)] pt-4">
                                            {feature.items.map((item) => (
                                                <li
                                                    key={item}
                                                    className="flex items-center gap-2 text-sm text-[var(--landing-color-ink-soft)]"
                                                >
                                                    <ClipboardCheck className="size-4 shrink-0 text-[var(--landing-color-accent)]" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-20 sm:py-24">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8">
                            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                                <div>
                                    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-[var(--landing-color-accent)] uppercase">
                                        Alur Kerja
                                    </span>
                                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--landing-color-ink)] sm:text-4xl">
                                        Dibangun untuk pekerjaan HR harian.
                                    </h2>
                                    <p className="mt-4 text-base leading-7 text-[var(--landing-color-ink-soft)]">
                                        Struktur alur terstandarisasi memudahkan
                                        onboarding anggota tim baru dan
                                        manajemen.
                                    </p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {workflow.map((step, index) => (
                                        <article
                                            key={step.title}
                                            className="rounded-[var(--landing-radius-card)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-6"
                                        >
                                            <div className="flex size-9 items-center justify-center rounded-full bg-[var(--landing-color-accent-soft)] text-sm font-bold text-[var(--landing-color-accent)]">
                                                0{index + 1}
                                            </div>
                                            <h3 className="mt-4 font-semibold text-[var(--landing-color-ink)]">
                                                {step.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-[var(--landing-color-ink-soft)]">
                                                {step.description}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] py-20 sm:py-24">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8">
                            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                                <div>
                                    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-[var(--landing-color-accent)] uppercase">
                                        Solusi per industri
                                    </span>
                                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--landing-color-ink)] sm:text-4xl">
                                        Halaman demo sesuai segmen perusahaan.
                                    </h2>
                                    <p className="mt-4 text-base leading-7 text-[var(--landing-color-ink-soft)]">
                                        Pilih halaman yang sesuai agar demo dan
                                        diskusi kebutuhan berjalan lebih
                                        terarah.
                                    </p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {industrySolutions.map((solution) => (
                                        <Link
                                            key={solution.href}
                                            href={solution.href}
                                            className="group rounded-[var(--landing-radius-card)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] p-6 transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px"
                                        >
                                            <solution.icon className="size-7 text-[var(--landing-color-accent)]" />
                                            <h3 className="mt-4 font-semibold text-[var(--landing-color-ink)]">
                                                {solution.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-[var(--landing-color-ink-soft)]">
                                                {solution.text}
                                            </p>
                                            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--landing-color-accent)]">
                                                Buka halaman
                                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="py-20 sm:py-24">
                        <div className="mx-auto max-w-5xl px-5 sm:px-8">
                            <div className="rounded-[var(--landing-radius-panel)] bg-[var(--landing-color-ink)] px-6 py-10 text-[var(--landing-color-paper)] sm:px-10 sm:py-14">
                                <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
                                    Butuh demo fitur yang sesuai alur
                                    perusahaan?
                                </h2>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--landing-color-paper)]/75 sm:text-base">
                                    Ceritakan jumlah karyawan, alur approval,
                                    dan modul prioritas Anda. Tim Humi siap
                                    membantu.
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href="/contact"
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--landing-radius-control)] bg-[var(--landing-color-paper)] px-5 py-2.5 text-sm font-semibold text-[var(--landing-color-ink)] transition-transform hover:-translate-y-px"
                                    >
                                        Hubungi Tim Humi
                                        <ShieldCheck className="size-4" />
                                    </Link>
                                    <a
                                        href={WHATSAPP_CONTACT_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--landing-color-paper)] underline decoration-[var(--landing-color-paper)]/40 underline-offset-4"
                                    >
                                        Chat via WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <LandingFooter hasUser={hasUser} trialHref={trialHref} />

                <a
                    href={WHATSAPP_CONTACT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Hubungi Humi via WhatsApp"
                    className="fixed right-4 bottom-4 z-[var(--landing-z-sticky)] inline-flex size-12 items-center justify-center rounded-full border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] shadow-[var(--landing-shadow-float)] transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none sm:right-6 sm:bottom-6 sm:size-14"
                >
                    <img
                        src="/icons/whatsapp.webp"
                        alt=""
                        width={56}
                        height={56}
                        className="size-11 object-contain sm:size-12"
                    />
                </a>
            </div>
        </>
    );
}
