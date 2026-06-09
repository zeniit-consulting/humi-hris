import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Banknote,
    Building2,
    CalendarClock,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    FileSpreadsheet,
    MapPin,
    MessageCircle,
    ReceiptText,
    ShieldCheck,
    Smartphone,
    Users,
} from 'lucide-react';
import SeoHead from '@/components/seo-head';
import { dashboard, login, register } from '@/routes';

type IndustrySlug = 'outsourcing' | 'retail-fnb' | 'manufaktur-shift';

type PageProps = {
    industrySlug: IndustrySlug;
    canRegister?: boolean;
};

type SharedProps = {
    auth: { user?: unknown };
    appUrl: string;
};

const WHATSAPP_PHONE = '6285710999144';

const segmentLinks = [
    { label: 'Outsourcing', href: '/hris-outsourcing' },
    { label: 'Retail & F&B', href: '/hris-retail-fnb' },
    { label: 'Manufaktur Shift', href: '/hris-manufaktur-shift' },
];

const offers = [
    'Gratis setup 30 karyawan pertama',
    'Import data karyawan dari Excel',
    'Payroll pertama didampingi',
    'Demo WhatsApp 15 menit',
];

const proofPoints = [
    { value: '30 hari', label: 'trial awal' },
    { value: 'Rp2.900', label: 'mulai per karyawan/bulan' },
    { value: '1 sistem', label: 'absensi sampai payroll' },
];

const sharedModules = [
    {
        icon: Users,
        title: 'Database karyawan',
        text: 'Data personal, kontrak, dokumen, rekening bank, divisi, jabatan, dan status kerja tersimpan rapi.',
    },
    {
        icon: CalendarClock,
        title: 'Absensi, shift, cuti, lembur',
        text: 'HR memantau jadwal, kehadiran, koreksi absensi, cuti, lembur, dan approval dari satu tempat.',
    },
    {
        icon: Banknote,
        title: 'Payroll dan THR',
        text: 'Generate payroll, THR, potongan, tunjangan, kasbon, slip gaji, dan export bank untuk proses bulanan.',
    },
    {
        icon: Smartphone,
        title: 'Portal karyawan',
        text: 'Karyawan bisa cek profil, absensi, cuti, lembur, kasbon, slip gaji, pengumuman, survey, dan aktivitas.',
    },
];

const industries: Record<
    IndustrySlug,
    {
        path: string;
        title: string;
        description: string;
        seoTitle: string;
        seoDescription: string;
        headline: string;
        supporting: string;
        primaryPain: string;
        ctaText: string;
        whatsappText: string;
        accent: string;
        dark: string;
        challenges: string[];
        workflow: Array<{ title: string; text: string }>;
        outcomes: string[];
        scenario: Array<{ label: string; value: string; tone: string }>;
        segmentModules: string[];
    }
