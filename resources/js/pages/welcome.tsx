import { Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    Building2,
    CalendarCheck2,
    Check,
    CheckCircle2,
    ChevronDown,
    Factory,
    FileCheck2,
    Fingerprint,
    ShieldCheck,
    Store,
    Users,
    WalletCards,
} from 'lucide-react';
import { useState } from 'react';
import {
    frontHeroSubtitleClass,
    frontHeroTealTextClass,
    frontHeroTitleClass,
} from '@/components/front-hero-typography';
import {
    LandingNav,
    landingSecondaryActionClass,
} from '@/components/landing-nav';
import SeoHead from '@/components/seo-head';
import { dashboard, login, register } from '@/routes';

type WelcomeProps = {
    canRegister?: boolean;
};

type ProductArea = {
    id: 'employees' | 'attendance' | 'approvals' | 'payroll';
    label: string;
    title: string;
    description: string;
    icon: LucideIcon;
    facts: string[];
    status: string;
};

type WorkflowStepData = {
    marker: string;
    title: string;
    description: string;
    icon: LucideIcon;
};

type IndustrySolutionData = {
    title: string;
    description: string;
    href: string;
    cta: string;
    icon: LucideIcon;
};

type PricingPlanData = {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    lockedFeatures?: string[];
    recommended?: boolean;
    cta: string;
};

type Faq = {
    question: string;
    answer: string;
};

const PRICE_BASIC = 2900;
const PRICE_PLUS = 7500;
const WHATSAPP_CONTACT_URL =
    'https://wa.me/6285710999144?text=Halo%20Humi%2C%20saya%20ingin%20konsultasi%20tentang%20HRIS.';
const SEO_TITLE = 'Humi HRIS - Software HRIS Indonesia';
const SEO_DESCRIPTION =
    'Humi adalah software HRIS Indonesia untuk mengelola data karyawan, absensi, cuti, lembur, payroll, approval, dan portal karyawan dalam satu platform.';
const SEO_KEYWORDS =
    'software HRIS Indonesia, aplikasi HRIS, HR management system, aplikasi absensi karyawan, software payroll Indonesia, manajemen karyawan, aplikasi cuti karyawan, portal karyawan';

const currency = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const productAreas: ProductArea[] = [
    {
        id: 'employees',
        label: 'Data karyawan',
        title: 'Satu sumber data untuk seluruh tim.',
        description:
            'Profil, jabatan, kontrak, dokumen, dan struktur organisasi tersimpan dalam catatan yang sama untuk HR dan manajemen.',
        icon: Users,
        status: 'Data terpusat',
        facts: [
            'Profil dan dokumen karyawan',
            'Posisi serta struktur organisasi',
            'Riwayat kontrak dan pekerjaan',
        ],
    },
    {
        id: 'attendance',
        label: 'Absensi & jadwal',
        title: 'Kehadiran mengikuti pola kerja perusahaan.',
        description:
            'Atur shift, lokasi, jadwal, dan koreksi absensi tanpa memisahkan data operasional dari profil karyawan.',
        icon: Fingerprint,
        status: 'Terhubung ke jadwal',
        facts: [
            'Absensi web dan mobile',
            'Jadwal serta pola kerja',
            'Koreksi dan riwayat kehadiran',
        ],
    },
    {
        id: 'approvals',
        label: 'Cuti & approval',
        title: 'Pengajuan bergerak di jalur yang jelas.',
        description:
            'Cuti, izin, lembur, kasbon, dan reimbursement dapat ditinjau berdasarkan peran serta kebutuhan perusahaan.',
        icon: FileCheck2,
        status: 'Siap ditinjau',
        facts: [
            'Pengajuan mandiri dari portal',
            'Approval sesuai peran',
            'Riwayat keputusan tersimpan',
        ],
    },
    {
        id: 'payroll',
        label: 'Payroll',
        title: 'Payroll memakai data yang sudah disetujui.',
        description:
            'Komponen gaji, tunjangan, potongan, kasbon, dan data kehadiran bertemu sebelum slip gaji diterbitkan.',
        icon: WalletCards,
        status: 'Siap diproses',
        facts: [
            'Komponen payroll fleksibel',
            'Slip gaji untuk karyawan',
            'Riwayat dan laporan payroll',
        ],
    },
];

