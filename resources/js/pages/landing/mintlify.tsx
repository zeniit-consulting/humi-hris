import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarClock,
    CheckCircle2,
    CircleDollarSign,
    Clock,
    Fingerprint,
    NotebookPen,
    Shield,
    Sparkles,
    Users,
} from 'lucide-react';
import SeoHead from '@/components/seo-head';
import { dashboard, login, register } from '@/routes';

const accent = '#0c8c5e';
const ink = '#08090a';
const trueBlack = '#000000';
const mist = '#f2f2f2';
const cloud = '#dddddd';

const modules = [
    {
        icon: NotebookPen,
        eyebrow: 'Recruitment',
        title: 'Rekrutmen Terpadu',
        description:
            'Kelola lowongan, tahapan seleksi, dan kandidat dalam satu alur yang terstruktur.',
    },
    {
        icon: Users,
        eyebrow: 'Employee',
        title: 'Data Karyawan',
        description:
            'Database personal, jabatan, dokumen, dan riwayat kerja terpusat dalam satu dashboard.',
    },
    {
        icon: CalendarClock,
        eyebrow: 'Attendance',
        title: 'Absensi Real-time',
        description:
            'Kehadiran, lembur, cuti, dan jadwal shift terpantau real-time dari web maupun mobile.',
    },
    {
        icon: CircleDollarSign,
        eyebrow: 'Payroll',
        title: 'Payroll Otomatis',
        description:
            'Generate payroll otomatis dengan komponen gaji, kasbon, denda, dan tunjangan fleksibel.',
    },
];

const benefits = [
    'Implementasi cepat tanpa perlu training lama',
    'Mendukung struktur multi divisi dan jabatan bertingkat',
    'Mengurangi kesalahan manual pada perhitungan payroll',
    'Akses berbasis role dengan audit log lengkap',
];

const clientLogos = [
    '/images/clients/nusantara-retail.svg',
    '/images/clients/andalan-tekstil.svg',
    '/images/clients/sentra-distribusi.svg',
    '/images/clients/bumi-logistic.svg',
    '/images/clients/rasa-nusantara.svg',
    '/images/clients/prima-manufacture.svg',
    '/images/clients/kawan-konsultan.svg',
    '/images/clients/arunika-fnb.svg',
];

const fmt = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const PRICE_CORE = 2900;
const PRICE_PLUS = 7500;
const SEO_TITLE = 'Humi HRIS - Software HRIS Indonesia';
const SEO_DESCRIPTION =
    'Humi adalah software HRIS Indonesia untuk mengelola data karyawan, absensi, cuti, lembur, payroll, approval, dan portal karyawan dalam satu platform.';
const SEO_KEYWORDS =
    'software HRIS Indonesia, aplikasi HRIS, HR management system, aplikasi absensi karyawan, software payroll Indonesia, manajemen karyawan, aplikasi cuti karyawan, portal karyawan';

const coreFeaturesIncluded = [
    'Manajemen Karyawan',
    'Kehadiran & Absensi',
    'Jadwal Kerja',
    'Cuti & Izin',
    'Lembur',
    'Penggajian',
    'Notifikasi',
    'Survey',
    'Struktur Organisasi',
];

const plusFeatures = [
    ...coreFeaturesIncluded,
    'Rekrutmen',
    'Kasbon',
    'Asset Management',
];

const pricingPlans = [
    {
        name: 'Free Trial',
        price: 'Gratis',
        description:
            'Coba sistem maksimal 30 hari sebelum memilih paket berbayar.',
        cta: 'Mulai Trial',
        badge: '30 HARI',
        features: ['Maks. 10 karyawan', 'Maks. 30 hari', ...coreFeaturesIncluded.slice(0, 5)],
    },
    {
        name: 'Basic',
        price: fmt.format(PRICE_CORE),
        period: '/karyawan/bulan',
        description:
            'Paket minimum setelah trial untuk operasional HR harian.',
        cta: 'Pilih Basic',
        features: coreFeaturesIncluded,
    },
    {
        name: 'Plus',
        price: fmt.format(PRICE_PLUS),
        period: '/karyawan/bulan',
        description:
            'Paket lengkap untuk rekrutmen, kasbon, dan asset management.',
        cta: 'Pilih Plus',
        badge: 'REKOMENDASI',
        features: plusFeatures,
    },
];