> = {
    outsourcing: {
        path: '/hris-outsourcing',
        title: 'HRIS untuk Outsourcing',
        description:
            'Kelola manpower, lokasi klien, absensi lapangan, payroll, dan billing klien tanpa spreadsheet terpisah.',
        seoTitle:
            'HRIS Outsourcing Indonesia - Absensi, Payroll, dan Billing Klien',
        seoDescription:
            'Humi HRIS membantu perusahaan outsourcing mengelola sub-company, manpower request, lokasi absensi, payroll, client billing, dan portal karyawan.',
        headline:
            'HRIS untuk perusahaan outsourcing yang harus mengontrol banyak klien dan tenaga kerja lapangan.',
        supporting:
            'Humi menyatukan data karyawan, sub-company, lokasi absensi, manpower request, payroll, dan invoice klien agar operasional outsourcing tidak tercecer di Excel dan chat.',
        primaryPain:
            'Masalah utama outsourcing biasanya bukan hanya payroll, tetapi sinkronisasi karyawan, lokasi kerja, kebutuhan manpower, approval supervisor, dan tagihan ke klien.',
        ctaText: 'Demo HRIS Outsourcing',
        whatsappText:
            'Halo Humi, saya ingin demo HRIS untuk perusahaan outsourcing.',
        accent: '#0d4d52',
        dark: '#082f32',
        challenges: [
            'Penempatan karyawan berubah antar klien atau lokasi',
            'Rekap absensi lapangan terlambat masuk ke payroll',
            'Manpower request dari klien sulit dipantau statusnya',
            'Invoice klien perlu mengikuti headcount, pajak, dan service fee',
        ],
        workflow: [
            {
                title: 'Kelompokkan klien',
                text: 'Buat sub-company, PIC, lokasi absensi, dan supervisor untuk setiap klien.',
            },
            {
                title: 'Kontrol tenaga kerja',
                text: 'Kelola data karyawan, kontrak, dokumen, offboarding, dan penempatan operasional.',
            },
            {
                title: 'Tutup periode',
                text: 'Validasi absensi, proses payroll, kasbon, slip gaji, lalu buat billing klien.',
            },
        ],
        outcomes: [
            'Headcount per klien lebih mudah diaudit',
            'Absensi lapangan langsung siap menjadi dasar payroll',
            'Kebutuhan manpower tidak hilang di chat',
            'Billing klien lebih cepat setelah periode payroll selesai',
        ],
        scenario: [
            {
                label: 'Sub-company aktif',
                value: '12',
                tone: 'bg-teal-50 text-teal-700',
            },
            {
                label: 'Karyawan lapangan',
                value: '428',
                tone: 'bg-slate-100 text-slate-800',
            },
            {
                label: 'Manpower pending',
                value: '18',
                tone: 'bg-amber-50 text-amber-700',
            },
        ],
        segmentModules: [
            'Sub-company dan lokasi absensi klien',
            'Manpower request',
            'Client billing',
            'Portal supervisor dan karyawan',
        ],
    },
    'retail-fnb': {
        path: '/hris-retail-fnb',
        title: 'HRIS untuk Retail & F&B',
        description:
            'Atur shift cabang, absensi, lembur, cuti, kasbon, dan payroll tim toko atau outlet dengan alur sederhana.',
        seoTitle:
            'HRIS Retail dan F&B - Shift, Absensi, Lembur, Payroll Outlet',
        seoDescription:
            'Humi HRIS membantu bisnis retail dan F&B mengatur shift cabang, absensi karyawan outlet, cuti, lembur, kasbon, payroll, dan portal karyawan.',
        headline:
            'HRIS sederhana untuk bisnis retail dan F&B yang punya banyak shift, outlet, dan tim operasional.',
        supporting:
            'Humi membantu owner dan HR melihat jadwal, kehadiran, cuti, lembur, kasbon, dan payroll tanpa menunggu rekap manual dari tiap outlet.',
        primaryPain:
            'Bisnis outlet sering rugi waktu karena jadwal berubah cepat, absensi dikirim manual, lembur tidak rapi, dan payroll harus dicek ulang setiap bulan.',
        ctaText: 'Demo untuk Retail & F&B',
        whatsappText: 'Halo Humi, saya ingin demo HRIS untuk retail atau F&B.',
        accent: '#1f6f4a',
        dark: '#123f2c',
        challenges: [
            'Jadwal shift outlet berubah cepat dan sering bentrok',
            'Owner sulit melihat siapa yang hadir tepat waktu',
            'Cuti, izin, dan lembur masih tercecer di WhatsApp',
            'Kasbon dan potongan payroll sering dihitung manual',
        ],
        workflow: [
            {
                title: 'Siapkan outlet',
                text: 'Atur divisi, jabatan, lokasi absensi, radius, shift, dan user admin cabang.',
            },
            {
                title: 'Jalankan operasional',
                text: 'Karyawan check-in, ajukan cuti/lembur, cek jadwal, dan update data dari portal.',
            },
            {
                title: 'Rekap payroll',
                text: 'HR validasi absensi, kasbon, tunjangan, potongan, lalu generate payroll.',
            },
        ],
        outcomes: [
            'Jadwal shift lebih jelas untuk admin dan karyawan',
            'Keterlambatan dan absen lebih cepat terlihat',
            'Approval cuti/lembur tidak hilang di chat',
            'Payroll outlet lebih mudah direview sebelum dibayar',
        ],
        scenario: [
            {
                label: 'Outlet',
                value: '9',
                tone: 'bg-emerald-50 text-emerald-700',
            },
            {
                label: 'Shift minggu ini',
                value: '214',
                tone: 'bg-slate-100 text-slate-800',
            },
            {
                label: 'Approval pending',
                value: '7',
                tone: 'bg-amber-50 text-amber-700',
            },
        ],
        segmentModules: [
            'Jadwal shift dan roster',
            'Absensi lokasi outlet',
            'Cuti, lembur, dan approval',
            'Kasbon dan payroll',
        ],
    },
    'manufaktur-shift': {
        path: '/hris-manufaktur-shift',
        title: 'HRIS untuk Manufaktur Shift',
        description:
            'Pantau roster, absensi, lembur, performance, payroll, dan dokumen karyawan produksi dalam satu sistem.',
        seoTitle: 'HRIS Manufaktur Shift - Roster, Absensi, Lembur, Payroll',
        seoDescription:
            'Humi HRIS membantu perusahaan manufaktur mengatur roster shift, absensi produksi, lembur, cuti, payroll, performance KPI, dan dokumen karyawan.',
        headline:
            'HRIS untuk pabrik dan tim produksi yang membutuhkan kontrol shift, lembur, dan payroll lebih rapi.',
        supporting:
            'Humi membantu HR dan supervisor produksi mengatur roster, memvalidasi absensi, mengelola lembur, menghitung payroll, dan membaca KPI karyawan dari data operasional.',
        primaryPain:
            'Di manufaktur, kesalahan kecil pada jadwal, absensi, atau lembur bisa langsung memengaruhi payroll dan biaya produksi.',
        ctaText: 'Demo HRIS Manufaktur',
        whatsappText:
            'Halo Humi, saya ingin demo HRIS untuk manufaktur dengan sistem shift.',
        accent: '#315b87',
        dark: '#1c3550',
        challenges: [
            'Roster shift perlu disiapkan dan berubah per periode',
            'Lembur produksi harus tervalidasi sebelum payroll',
            'Dokumen, kontrak, dan status karyawan perlu terpusat',
            'Performance perlu membaca KPI dan data kehadiran',
        ],
        workflow: [
            {
                title: 'Buat roster',
                text: 'Siapkan shift, jadwal karyawan, hari libur, dan pola kerja per periode.',
            },
            {
                title: 'Validasi data kerja',
                text: 'Supervisor dan HR memeriksa absensi, koreksi, cuti, dan lembur sebelum closing.',
            },
            {
                title: 'Hitung dan evaluasi',
                text: 'Generate payroll, kirim slip gaji, lalu gunakan KPI dan OKR untuk evaluasi periodik.',
            },
        ],
        outcomes: [
            'Roster produksi lebih mudah dikontrol',
            'Lembur dan koreksi absensi punya jejak approval',
            'Payroll bisa ditutup dengan data yang sudah tervalidasi',
            'KPI attendance dan review manager lebih terstruktur',
        ],
        scenario: [
            {
                label: 'Line produksi',
                value: '6',
                tone: 'bg-blue-50 text-blue-700',
            },
            {
                label: 'Shift aktif',
                value: '3',
                tone: 'bg-slate-100 text-slate-800',
            },
            {
                label: 'Lembur pending',
                value: '24',
                tone: 'bg-amber-50 text-amber-700',
            },
        ],
        segmentModules: [
            'Roster dan shift',
            'Koreksi absensi dan lembur',
            'Payroll dan export bank',
            'Performance KPI dan OKR',
        ],
    },
};