const workflowSteps: WorkflowStepData[] = [
    {
        marker: '01',
        title: 'Data menjadi sumber yang sama',
        description:
            'Profil, posisi, jadwal, dan kebijakan kerja tersimpan dalam satu basis operasional.',
        icon: Users,
    },
    {
        marker: '02',
        title: 'Aktivitas harian tercatat',
        description:
            'Absensi, cuti, lembur, koreksi, dan approval bergerak dalam alur yang dapat ditinjau.',
        icon: CalendarCheck2,
    },
    {
        marker: '03',
        title: 'Payroll siap diproses',
        description:
            'Data yang telah disetujui menjadi dasar payroll, slip gaji, dan laporan manajemen.',
        icon: WalletCards,
    },
];

const industrySolutions: IndustrySolutionData[] = [
    {
        icon: Building2,
        title: 'Outsourcing',
        description:
            'Kelola sub-company, lokasi klien, manpower request, absensi lapangan, payroll, dan billing klien.',
        href: '/hris-outsourcing',
        cta: 'Lihat solusi outsourcing',
    },
    {
        icon: Store,
        title: 'Retail & F&B',
        description:
            'Susun shift outlet, absensi, cuti, lembur, kasbon, dan payroll untuk tim cabang.',
        href: '/hris-retail-fnb',
        cta: 'Lihat solusi retail',
    },
    {
        icon: Factory,
        title: 'Manufaktur shift',
        description:
            'Pantau roster, koreksi absensi, lembur, payroll, dan performa tim produksi.',
        href: '/hris-manufaktur-shift',
        cta: 'Lihat solusi manufaktur',
    },
];

const basicFeatures = [
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
    ...basicFeatures,
    'Rekrutmen',
    'Kasbon',
    'Asset Management',
];

const pricingPlans: PricingPlanData[] = [
    {
        name: 'Free Trial',
        price: 'Gratis',
        description:
            'Uji alur HR harian sebelum menentukan paket untuk operasional perusahaan.',
        cta: 'Mulai Trial',
        features: [
            'Maksimal 10 karyawan',
            'Masa trial 30 hari',
            'Fitur operasional inti',
            'Portal karyawan',
        ],
        lockedFeatures: ['Rekrutmen', 'Kasbon', 'Asset Management'],
    },
    {
        name: 'Basic',
        price: currency.format(PRICE_BASIC),
        period: '/karyawan/bulan',
        description:
            'Untuk perusahaan yang ingin menjalankan administrasi dan payroll dalam satu sistem.',
        cta: 'Pilih Basic',
        features: basicFeatures,
        lockedFeatures: ['Rekrutmen', 'Kasbon', 'Asset Management'],
    },
    {
        name: 'Plus',
        price: currency.format(PRICE_PLUS),
        period: '/karyawan/bulan',
        description:
            'Untuk tim yang membutuhkan alur HR lengkap, dari rekrutmen sampai pengelolaan aset.',
        cta: 'Pilih Plus',
        features: plusFeatures,
        recommended: true,
    },
];

const faqs: Faq[] = [
    {
        question: 'Apa yang bisa dicoba selama masa trial?',
        answer: 'Trial memberi akses ke fitur operasional inti Humi untuk maksimal 10 karyawan selama 30 hari. Tim Anda bisa menilai alur data karyawan, kehadiran, jadwal, cuti, lembur, notifikasi, survey, dan portal karyawan.',
    },
    {
        question: 'Berapa lama proses setup Humi?',
        answer: 'Waktu setup mengikuti jumlah karyawan, kelengkapan data, dan aturan kerja perusahaan. Tim Humi membantu menyiapkan struktur awal agar proses import dan konfigurasi lebih terarah.',
    },
    {
        question: 'Apakah data karyawan lama bisa diimpor?',
        answer: 'Bisa. Data karyawan dapat disiapkan dari file Excel, lalu diperiksa kembali sebelum digunakan sebagai basis data operasional di Humi.',
    },
    {
        question: 'Apakah Humi cocok untuk bisnis dengan sistem shift?',
        answer: 'Ya. Humi mendukung jadwal dan pola kerja yang dibutuhkan operasional outsourcing, retail dan F&B, serta manufaktur shift.',
    },
    {
        question: 'Apa yang terjadi setelah trial selesai?',
        answer: 'Anda dapat memilih paket Basic atau Plus sesuai modul yang dibutuhkan. Invoice dibuat setelah konfirmasi, sehingga pilihan paket tetap berada di tangan perusahaan.',
    },
];