export default function MintlifyLanding({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth, appUrl } = usePage().props as {
        auth: { user?: unknown };
        appUrl: string;
    };
    const siteUrl = appUrl.replace(/\/$/, '');
    const primaryHref = auth.user ? dashboard() : canRegister ? register() : login();

    return (
        <>
            <SeoHead
                title={SEO_TITLE}
                description={SEO_DESCRIPTION}
                keywords={SEO_KEYWORDS}
                canonicalPath="/landing-v2"
                structuredData={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: 'Humi HRIS',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Web',
                        url: `${siteUrl}/landing-v2`,
                        description: SEO_DESCRIPTION,
                        offers: {
                            '@type': 'Offer',
                            price: String(PRICE_CORE),
                            priceCurrency: 'IDR',
                        },
                    },
                ]}
            >
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </SeoHead>

            <div
                className="min-h-screen bg-white"
                style={{
                    color: trueBlack,
                    fontFamily:
                        'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
                    fontFeatureSettings: '"ss01" on, "cv11" on',
                }}
            >
                <header className="sticky top-0 z-50 bg-white">
                    <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Humi" className="h-8 w-auto" />
                        </Link>
                        <nav className="hidden items-center gap-1 md:flex">
                            <a className="nav-link" href="#features">
                                Fitur
                            </a>
                            <a className="nav-link" href="#proof">
                                Keunggulan
                            </a>
                            <a className="nav-link" href="#pricing">
                                Harga
                            </a>
                            <Link className="nav-link" href="/contact">
                                Kontak
                            </Link>
                        </nav>
                        <div className="flex items-center gap-2">
                            {!auth.user ? (
                                <Link className="ghost-button hidden sm:inline-flex" href={login()}>
                                    Masuk
                                </Link>
                            ) : null}
                            <Link className="filled-button" href={primaryHref}>
                                {auth.user ? 'Dashboard' : 'Mulai Trial'}
                            </Link>
                        </div>
                    </div>
                </header>

                <main>
                    <section className="relative overflow-hidden bg-[#0c8c5e] text-white">
                        <CloudLandscape />
                        <div className="relative mx-auto max-w-[1200px] px-5 pt-20 pb-28 text-center md:pt-24 md:pb-36">
                            <p className="mx-auto inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.65px] uppercase">
                                <span className="size-1.5 rounded-[2px] bg-white" />
                                Platform HRIS untuk bisnis modern
                            </p>
                            <h1 className="mx-auto mt-6 max-w-4xl text-[42px] leading-[1.1] font-semibold md:text-[57px]">
                                Kelola tim Anda dengan lebih sederhana
                            </h1>
                            <p className="mx-auto mt-5 max-w-2xl text-[18px] leading-[1.5] text-white/80">
                                Humi menyatukan data karyawan, absensi, cuti,
                                payroll, approval, dan portal karyawan dalam
                                satu platform yang mudah digunakan.
                            </p>
                            <div className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
                                <div className="flex h-12 flex-1 items-center rounded-[4px] border border-white/35 bg-white pl-4 text-left shadow-[0_2px_4px_rgba(255,255,255,0.05)]">
                                    <span className="flex-1 text-[15px] text-black/45">
                                        Email kantor Anda
                                    </span>
                                    <Link
                                        href={primaryHref}
                                        className="mr-1 inline-flex size-10 items-center justify-center rounded-[4px] bg-[#08090a] text-white"
                                        aria-label="Mulai trial"
                                    >
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                                <Link
                                    className="inline-flex h-12 items-center justify-center rounded-[4px] border border-white/35 px-5 text-[15px] font-medium text-white"
                                    href="/contact"
                                >
                                    Contact sales
                                </Link>
                            </div>
                        </div>
                        <div className="relative mx-auto -mt-24 max-w-[1040px] px-5 pb-4">
                            <ProductShowcase />
                        </div>
                    </section>

                    <section id="proof" className="bg-white pt-24">
                        <div className="mx-auto max-w-[1200px] px-5">
                            <p className="text-center text-[13px] font-medium tracking-[0.65px] text-[#0c8c5e] uppercase">
                                Dipercaya untuk operasional HR harian
                            </p>
                            <div className="mt-8 grid grid-cols-2 items-center gap-6 opacity-65 grayscale md:grid-cols-4">
                                {clientLogos.map((logo) => (
                                    <div key={logo} className="flex h-12 items-center justify-center">
                                        <img src={logo} alt="" className="max-h-8 max-w-[150px]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="features" className="bg-white py-20">
                        <div className="mx-auto max-w-[1200px] px-5">
                            <div className="mx-auto max-w-2xl text-center">
                                <p className="eyebrow">Fitur Utama</p>
                                <h2 className="mt-3 text-[40px] leading-[1.15] font-semibold text-[#08090a]">
                                    Semua yang Anda butuhkan untuk HR
                                </h2>
                                <p className="mt-4 text-[16px] leading-[1.5] text-black/65">
                                    Modul lengkap dari rekrutmen hingga payroll
                                    dalam satu platform terintegrasi.
                                </p>
                            </div>
                            <div className="mt-12 grid gap-4 md:grid-cols-2">
                                {modules.map((module) => (
                                    <article
                                        key={module.title}
                                        className="rounded-[16px] border border-[#f2f2f2] bg-[#0c8c5e]/[0.06] p-6"
                                    >
                                        <div className="flex items-center gap-3">
                                            <module.icon className="size-5 text-[#0c8c5e]" />
                                            <p className="eyebrow">{module.eyebrow}</p>
                                        </div>
                                        <h3 className="mt-4 text-[20px] leading-[1.3] font-semibold text-[#08090a]">
                                            {module.title}
                                        </h3>
                                        <p className="mt-2 text-[16px] leading-[1.5] text-black/70">
                                            {module.description}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white py-20">
                        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr]">
                            <div>
                                <p className="eyebrow">Mengapa Humi</p>
                                <h2 className="mt-3 text-[40px] leading-[1.15] font-semibold text-[#08090a]">
                                    Dirancang untuk tim modern yang ingin
                                    bergerak cepat
                                </h2>
                                <p className="mt-4 text-[16px] leading-[1.5] text-black/65">
                                    Humi membantu tim HR mengurangi pekerjaan
                                    manual sehingga fokus pada strategi
                                    pengembangan SDM yang lebih bernilai.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {benefits.map((benefit) => (
                                    <div
                                        key={benefit}
                                        className="rounded-[16px] border border-[#f2f2f2] bg-white p-6 shadow-[0_2px_4px_rgba(0,0,0,0.03)]"
                                    >
                                        <CheckCircle2 className="size-5 text-[#0c8c5e]" />
                                        <p className="mt-4 text-[16px] leading-[1.5] text-black">
                                            {benefit}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="pricing" className="bg-white py-20">
                        <div className="mx-auto max-w-[1200px] px-5">
                            <div className="mx-auto max-w-2xl text-center">
                                <p className="eyebrow">Pricing</p>
                                <h2 className="mt-3 text-[40px] leading-[1.15] font-semibold text-[#08090a]">
                                    Harga yang mengikuti skala tim Anda
                                </h2>
                                <p className="mt-4 text-[16px] leading-[1.5] text-black/65">
                                    Paket dan fitur disamakan dengan halaman
                                    billing agar calon pelanggan melihat
                                    penawaran yang sama.
                                </p>
                            </div>
                            <div className="mt-12 grid gap-4 lg:grid-cols-3">
                                {pricingPlans.map((plan) => (
                                    <article
                                        key={plan.name}
                                        className="flex h-full flex-col rounded-[16px] border border-[#f2f2f2] bg-white p-6 shadow-[0_2px_4px_rgba(0,0,0,0.03)]"
                                    >
                                        <div className="h-7">
                                            {plan.badge ? (
                                                <span className="rounded-[4px] border border-[#dddddd] px-2 py-1 text-[13px] font-medium tracking-[0.65px] text-[#0c8c5e] uppercase">
                                                    {plan.badge}
                                                </span>
                                            ) : null}
                                        </div>
                                        <h3 className="mt-4 text-[24px] leading-[1.33] font-semibold text-[#08090a]">
                                            {plan.name}
                                        </h3>
                                        <p className="mt-3 min-h-12 text-[16px] leading-[1.5] text-black/65">
                                            {plan.description}
                                        </p>
                                        <div className="mt-6 flex items-end gap-2">
                                            <span className="text-[40px] leading-[1.15] font-semibold text-[#08090a]">
                                                {plan.price}
                                            </span>
                                            {plan.period ? (
                                                <span className="pb-1 text-[14px] text-black/55">
                                                    {plan.period}
                                                </span>
                                            ) : null}
                                        </div>
                                        <ul className="mt-6 flex-1 space-y-3">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex gap-3 text-[15px] text-black/75">
                                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0c8c5e]" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link className="filled-button mt-8 justify-center" href={primaryHref}>
                                            {plan.cta}
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white py-20">
                        <div className="mx-auto max-w-[1200px] px-5">
                            <div className="rounded-[24px] border border-[#f2f2f2] bg-white p-10 text-center shadow-[0_2px_4px_rgba(0,0,0,0.05)] md:p-16">
                                <p className="eyebrow">Mulai sekarang</p>
                                <h2 className="mx-auto mt-3 max-w-2xl text-[40px] leading-[1.15] font-semibold text-[#08090a]">
                                    Siap mengelola HR dengan lebih baik?
                                </h2>
                                <p className="mx-auto mt-4 max-w-xl text-[16px] leading-[1.5] text-black/65">
                                    Mulai trial 30 hari hari ini. Setelah itu
                                    lanjutkan dengan paket Basic atau Plus.
                                </p>
                                <div className="mt-8 flex justify-center">
                                    <Link className="filled-button h-12 items-center px-6" href={primaryHref}>
                                        {auth.user ? 'Lanjut ke Dashboard' : 'Coba Gratis Sekarang'}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-[#f2f2f2] bg-white">
                    <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-5 px-5 py-8 text-[13px] text-black/55 sm:flex-row">
                        <img src="/logo.png" alt="Humi" className="h-7 w-auto" />
                        <p>&copy; {new Date().getFullYear()} Humi. All rights reserved.</p>
                        <div className="flex gap-5">
                            <Link href="/features">Fitur</Link>
                            <a href="#pricing">Harga</a>
                            <Link href="/contact">Kontak</Link>
                        </div>
                    </div>
                </footer>

                <style>{`
                    .nav-link {
                        border-radius: 4px;
                        padding: 8px 12px;
                        font-size: 14px;
                        font-weight: 500;
                        color: ${trueBlack};
                    }
                    .nav-link:hover, .ghost-button:hover {
                        background: ${mist};
                    }
                    .ghost-button {
                        align-items: center;
                        border-radius: 4px;
                        color: ${trueBlack};
                        font-size: 14px;
                        font-weight: 500;
                        padding: 8px 16px;
                    }
                    .filled-button {
                        align-items: center;
                        background: ${ink};
                        border-radius: 4px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
                        color: white;
                        display: inline-flex;
                        gap: 8px;
                        font-size: 14px;
                        font-weight: 500;
                        padding: 8px 16px;
                    }
                    .eyebrow {
                        color: ${accent};
                        font-size: 13px;
                        font-weight: 500;
                        letter-spacing: 0.65px;
                        text-transform: uppercase;
                    }
                    .product-row {
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 8px;
                        font-size: 14px;
                    }
                `}</style>
            </div>
        </>
    );
}

function CloudLandscape() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b5644_0%,#0c8c5e_58%,#147b60_100%)]" />
            <div className="absolute top-16 left-[8%] h-28 w-80 rounded-[24px] bg-[#fff2c5]/80 blur-2xl" />
            <div className="absolute top-24 right-[10%] h-24 w-72 rounded-[24px] bg-white/55 blur-2xl" />
            <div className="absolute right-[20%] bottom-10 h-36 w-[520px] rounded-[24px] bg-[#ffe8a3]/45 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-full bg-[radial-gradient(ellipse_at_20%_100%,rgba(255,241,190,0.92),transparent_52%),radial-gradient(ellipse_at_62%_100%,rgba(255,255,255,0.66),transparent_48%)]" />
        </div>
    );
}

function ProductShowcase() {
    const rows = [
        ['Kehadiran', '232 hadir', Clock],
        ['Data Karyawan', '248 aktif', Users],
        ['Payroll', 'Siap diproses', CircleDollarSign],
        ['Approval', '12 menunggu', Fingerprint],
    ] as const;

    return (
        <div className="rounded-[16px] bg-white p-5 text-left text-black shadow-[0_2px_4px_rgba(255,255,255,0.05)] ring-1 ring-black/5 md:p-6">
            <div className="grid gap-5 md:grid-cols-[210px_1fr_190px]">
                <aside className="border-r border-[#f2f2f2] pr-4">
                    <p className="text-[13px] font-medium tracking-[0.65px] text-black/45 uppercase">
                        Workspace
                    </p>
                    <div className="mt-4 space-y-1">
                        {rows.map(([label, value, Icon], index) => (
                            <div
                                key={label}
                                className="product-row"
                                style={{
                                    background:
                                        index === 0 ? 'rgba(12,140,94,0.08)' : 'transparent',
                                    color: index === 0 ? accent : trueBlack,
                                }}
                            >
                                <Icon className="size-4" />
                                <span className="flex-1">{label}</span>
                                <span className="text-[13px] opacity-60">{value}</span>
                            </div>
                        ))}
                    </div>
                </aside>
                <div>
                    <div className="flex items-center justify-between border-b border-[#f2f2f2] pb-4">
                        <div>
                            <p className="text-[20px] leading-[1.3] font-semibold text-[#08090a]">
                                HR Command Center
                            </p>
                            <p className="text-[14px] text-black/55">
                                Juni 2026 · Operasional harian
                            </p>
                        </div>
                        <span className="rounded-[4px] bg-[#0c8c5e]/10 px-2 py-1 text-[13px] font-medium text-[#0c8c5e]">
                            Live
                        </span>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {[
                            ['Efisiensi proses HR', '70%'],
                            ['Waktu payroll', '< 10 mnt'],
                            ['Akurasi data', '99.9%'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-[16px] border border-[#f2f2f2] p-4">
                                <p className="text-[13px] text-black/50">{label}</p>
                                <p className="mt-2 text-[24px] leading-[1.33] font-semibold text-[#08090a]">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 rounded-[16px] border border-[#f2f2f2] p-4">
                        <div className="mb-3 flex items-center justify-between text-[14px]">
                            <span className="font-medium">Payroll progress</span>
                            <span className="text-[#0c8c5e]">82%</span>
                        </div>
                        <div className="h-2 rounded-[4px] bg-[#f2f2f2]">
                            <div className="h-full w-[82%] rounded-[4px] bg-[#0c8c5e]" />
                        </div>
                    </div>
                </div>
                <aside className="hidden border-l border-[#f2f2f2] pl-4 md:block">
                    <p className="text-[13px] font-medium tracking-[0.65px] text-black/45 uppercase">
                        On this page
                    </p>
                    <div className="mt-4 space-y-3 text-[14px] text-black/55">
                        <p className="text-[#0c8c5e]">Ringkasan HR</p>
                        <p>Absensi real-time</p>
                        <p>Payroll otomatis</p>
                        <p>Approval berlapis</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