function whatsappUrl(text: string) {
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}

export default function IndustryLanding({
    industrySlug,
    canRegister = true,
}: PageProps) {
    const { auth, appUrl } = usePage().props as SharedProps;
    const industry = industries[industrySlug] ?? industries.outsourcing;
    const siteUrl = appUrl.replace(/\/$/, '');
    const waUrl = whatsappUrl(industry.whatsappText);
    const primaryHref = auth.user
        ? dashboard()
        : canRegister
          ? register()
          : login();

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `Humi ${industry.title}`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: `${siteUrl}${industry.path}`,
        description: industry.seoDescription,
        offers: {
            '@type': 'Offer',
            price: '2900',
            priceCurrency: 'IDR',
            category: 'subscription',
        },
        featureList: [
            ...sharedModules.map((module) => module.title),
            ...industry.segmentModules,
        ],
    };

    return (
        <>
            <SeoHead
                title={industry.seoTitle}
                description={industry.seoDescription}
                keywords={`${industry.title}, software HRIS Indonesia, aplikasi absensi karyawan, software payroll Indonesia, aplikasi shift karyawan`}
                canonicalPath={industry.path}
                structuredData={structuredData}
            />

            <div className="min-h-screen bg-white text-slate-950">
                <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="Humi"
                                className="h-8 w-auto"
                            />
                        </Link>
                        <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 lg:flex">
                            {segmentLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={
                                        link.href === industry.path
                                            ? 'rounded-full bg-slate-100 px-4 py-2 text-slate-950'
                                            : 'rounded-full px-4 py-2 transition hover:bg-slate-50 hover:text-slate-950'
                                    }
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href="/features"
                                className="rounded-full px-4 py-2 transition hover:bg-slate-50 hover:text-slate-950"
                            >
                                Fitur
                            </Link>
                            <Link
                                href="/contact"
                                className="rounded-full px-4 py-2 transition hover:bg-slate-50 hover:text-slate-950"
                            >
                                Kontak
                            </Link>
                        </nav>
                        <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                            style={{ backgroundColor: industry.accent }}
                        >
                            Demo
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </header>

                <main>
                    <section className="relative overflow-hidden border-b border-slate-100">
                        <div
                            className="absolute inset-x-0 top-0 -z-10 h-[620px]"
                            style={{
                                background: `linear-gradient(135deg, ${industry.accent}14, #ffffff 56%, #f8fafc)`,
                            }}
                        />
                        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
                            <div className="flex flex-col justify-center">
                                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-6xl">
                                    {industry.headline}
                                </h1>
                                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                                    {industry.supporting}
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
                                        style={{
                                            backgroundColor: industry.accent,
                                        }}
                                    >
                                        {industry.ctaText}
                                        <MessageCircle className="h-4 w-4" />
                                    </a>
                                    <Link
                                        href={primaryHref}
                                        className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 sm:w-auto"
                                    >
                                        Mulai Trial 30 Hari
                                    </Link>
                                </div>
                                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                                    {proofPoints.map((point) => (
                                        <div
                                            key={point.label}
                                            className="border-l-2 border-slate-200 pl-4"
                                        >
                                            <p
                                                className="text-2xl font-bold"
                                                style={{ color: industry.dark }}
                                            >
                                                {point.value}
                                            </p>
                                            <p className="mt-1 text-xs font-medium text-slate-500">
                                                {point.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
                                    <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {industry.title}
                                                </p>
                                                <p className="mt-1 text-xs text-white/55">
                                                    Dashboard operasional
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                                                Live
                                            </span>
                                        </div>
                                        <div className="mt-6 grid gap-3">
                                            {industry.scenario.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="rounded-2xl bg-white p-4 text-slate-950"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-slate-500">
                                                            {item.label}
                                                        </p>
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.tone}`}
                                                        >
                                                            Aktif
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-3xl font-bold">
                                                        {item.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div
                                            className="mt-4 rounded-2xl p-4"
                                            style={{
                                                backgroundColor:
                                                    industry.accent,
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold tracking-[0.12em] text-white/70 uppercase">
                                                        Closing payroll
                                                    </p>
                                                    <p className="mt-2 text-xl font-bold">
                                                        Siap direview HR
                                                    </p>
                                                </div>
                                                <ReceiptText className="h-9 w-9 text-white/80" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-b border-slate-100 py-14">
                        <div className="mx-auto grid max-w-6xl gap-6 px-6 lg:grid-cols-[0.8fr_1.2fr]">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                    Paket mulai cepat untuk perusahaan pertama
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                    Penawaran ini dibuat supaya perusahaan lokal
                                    bisa mulai tanpa proses implementasi yang
                                    berat.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {offers.map((offer) => (
                                    <div
                                        key={offer}
                                        className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                                    >
                                        <BadgeCheck
                                            className="mt-0.5 h-5 w-5 shrink-0"
                                            style={{ color: industry.accent }}
                                        />
                                        <p className="text-sm font-medium text-slate-800">
                                            {offer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-50/70 py-16">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                                        Fokus pada masalah yang paling mahal
                                        untuk operasional.
                                    </h2>
                                    <p className="mt-4 text-base leading-7 text-slate-600">
                                        {industry.primaryPain}
                                    </p>
                                </div>
                                <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
                                    {industry.challenges.map((challenge) => (
                                        <article
                                            key={challenge}
                                            className="bg-white p-5"
                                        >
                                            <ClipboardCheck
                                                className="h-6 w-6"
                                                style={{
                                                    color: industry.accent,
                                                }}
                                            />
                                            <p className="mt-4 text-sm leading-6 font-medium text-slate-800">
                                                {challenge}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="py-16">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="grid gap-6 lg:grid-cols-4">
                                {sharedModules.map((module) => (
                                    <article
                                        key={module.title}
                                        className="rounded-2xl border border-slate-200 p-5"
                                    >
                                        <module.icon
                                            className="h-6 w-6"
                                            style={{ color: industry.accent }}
                                        />
                                        <h2 className="mt-4 font-semibold text-slate-950">
                                            {module.title}
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {module.text}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="border-y border-slate-100 bg-white py-16">
                        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr]">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                                    Alur implementasi yang mudah dipahami.
                                </h2>
                                <p className="mt-4 text-base leading-7 text-slate-600">
                                    Tim perusahaan bisa memahami implementasi
                                    dengan bahasa sederhana: setup data,
                                    jalankan operasional, lalu tutup periode
                                    payroll.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {industry.segmentModules.map((module) => (
                                        <span
                                            key={module}
                                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                                        >
                                            {module}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                {industry.workflow.map((step, index) => (
                                    <article
                                        key={step.title}
                                        className="flex gap-4 rounded-2xl border border-slate-200 p-5"
                                    >
                                        <div
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                                            style={{
                                                backgroundColor:
                                                    industry.accent,
                                            }}
                                        >
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-950">
                                                {step.title}
                                            </h3>
                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                {step.text}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-950 py-16 text-white">
                        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_1fr]">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">
                                    Hasil yang bisa ditargetkan setelah
                                    implementasi.
                                </h2>
                                <p className="mt-4 text-base leading-7 text-white/65">
                                    Fokus pada perbaikan yang langsung terasa
                                    setelah data karyawan, absensi, approval,
                                    dan payroll mulai berjalan di satu sistem.
                                </p>
                            </div>
                            <div className="grid gap-3">
                                {industry.outcomes.map((outcome) => (
                                    <div
                                        key={outcome}
                                        className="flex items-start gap-3 rounded-2xl bg-white/7 p-4"
                                    >
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                                        <p className="text-sm leading-6 text-white/86">
                                            {outcome}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-16">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="grid gap-4 md:grid-cols-4">
                                {[
                                    {
                                        icon: FileSpreadsheet,
                                        title: 'Excel import',
                                        text: 'Mulai dari data yang sudah dimiliki HR.',
                                    },
                                    {
                                        icon: MapPin,
                                        title: 'Lokasi absensi',
                                        text: 'Titik dan radius kerja bisa disesuaikan.',
                                    },
                                    {
                                        icon: ShieldCheck,
                                        title: 'Role access',
                                        text: 'Admin, supervisor, dan karyawan punya akses berbeda.',
                                    },
                                    {
                                        icon: Clock3,
                                        title: '30 hari trial',
                                        text: 'Cukup untuk tes satu siklus operasional.',
                                    },
                                ].map((item) => (
                                    <article
                                        key={item.title}
                                        className="rounded-2xl bg-slate-50 p-5"
                                    >
                                        <item.icon
                                            className="h-6 w-6"
                                            style={{ color: industry.accent }}
                                        />
                                        <h3 className="mt-4 font-semibold text-slate-950">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {item.text}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="pb-20">
                        <div className="mx-auto max-w-5xl px-6">
                            <div
                                className="rounded-[2rem] px-8 py-12 text-center text-white md:px-12"
                                style={{ backgroundColor: industry.dark }}
                            >
                                <Building2 className="mx-auto h-8 w-8 text-white/80" />
                                <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
                                    Siap uji Humi untuk operasional{' '}
                                    {industry.title.toLowerCase()}?
                                </h2>
                                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/72">
                                    Kirim jumlah karyawan, jumlah lokasi, dan
                                    masalah HR paling mendesak. Tim Humi akan
                                    arahkan demo sesuai alur perusahaan Anda.
                                </p>
                                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                    <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold transition hover:bg-slate-100"
                                        style={{ color: industry.dark }}
                                    >
                                        Chat WhatsApp
                                        <ArrowRight className="h-4 w-4" />
                                    </a>
                                    <Link
                                        href={primaryHref}
                                        className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                    >
                                        Mulai Trial
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