function WorkflowStep({
    step,
    isLast,
}: {
    step: WorkflowStepData;
    isLast: boolean;
}) {
    return (
        <li className="relative min-w-0 pb-8 last:pb-0 md:pb-0">
            {!isLast ? (
                <span
                    className="absolute top-12 bottom-0 left-5 w-px bg-[var(--landing-color-rule)] md:top-5 md:right-0 md:bottom-auto md:left-12 md:h-px md:w-auto"
                    aria-hidden="true"
                />
            ) : null}
            <div className="relative flex min-w-0 gap-4 md:block md:pr-8">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] text-xs font-semibold text-[var(--landing-color-accent)]">
                    {step.marker}
                </div>
                <div className="min-w-0 md:mt-8">
                    <step.icon
                        className="hidden size-5 text-[var(--landing-color-accent)] md:block"
                        aria-hidden="true"
                    />
                    <h3 className="text-base font-semibold text-[var(--landing-color-ink)] md:mt-4">
                        {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--landing-color-ink-soft)]">
                        {step.description}
                    </p>
                </div>
            </div>
        </li>
    );
}

function ProductWorkbench() {
    const [activeAreaId, setActiveAreaId] =
        useState<ProductArea['id']>('employees');
    const activeArea =
        productAreas.find((area) => area.id === activeAreaId) ??
        productAreas[0];

    return (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-10">
            <div
                className="grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-1"
                aria-label="Area produk Humi"
            >
                {productAreas.map((area) => {
                    const isActive = activeArea.id === area.id;

                    return (
                        <button
                            key={area.id}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setActiveAreaId(area.id)}
                            className={
                                isActive
                                    ? 'flex min-h-14 min-w-0 items-center gap-3 rounded-[var(--landing-radius-card)] bg-[var(--landing-color-ink)] px-3 py-3 text-left text-[var(--landing-color-paper)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4'
                                    : 'flex min-h-14 min-w-0 items-center gap-3 rounded-[var(--landing-radius-card)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] px-3 py-3 text-left text-[var(--landing-color-ink)] transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none sm:px-4'
                            }
                        >
                            <area.icon
                                className="size-5 shrink-0"
                                aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold sm:text-sm">
                                {area.label}
                            </span>
                            {isActive ? (
                                <span className="hidden text-xs font-medium whitespace-nowrap opacity-70 sm:inline">
                                    Aktif
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>

            <div
                aria-live="polite"
                className="min-w-0 rounded-[var(--landing-radius-panel)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-5 shadow-[var(--landing-shadow-panel)] sm:p-8"
            >
                <div className="flex flex-col gap-6 border-b border-[var(--landing-color-rule)] pb-8 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex size-11 items-center justify-center rounded-[var(--landing-radius-card)] bg-[var(--landing-color-accent-soft)] text-[var(--landing-color-accent)]">
                            <activeArea.icon
                                className="size-5"
                                aria-hidden="true"
                            />
                        </div>
                        <h3 className="mt-6 max-w-xl text-[length:var(--landing-text-2xl)] leading-tight font-semibold tracking-[-0.025em] [overflow-wrap:anywhere] text-[var(--landing-color-ink)]">
                            {activeArea.title}
                        </h3>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--landing-color-ink-soft)] sm:text-base">
                            {activeArea.description}
                        </p>
                    </div>
                    <span className="inline-flex min-h-9 w-fit items-center gap-2 rounded-[var(--landing-radius-control)] bg-[var(--landing-color-accent-soft)] px-3 text-xs font-semibold whitespace-nowrap text-[var(--landing-color-accent)]">
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                        {activeArea.status}
                    </span>
                </div>

                <div className="mt-8 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                    {activeArea.facts.map((fact, index) => (
                        <div
                            key={fact}
                            className="min-w-0 rounded-[var(--landing-radius-card)] bg-[var(--landing-color-surface-soft)] p-4"
                        >
                            <span className="text-xs font-semibold text-[var(--landing-color-accent)]">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <p className="mt-5 text-sm leading-6 font-medium text-[var(--landing-color-ink)]">
                                {fact}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function IndustrySolution({ solution }: { solution: IndustrySolutionData }) {
    return (
        <Link
            href={solution.href}
            className="group grid min-w-0 gap-5 border-t border-[var(--landing-color-rule)] py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-color-focus)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
        >
            <solution.icon
                className="size-6 text-[var(--landing-color-accent)]"
                aria-hidden="true"
            />
            <div className="min-w-0">
                <h3 className="text-lg font-semibold text-[var(--landing-color-ink)]">
                    {solution.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--landing-color-ink-soft)]">
                    {solution.description}
                </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap text-[var(--landing-color-accent)]">
                {solution.cta}
                <ArrowRight
                    className="size-4 transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                    aria-hidden="true"
                />
            </span>
        </Link>
    );
}

function PlanFeatures({
    plan,
    compact = false,
}: {
    plan: PricingPlanData;
    compact?: boolean;
}) {
    const visibleFeatures = compact ? plan.features.slice(0, 4) : plan.features;

    return (
        <ul className="mt-6 grid gap-3">
            {visibleFeatures.map((feature) => (
                <li
                    key={feature}
                    className={
                        plan.recommended
                            ? 'flex items-start gap-3 text-sm text-white'
                            : 'flex items-start gap-3 text-sm text-[var(--landing-color-ink-soft)]'
                    }
                >
                    <Check
                        className={
                            plan.recommended
                                ? 'mt-0.5 size-4 shrink-0 text-white'
                                : 'mt-0.5 size-4 shrink-0 text-[var(--landing-color-accent)]'
                        }
                        aria-hidden="true"
                    />
                    <span>{feature}</span>
                </li>
            ))}
            {plan.lockedFeatures?.slice(0, compact ? 1 : 3).map((feature) => (
                <li
                    key={feature}
                    className={
                        plan.recommended
                            ? 'flex items-start gap-3 text-sm text-white/70'
                            : 'flex items-start gap-3 text-sm text-[var(--landing-color-muted)]'
                    }
                >
                    <ShieldCheck
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                    />
                    <span>{feature} tersedia di Plus</span>
                </li>
            ))}
        </ul>
    );
}

function PricingPlan({
    plan,
    trialHref,
    compact = false,
}: {
    plan: PricingPlanData;
    trialHref: string;
    compact?: boolean;
}) {
    return (
        <article
            className={
                plan.recommended
                    ? 'flex h-full min-w-0 flex-col rounded-[var(--landing-radius-panel)] bg-[var(--landing-color-ink)] p-6 text-white shadow-[var(--landing-shadow-panel)] sm:p-8'
                    : 'flex h-full min-w-0 flex-col border-t border-[var(--landing-color-rule)] py-6 first:border-t-0 lg:first:border-t'
            }
        >
            <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                {plan.recommended ? (
                    <span className="inline-flex min-h-8 items-center rounded-[var(--landing-radius-control)] bg-[var(--landing-color-accent-soft)] px-3 text-xs font-semibold whitespace-nowrap text-[var(--landing-color-accent)]">
                        Rekomendasi
                    </span>
                ) : null}
            </div>
            <p
                className={
                    plan.recommended
                        ? 'mt-3 max-w-xl text-sm leading-6 text-white/70'
                        : 'mt-3 max-w-xl text-sm leading-6 text-[var(--landing-color-ink-soft)]'
                }
            >
                {plan.description}
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-x-2 gap-y-1 tabular-nums">
                <span className="text-3xl font-semibold tracking-[-0.04em]">
                    {plan.price}
                </span>
                {plan.period ? (
                    <span
                        className={
                            plan.recommended
                                ? 'pb-1 text-xs text-white/70'
                                : 'pb-1 text-xs text-[var(--landing-color-muted)]'
                        }
                    >
                        {plan.period}
                    </span>
                ) : null}
            </div>

            <div className={plan.recommended ? 'flex-1' : undefined}>
                <PlanFeatures plan={plan} compact={compact} />
            </div>

            <Link
                href={trialHref}
                className={
                    plan.recommended
                        ? 'mt-8 inline-flex min-h-11 items-center justify-center rounded-[var(--landing-radius-control)] bg-[var(--landing-color-paper)] px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-[var(--landing-color-ink)] transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] active:translate-y-0 aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none'
                        : `${landingSecondaryActionClass} mt-8`
                }
            >
                {plan.cta}
            </Link>
        </article>
    );
}

function FaqItem({ faq }: { faq: Faq }) {
    return (
        <details className="group border-t border-[var(--landing-color-rule)]">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-semibold text-[var(--landing-color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <ChevronDown
                    className="size-5 shrink-0 transition-transform duration-[var(--landing-duration-state)] ease-[var(--landing-ease-in-out)] group-open:rotate-180 motion-reduce:transform-none motion-reduce:transition-none"
                    aria-hidden="true"
                />
            </summary>
            <p className="max-w-3xl pb-6 text-sm leading-7 text-[var(--landing-color-ink-soft)] sm:text-base">
                {faq.answer}
            </p>
        </details>
    );
}

export default function Welcome({ canRegister = true }: WelcomeProps) {
    const { auth, appUrl } = usePage().props as {
        auth: { user?: unknown };
        appUrl: string;
    };
    const siteUrl = appUrl.replace(/\/$/, '');
    const hasUser = Boolean(auth.user);
    const trialHref = hasUser
        ? dashboard().url
        : canRegister
          ? register().url
          : login().url;
    const trialLabel = hasUser ? 'Buka Dashboard' : 'Mulai Trial Gratis';

    const structuredData = [
        {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Humi',
            url: siteUrl,
            logo: `${siteUrl}/humi-wordmark.png`,
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'sales',
                telephone: '+62-857-1099-9144',
                availableLanguage: ['id'],
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Humi HRIS',
            url: siteUrl,
            inLanguage: 'id-ID',
        },
        {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Humi HRIS',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            url: siteUrl,
            image: `${siteUrl}/icons/icon-512.png`,
            description: SEO_DESCRIPTION,
            offers: {
                '@type': 'Offer',
                price: String(PRICE_BASIC),
                priceCurrency: 'IDR',
                category: 'subscription',
            },
            featureList: productAreas.map((area) => area.label),
        },
    ];

    return (
        <>
            <SeoHead
                title={SEO_TITLE}
                description={SEO_DESCRIPTION}
                keywords={SEO_KEYWORDS}
                canonicalPath="/"
                structuredData={structuredData}
            />

            <div className="min-h-screen overflow-x-clip bg-[var(--landing-color-paper)] font-[family-name:var(--landing-font-body)] text-[var(--landing-color-ink)]">
                <LandingNav hasUser={hasUser} trialHref={trialHref} />

                <main>
                    <section className="pt-24 pb-14 sm:pt-28 sm:pb-20">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8">
                            <div className="mx-auto max-w-6xl text-center">
                                <h1
                                    className={`mx-auto max-w-none whitespace-nowrap ${frontHeroTitleClass}`}
                                >
                                    Kelola tim Anda{' '}
                                    <span className={frontHeroTealTextClass}>
                                        dengan lebih sederhana
                                    </span>
                                </h1>
                                <p
                                    className={`mx-auto mt-6 max-w-3xl ${frontHeroSubtitleClass}`}
                                >
                                    Humi adalah HRIS terpadu untuk perusahaan
                                    modern. Otomatisasi absensi, cuti, payroll,
                                    dan approval dalam satu platform yang mudah
                                    digunakan.
                                </p>
                                <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Link
                                        href={trialHref}
                                        className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[var(--landing-color-accent)] px-8 text-lg font-bold text-[var(--landing-color-accent-ink)] transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
                                    >
                                        {trialLabel}
                                        <ArrowRight
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                    <a
                                        href="#solutions"
                                        className="inline-flex min-h-14 items-center justify-center rounded-full border border-[var(--landing-color-rule)] bg-white px-8 text-lg font-bold text-[var(--landing-color-ink-soft)] transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px hover:text-[var(--landing-color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
                                    >
                                        Lihat Solusi
                                    </a>
                                </div>
                            </div>

                            <div className="mx-auto mt-16 grid max-w-5xl gap-8 border-t border-[var(--landing-color-rule)] pt-8 text-center md:grid-cols-3">
                                <div>
                                    <p className="text-4xl font-bold text-[var(--landing-color-accent)] sm:text-5xl">
                                        70%
                                    </p>
                                    <p className="mt-3 text-lg text-[var(--landing-color-muted)]">
                                        Efisiensi proses HR
                                    </p>
                                </div>
                                <div>
                                    <p className="text-4xl font-bold text-[var(--landing-color-accent)] sm:text-5xl">
                                        &lt; 10 mnt
                                    </p>
                                    <p className="mt-3 text-lg text-[var(--landing-color-muted)]">
                                        Waktu proses payroll
                                    </p>
                                </div>
                                <div>
                                    <p className="text-4xl font-bold text-[var(--landing-color-accent)] sm:text-5xl">
                                        99.9%
                                    </p>
                                    <p className="mt-3 text-lg text-[var(--landing-color-muted)]">
                                        Akurasi data
                                    </p>
                                </div>
                            </div>

                            <div className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-[2%] border border-[var(--landing-color-rule)] shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
                                <img
                                    src="/humi-dashboard-preview.webp"
                                    width={2000}
                                    height={1250}
                                    alt="Preview dashboard Humi"
                                    className="w-full object-cover"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-[var(--landing-color-surface)] py-20 sm:py-24">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8">
                            <header className="max-w-3xl pb-12 sm:pb-16">
                                <h2 className="text-[length:var(--landing-text-display-small)] leading-tight font-semibold tracking-[-0.035em] [overflow-wrap:anywhere] text-[var(--landing-color-ink)]">
                                    Satu alur dari data karyawan sampai payroll.
                                </h2>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--landing-color-ink-soft)]">
                                    Humi menjaga proses HR tetap terhubung,
                                    sehingga tim tidak perlu menyusun ulang data
                                    yang sama di setiap tahap.
                                </p>
                            </header>

                            <ol className="grid min-w-0 gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                                {workflowSteps.map((step, index) => (
                                    <WorkflowStep
                                        key={step.marker}
                                        step={step}
                                        isLast={
                                            index === workflowSteps.length - 1
                                        }
                                    />
                                ))}
                            </ol>
                        </div>
                    </section>

                    <section id="product" className="py-20 sm:py-28">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8">
                            <header className="max-w-3xl pb-12 sm:pb-16">
                                <h2 className="text-[length:var(--landing-text-display-small)] leading-tight font-semibold tracking-[-0.035em] [overflow-wrap:anywhere] text-[var(--landing-color-ink)]">
                                    Buka satu area. Lihat hubungannya dengan
                                    area lain.
                                </h2>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--landing-color-ink-soft)]">
                                    Pilih bagian produk untuk melihat bagaimana
                                    Humi menyimpan konteks dari aktivitas harian
                                    hingga penggajian.
                                </p>
                            </header>

                            <ProductWorkbench />
                        </div>
                    </section>

                    <section
                        id="solutions"
                        className="bg-[var(--landing-color-surface)] py-20 sm:py-28"
                    >
                        <div className="mx-auto grid max-w-7xl min-w-0 gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
                            <header className="min-w-0 lg:pt-6">
                                <h2 className="text-[length:var(--landing-text-display-small)] leading-tight font-semibold tracking-[-0.035em] [overflow-wrap:anywhere] text-[var(--landing-color-ink)]">
                                    Dibentuk untuk operasional yang berbeda.
                                </h2>
                                <p className="mt-5 max-w-xl text-base leading-7 text-[var(--landing-color-ink-soft)]">
                                    Pilih konteks perusahaan untuk melihat alur
                                    Humi yang paling relevan dengan cara tim
                                    Anda bekerja.
                                </p>
                            </header>

                            <div className="min-w-0">
                                {industrySolutions.map((solution) => (
                                    <IndustrySolution
                                        key={solution.href}
                                        solution={solution}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="pricing" className="py-20 sm:py-28">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8">
                            <header className="max-w-3xl pb-12 sm:pb-16">
                                <h2 className="text-[length:var(--landing-text-display-small)] leading-tight font-semibold tracking-[-0.035em] [overflow-wrap:anywhere] text-[var(--landing-color-ink)]">
                                    Mulai kecil. Tambah modul saat dibutuhkan.
                                </h2>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--landing-color-ink-soft)]">
                                    Coba alur inti lebih dulu, lalu pilih paket
                                    berdasarkan kebutuhan operasional tim.
                                </p>
                            </header>

                            <div className="grid min-w-0 items-stretch gap-6 md:grid-cols-3">
                                {pricingPlans.map((plan) => (
                                    <PricingPlan
                                        key={plan.name}
                                        plan={plan}
                                        trialHref={trialHref}
                                        compact={plan.name !== 'Plus'}
                                    />
                                ))}
                            </div>

                            <p className="mt-8 text-xs leading-6 text-[var(--landing-color-muted)]">
                                Harga belum termasuk PPN. Pembayaran melalui
                                transfer bank dan invoice dibuat setelah
                                konfirmasi.
                            </p>
                        </div>
                    </section>

                    <section className="bg-[var(--landing-color-surface)] py-20 sm:py-28">
                        <div className="mx-auto grid max-w-7xl min-w-0 gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
                            <header className="min-w-0">
                                <h2 className="text-[length:var(--landing-text-display-small)] leading-tight font-semibold tracking-[-0.035em] [overflow-wrap:anywhere] text-[var(--landing-color-ink)]">
                                    Pertanyaan sebelum memulai.
                                </h2>
                                <p className="mt-5 max-w-lg text-base leading-7 text-[var(--landing-color-ink-soft)]">
                                    Jawaban singkat tentang trial, setup, import
                                    data, dan penggunaan Humi untuk sistem kerja
                                    shift.
                                </p>
                            </header>

                            <div className="min-w-0 border-b border-[var(--landing-color-rule)]">
                                {faqs.map((faq) => (
                                    <FaqItem key={faq.question} faq={faq} />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-20 sm:py-28">
                        <div className="mx-auto max-w-5xl px-5 sm:px-8">
                            <div className="rounded-[var(--landing-radius-panel)] bg-[var(--landing-color-ink)] px-6 py-10 text-[var(--landing-color-paper)] sm:px-10 sm:py-14">
                                <h2 className="max-w-[18ch] text-[length:var(--landing-text-display-small)] leading-tight font-semibold tracking-[-0.035em] [overflow-wrap:anywhere]">
                                    Siapkan operasi HR yang bisa ditelusuri dari
                                    awal sampai payroll.
                                </h2>
                                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                                    <Link
                                        href={trialHref}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--landing-radius-control)] bg-[var(--landing-color-paper)] px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-[var(--landing-color-ink)] transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-color-focus)] active:translate-y-0 aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none"
                                    >
                                        {trialLabel}
                                        <ArrowRight
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                    <a
                                        href={WHATSAPP_CONTACT_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex min-h-11 items-center text-sm font-semibold whitespace-nowrap text-[var(--landing-color-paper)] underline decoration-[var(--landing-color-paper)]/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-color-focus)] aria-disabled:pointer-events-none aria-disabled:opacity-50"
                                    >
                                        Diskusikan kebutuhan via WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

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
                                <p className="mt-6 max-w-[16ch] text-4xl leading-[1.05] font-semibold tracking-[-0.045em] [overflow-wrap:anywhere] sm:text-6xl">
                                    Data yang sama. Keputusan yang lebih mudah.
                                </p>
                                <p className="mt-6 max-w-[36ch] text-sm leading-6 text-[var(--landing-color-paper)]/70">
                                    Satukan operasi HR harian dalam satu sistem
                                    yang rapi, mudah ditelusuri, dan siap
                                    digunakan tim.
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
                                        <a
                                            href="#product"
                                            className="whitespace-nowrap hover:text-[var(--landing-color-accent)]"
                                        >
                                            Produk
                                        </a>
                                        <Link
                                            href="/features"
                                            className="whitespace-nowrap hover:text-[var(--landing-color-accent)]"
                                        >
                                            Fitur
                                        </Link>
                                        <a
                                            href="#pricing"
                                            className="whitespace-nowrap hover:text-[var(--landing-color-accent)]"
                                        >
                                            Harga
                                        </a>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold tracking-[0.14em] text-[var(--landing-color-accent)] uppercase">
                                        Jelajahi
                                    </p>
                                    <div className="mt-5 grid gap-3 text-sm font-medium text-[var(--landing-color-paper)]">
                                        <a
                                            href="#solutions"
                                            className="whitespace-nowrap hover:text-[var(--landing-color-accent)]"
                                        >
                                            Solusi
                                        </a>
                                        <Link
                                            href="/berita"
                                            className="whitespace-nowrap hover:text-[var(--landing-color-accent)]"
                                        >
                                            Berita
                                        </Link>
                                        <Link
                                            href="/careers"
                                            className="whitespace-nowrap hover:text-[var(--landing-color-accent)]"
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
                                            href={trialHref}
                                            className="whitespace-nowrap hover:text-[var(--landing-color-accent)]"
                                        >
                                            {trialLabel}
                                        </Link>
                                        <Link
                                            href="/contact"
                                            className="whitespace-nowrap hover:text-[var(--landing-color-accent)]"
                                        >
                                            Kontak kami
                                        </Link>
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
