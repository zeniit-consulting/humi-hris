import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Banknote,
    Building2,
    Calculator,
    CalendarCheck,
    CalendarClock,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock,
    Database,
    Download,
    FileSpreadsheet,
    FileText,
    Fingerprint,
    HelpCircle,
    Laptop,
    Layers,
    Lock,
    MapPin,
    MessageCircle,
    PhoneCall,
    ReceiptText,
    RefreshCw,
    Server,
    Shield,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Star,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { useId, useMemo, useState } from 'react';
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
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';

type SoftwareHrisPageProps = {
    canRegister?: boolean;
};

type SharedProps = {
    auth: { user?: unknown };
    appUrl?: string;
};

const WHATSAPP_PHONE = '6285710999144';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    'Halo Humi, saya tertarik untuk demo dan konsultasi Software HRIS Indonesia untuk perusahaan saya.',
)}`;

const PRICE_BASIC = 2900;
const PRICE_PLUS = 7500;

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

export default function SoftwareHrisLandingPage({
    canRegister = true,
}: SoftwareHrisPageProps) {
    const { auth, appUrl = '' } = usePage<SharedProps>().props;
    const hasUser = Boolean(auth?.user);
    const trialHref = hasUser ? dashboard().url : register().url;

    const [activeModule, setActiveModule] = useState(0);
    const [employeeCount, setEmployeeCount] = useState(35);
    const [planSelected, setPlanSelected] = useState<'basic' | 'plus'>('plus');
    const sliderId = useId();

    // Kalkulasi ROI & Penghematan
    const humiMonthlyCost = useMemo(() => {
        const rate = planSelected === 'basic' ? PRICE_BASIC : PRICE_PLUS;
        return employeeCount * rate;
    }, [employeeCount, planSelected]);

    const manualEstimatedCost = useMemo(() => {
        // Estimasi biaya manual: kertas slip gaji, lembur rekap absen HR, error kalkulasi lembur, biaya mesin fingerprint & maintain
        return Math.max(employeeCount * 28000, 350000);
    }, [employeeCount]);

    const monthlySavings = useMemo(() => {
        return Math.max(manualEstimatedCost - humiMonthlyCost, 0);
    }, [manualEstimatedCost, humiMonthlyCost]);

    const yearlySavings = useMemo(() => {
        return monthlySavings * 12;
    }, [monthlySavings]);

    const savingsPercentage = useMemo(() => {
        if (manualEstimatedCost <= 0) return 0;
        return Math.round((monthlySavings / manualEstimatedCost) * 100);
    }, [monthlySavings, manualEstimatedCost]);

    // Modul Lengkap HRIS
    const modules = [
        {
            id: 'attendance',
            name: 'Absensi Online GPS & Selfie',
            shortDesc: 'Validasi kehadiran anti-fake GPS dan anti-titip absen',
            icon: Fingerprint,
            badge: 'Akurasi Tinggi',
            headline: 'Presensi Online GPS & Face Recognition Anti-Fraud',
            description:
                'Karyawan clock-in dan clock-out langsung dari smartphone dengan verifikasi titik koordinat geofencing dan swafoto. Dilengkapi proteksi anti-fake GPS dan validasi foto anti-blank.',
            bullets: [
                'Geofencing presisi radius meter di kantor, proyek, atau outlet',
                'Kamera selfie dengan validasi foto kehadiran real-time',
                'Toleransi keterlambatan dan otomatisasi jam lembur',
                'Dukungan absensi mobile PWA responsif tanpa instalasi memori berat',
            ],
            mockData: {
                title: 'Live Attendance Monitor',
                stat1: '98.5%',
                stat1Label: 'Tepat Waktu Hari Ini',
                stat2: '0 Fraud',
                stat2Label: 'Fake GPS Terdeteksi',
            },
        },
        {
            id: 'payroll',
            name: 'Payroll & Slip Gaji Online',
            shortDesc: 'Hitung gaji, lembur, BPJS, dan PPh 21 otomatis 1-klik',
            icon: Banknote,
            badge: 'Regulasi Resmi',
            headline: 'Perhitungan Gaji Otomatis Sesuai Regulasi Indonesia',
            description:
                'Otomatisasi kalkulasi gaji pokok, tunjangan variabel, potongan keterlambatan, lembur, kasbon, BPJS Ketenagakerjaan/Kesehatan, dan PPh 21 TER dengan akurasi 100%.',
            bullets: [
                'Kalkulasi PPh 21 TER (Tarif Efektif Rata-rata) dan BPJS otomatis',
                'Pemotongan otomatis kasbon karyawan & denda keterlambatan',
                'Generate slip gaji digital berpassword dikirim otomatis ke portal karyawan',
                'Export format transfer bank massal (BCA, Mandiri, BRI, BNI)',
            ],
            mockData: {
                title: 'Payroll Run Summary',
                stat1: '100%',
                stat1Label: 'Kesesuaian Formula Pajak',
                stat2: '< 10 Mnt',
                stat2Label: 'Waktu Generate 100+ Gaji',
            },
        },
        {
            id: 'schedule',
            name: 'Manajemen Shift & Roster',
            shortDesc: 'Jadwal shift bergilir matriks horizontal & tukar shift',
            icon: CalendarClock,
            badge: 'Fleksibel 24/7',
            headline: 'Pengaturan Shift Kerja Dinamis & Matriks Kalender',
            description:
                'Atur roster kerja 24 jam untuk manufaktur, retail, atau rumah sakit dengan tampilan matriks horizontal bulanan dan mingguan. Karyawan dapat mengajukan tukar shift mandiri.',
            bullets: [
                'Tampilan visual matriks horizontal per nama karyawan dan tanggal',
                'Filter tampilan fleksibel per bulan dan per minggu dengan navigator instan',
                'Impor jadwal kerja massal lewat template Excel dalam hitungan detik',
                'Approval berjenjang untuk permintaan perubahan shift antar karyawan',
            ],
            mockData: {
                title: 'Schedule Roster Engine',
                stat1: '3 Shift',
                stat1Label: 'Pagi / Siang / Malam',
                stat2: '1-Klik',
                stat2Label: 'Impor Excel Bulanan',
            },
        },
        {
            id: 'leaves',
            name: 'Cuti, Izin & Lembur',
            shortDesc: 'Pengajuan cuti dan lembur paperless dengan approval cepat',
            icon: CalendarCheck,
            badge: 'Paperless',
            headline: 'Sistem Pengajuan & Approval Bebas Kertas',
            description:
                'Hilangkan formulir fisik. Karyawan mengajukan cuti tahunan, sakit, izin khusus, dan lembur dari ponsel; atasan menyetujui langsung lewat portal atau notifikasi WhatsApp.',
            bullets: [
                'Saldo cuti otomatis berkurang saat pengajuan disetujui',
                'Pengingat kuota cuti bersama dan sinkronisasi libur nasional',
                'Form pengajuan lembur terintegrasi langsung dengan komponen payroll',
                'Alur approval multi-level (Supervisor, Manager, HRD)',
            ],
            mockData: {
                title: 'Leave & Overtime Workflow',
                stat1: '0 Menit',
                stat1Label: 'Waktu Cari Arsip Fisik',
                stat2: '100%',
                stat2Label: 'Riwayat Tercatat Rapi',
            },
        },
        {
            id: 'database',
            name: 'Database Karyawan Digital',
            shortDesc: 'Pusat data personalia, kontrak kerja, dan dokumen KTP/BPJS',
            icon: Database,
            badge: 'Tersentralisasi',
            headline: 'Single Source of Truth Data Personalia Perusahaan',
            description:
                'Simpan seluruh biodata karyawan, riwayat kontrak kerja, keluarga, dokumen KTP/NPWP/BPJS, divisi, jabatan, serta rekam jejak karir dalam satu sistem cloud terenkripsi.',
            bullets: [
                'Notifikasi otomatis saat kontrak kerja karyawan (PKWT) akan berakhir',
                'Penyimpanan digital dokumen penting dengan enkripsi aman',
                'Manajemen status kerja aktif, probation, magang, hingga resign',
                'Pencarian kilat berdasarkan nama, NIK, divisi, atau status',
            ],
            mockData: {
                title: 'Employee Master Database',
                stat1: '256-bit',
                stat1Label: 'Enkripsi Data Cloud',
                stat2: 'Real-time',
                stat2Label: 'Pembaruan Data Profil',
            },
        },
        {
            id: 'portal',
            name: 'Portal Karyawan (ESS)',
            shortDesc: 'Employee Self Service untuk cek slip, saldo cuti, dan kasbon',
            icon: Smartphone,
            badge: 'Mandiri (ESS)',
            headline: 'Karyawan Lebih Mandiri Tanpa Bebani Tim HR',
            description:
                'Beri akses Employee Self Service (ESS) kepada seluruh karyawan melalui mobile web PWA. Karyawan dapat memantau kehadiran, mengunduh slip gaji, dan mengajukan kasbon mandiri.',
            bullets: [
                'Akses privat slip gaji berpassword tanpa perlu antre ke ruangan HR',
                'Pantau riwayat absensi harian dan status pengajuan izin secara live',
                'Pengajuan kasbon transparan dengan jadwal cicilan jelas',
                'Fitur pengumuman perusahaan, survei internal, dan tracker aktivitas',
            ],
            mockData: {
                title: 'Self-Service Mobile Portal',
                stat1: '85%',
                stat1Label: 'Penurunan Pertanyaan ke HR',
                stat2: '24 Jam',
                stat2Label: 'Akses Kapan Saja & Dimana Saja',
            },
        },
        {
            id: 'visits',
            name: 'Kunjungan Klien & Lapangan',
            shortDesc: 'Pantau mobilitas tim sales & lapangan dengan peta lokasi',
            icon: MapPin,
            badge: 'Monitoring Tim',
            headline: 'Pelacakan Aktivitas Tim Lapangan & Kunjungan Klien',
            description:
                'Pantau aktivitas tim sales, teknisi, dan surveyor yang bekerja di luar kantor. Karyawan mencatat kunjungan dengan foto bukti, catatan meeting, dan penanda lokasi kantor vs klien.',
            bullets: [
                'Validasi check-in lokasi klien disertai peta digital interaktif',
                'Penanda khusus lokasi kantor vs lokasi kunjungan klien',
                'Unggah foto bukti pertemuan dan ringkasan hasil kunjungan kerja',
                'Laporan rekap kunjungan real-time untuk evaluasi kinerja',
            ],
            mockData: {
                title: 'Client Visit Tracking',
                stat1: 'GPS Verified',
                stat1Label: 'Validasi Titik Temu',
                stat2: 'Otomatis',
                stat2Label: 'Laporan Rekap Kunjungan',
            },
        },
    ];

    // FAQ List (Schema.org compliant)
    const faqs = [
        {
            q: 'Apa itu Software HRIS dan mengapa penting bagi perusahaan di Indonesia?',
            a: 'Software HRIS (Human Resource Information System) adalah platform perangkat lunak terintegrasi untuk mengelola seluruh fungsi administrasi sumber daya manusia, mulai dari database karyawan, absensi online, pengaturan shift, cuti, lembur, hingga penggajian (payroll). Di Indonesia, HRIS sangat penting untuk menghemat waktu administrasi hingga 85%, menghilangkan kesalahan hitung manual di Excel, serta memastikan kepatuhan terhadap regulasi ketenagakerjaan, BPJS, dan PPh 21 TER.',
        },
        {
            q: 'Bagaimana cara kerja absensi online di Humi agar tidak bisa dimanipulasi?',
            a: 'Humi menggunakan kombinasi validasi geofencing GPS berpresisi tinggi dan verifikasi swafoto (face recognition) langsung dari kamera smartphone. Sistem secara otomatis mendeteksi dan memblokir aplikasi Fake GPS / mock location, serta memastikan foto bukan gambar blank atau tangkapan layar tiruan.',
        },
        {
            q: 'Apakah perhitungan payroll Humi sudah mendukung PPh 21 TER dan BPJS terbaru?',
            a: 'Ya, sistem payroll Humi sudah mengadopsi regulasi perpajakan Indonesia terbaru dengan skema PPh 21 TER (Tarif Efektif Rata-rata) serta komponen BPJS Ketenagakerjaan (JKK, JKM, JHT, JP) dan BPJS Kesehatan sesuai batas plafon upah resmi.',
        },
        {
            q: 'Apakah karyawan harus mengunduh aplikasi berukuran besar di HP mereka?',
            a: 'Tidak. Humi menggunakan teknologi Progressive Web App (PWA) modern yang sangat ringan dan responsif. Karyawan cukup membuka tautan portal lewat browser di iPhone atau Android dan dapat menambahkannya ke layar utama (Add to Home Screen) tanpa menghabiskan memori penyimpanan ponsel.',
        },
        {
            q: 'Apakah software HRIS Humi cocok untuk bisnis kecil, UMKM, dan startup?',
            a: 'Sangat cocok. Humi dirancang dengan biaya yang sangat terjangkau mulai dari Rp2.900 per karyawan/bulan tanpa biaya setup awal atau biaya instalasi server. UMKM dengan 10-30 karyawan dapat langsung menggunakan fitur absensi dan manajemen personalia tanpa beban operasional tinggi.',
        },
        {
            q: 'Bagaimana keamanan dan kerahasiaan data karyawan di Humi?',
            a: 'Keamanan data adalah prioritas utama kami. Humi menerapkan standar enkripsi industri SSL 2048-bit dan AES-256 pada level database. Backup data cloud dilakukan otomatis setiap hari, dan akses informasi dilindungi oleh Role-Based Access Control (RBAC) sehingga hanya pihak berwenang yang dapat melihat data sensitif seperti gaji.',
        },
        {
            q: 'Berapa lama waktu yang dibutuhkan untuk migrasi dari Excel ke Humi?',
            a: 'Proses onboarding sangat cepat! Humi menyediakan template impor Excel untuk data karyawan dan jadwal shift. Perusahaan biasanya sudah siap beroperasi penuh dalam waktu kurang dari 1 hari kerja, dan tim support kami siap mendampingi proses setup awal Anda secara gratis.',
        },
        {
            q: 'Apakah ada masa uji coba (trial) gratis sebelum berlangganan?',
            a: 'Ya, Anda dapat mencoba Humi secara gratis selama 30 hari penuh dengan akses ke seluruh fitur tanpa memerlukan kartu kredit. Anda juga bisa menjadwalkan sesi konsultasi dan demo langsung via WhatsApp dengan tim spesialis HRIS kami.',
        },
    ];

    // Schema.org Structured Data
    const structuredData = [
        {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Humi HRIS',
            operatingSystem: 'All (Web, Android PWA, iOS PWA)',
            applicationCategory: 'BusinessApplication',
            description:
                'Software HRIS Indonesia terbaik berbasis cloud untuk otomatisasi database karyawan, absensi online GPS, manajemen shift, payroll PPh 21, cuti, lembur, dan portal karyawan.',
            offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'IDR',
                lowPrice: '2900',
                highPrice: '7500',
                offerCount: '2',
                priceValidUntil: '2028-12-31',
            },
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '348',
                bestRating: '5',
                worstRating: '1',
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Humi HRIS',
            url: appUrl || 'https://humi.id',
            logo: `${appUrl || 'https://humi.id'}/logo.png`,
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: `+${WHATSAPP_PHONE}`,
                contactType: 'customer support',
                availableLanguage: ['Indonesian', 'English'],
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.a,
                },
            })),
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Beranda',
                    item: appUrl || 'https://humi.id',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Software HRIS Indonesia',
                    item: `${appUrl || 'https://humi.id'}/software-hris`,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[var(--landing-color-paper)] text-[var(--landing-color-ink)] selection:bg-[var(--landing-color-accent)] selection:text-[var(--landing-color-accent-ink)]">
            <SeoHead
                title="Software HRIS Indonesia Terbaik & Terlengkap | Humi HRIS Cloud"
                description="Humi adalah software HRIS Indonesia terbaik berbasis cloud untuk otomatisasi database karyawan, absensi selfie GPS, kalkulasi payroll & PPh 21, cuti, lembur, dan ESS portal. Coba gratis 30 hari!"
                keywords="software hris indonesia, aplikasi hris terbaik, sistem hris cloud, software payroll indonesia, aplikasi absensi online gps, aplikasi manajemen karyawan, employee self service indonesia, software hris umkm enterprise, software absensi pwa"
                canonicalPath="/software-hris"
                image="/og-image.png"
                structuredData={structuredData}
            />

            {/* Top Announcement Bar */}
            <aside
                aria-label="Pengumuman promo"
                className="bg-[var(--landing-color-accent)] px-4 py-2 text-center text-xs font-semibold text-[var(--landing-color-accent-ink)]"
            >
                <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
                    <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>
                        Promo Spesial 2026: Coba Gratis 30 Hari Tanpa Kartu Kredit + Pendampingan Setup Awal Database Karyawan.
                    </span>
                    <Link
                        href={trialHref}
                        className="underline decoration-1 underline-offset-2 hover:opacity-90 font-bold ml-1 hidden sm:inline"
                    >
                        Daftar Sekarang &rarr;
                    </Link>
                </div>
            </aside>

            {/* Navigation Header */}
            <LandingNav hasUser={hasUser} trialHref={trialHref} />

            <main className="relative pt-24 sm:pt-28">
                {/* 1. HERO SECTION */}
                <section
                    aria-labelledby="hero-title"
                    className="relative overflow-hidden px-5 py-12 sm:px-8 sm:py-20 lg:py-24"
                >
                    {/* Background Gradients */}
                    <div
                        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,var(--landing-color-accent-soft)_0%,transparent_70%)] opacity-70 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="mx-auto max-w-7xl">
                        {/* Breadcrumbs */}
                        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[var(--landing-color-muted)]">
                            <Link href="/" className="hover:text-[var(--landing-color-accent)] transition-colors">
                                Beranda
                            </Link>
                            <span>/</span>
                            <span className="text-[var(--landing-color-ink)] font-medium">Software HRIS Indonesia</span>
                        </nav>

                        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--landing-color-accent)]/30 bg-[var(--landing-color-accent-soft)] px-3.5 py-1 text-xs font-semibold text-[var(--landing-color-accent)] shadow-xs">
                                    <Award className="size-3.5" aria-hidden="true" />
                                    <span>#1 Software HRIS Cloud Indonesia Berstandar Resmi</span>
                                </div>

                                <h1 id="hero-title" className={cn(frontHeroTitleClass, 'mt-5')}>
                                    Software HRIS Indonesia Terbaik untuk Kelola Karyawan,{' '}
                                    <span className={frontHeroTealTextClass}>Absensi GPS &amp; Payroll</span> Otomatis
                                </h1>

                                <p className={cn(frontHeroSubtitleClass, 'mt-6 max-w-2xl')}>
                                    Satukan seluruh operasi Human Resource dalam satu platform cloud yang modern, aman, dan mudah digunakan. Dari absensi anti-fake GPS, manajemen roster shift fleksibel, hingga payroll 1-klik yang otomatis memotong BPJS dan PPh 21 TER.
                                </p>

                                {/* CTAs */}
                                <div className="mt-8 flex flex-wrap items-center gap-3">
                                    <Link
                                        href={trialHref}
                                        className={cn(landingPrimaryActionClass, 'text-base px-7 py-3')}
                                    >
                                        Mulai Coba Gratis 30 Hari
                                        <ArrowRight className="size-4" aria-hidden="true" />
                                    </Link>
                                    <a
                                        href={WHATSAPP_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(landingSecondaryActionClass, 'text-base px-6 py-3')}
                                    >
                                        <MessageCircle className="size-4 text-emerald-600" aria-hidden="true" />
                                        Konsultasi Demo WhatsApp
                                    </a>
                                </div>

                                {/* Trust Value Badges */}
                                <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 border-t border-[var(--landing-color-rule)] pt-6 text-xs text-[var(--landing-color-ink-soft)]">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                        <span>Gratis setup 30 karyawan pertama</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="size-4 text-[var(--landing-color-accent)] shrink-0" aria-hidden="true" />
                                        <span>Kepatuhan PPh 21 &amp; BPJS terkini</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="size-4 text-sky-600 shrink-0" aria-hidden="true" />
                                        <span>Mobile PWA tanpa install memori berat</span>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Interactive Preview Card */}
                            <div className="relative">
                                <div className="relative overflow-hidden rounded-2xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-6 shadow-2xl">
                                    <div className="flex items-center justify-between border-b border-[var(--landing-color-rule)] pb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="size-3 rounded-full bg-rose-500" aria-hidden="true" />
                                            <span className="size-3 rounded-full bg-amber-500" aria-hidden="true" />
                                            <span className="size-3 rounded-full bg-emerald-500" aria-hidden="true" />
                                            <span className="ml-2 text-xs font-semibold text-[var(--landing-color-muted)]">
                                                Humi HRIS Hub &bull; Cloud Dashboard
                                            </span>
                                        </div>
                                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                            Live System
                                        </span>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="rounded-xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] p-3">
                                                <div className="text-[11px] text-[var(--landing-color-muted)] font-medium">Hadir Hari Ini</div>
                                                <div className="mt-1 text-xl font-bold text-[var(--landing-color-ink)]">98.4%</div>
                                                <div className="text-[10px] text-emerald-600 font-semibold">+2.1% tepat waktu</div>
                                            </div>
                                            <div className="rounded-xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] p-3">
                                                <div className="text-[11px] text-[var(--landing-color-muted)] font-medium">Payroll Siap</div>
                                                <div className="mt-1 text-xl font-bold text-[var(--landing-color-accent)]">100%</div>
                                                <div className="text-[10px] text-sky-600 font-semibold">Tervalidasi BPJS</div>
                                            </div>
                                            <div className="rounded-xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] p-3">
                                                <div className="text-[11px] text-[var(--landing-color-muted)] font-medium">Approval Tertunda</div>
                                                <div className="mt-1 text-xl font-bold text-amber-600">0</div>
                                                <div className="text-[10px] text-muted-foreground font-semibold">Semua disetujui</div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] p-4">
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span>Aktivitas Karyawan Terkini</span>
                                                <span className="text-[10px] text-[var(--landing-color-muted)]">Update otomatis</span>
                                            </div>
                                            <div className="mt-3 space-y-2.5 text-xs">
                                                <div className="flex items-center justify-between rounded-lg bg-[var(--landing-color-surface)] p-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2 rounded-full bg-emerald-500" />
                                                        <span className="font-semibold">Budi Santoso</span>
                                                        <span className="text-muted-foreground text-[11px]">(IT Support)</span>
                                                    </div>
                                                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                                        Clock-in 08:28 (Lokasi Kantor Pusat)
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between rounded-lg bg-[var(--landing-color-surface)] p-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2 rounded-full bg-sky-500" />
                                                        <span className="font-semibold">Siti Rahma</span>
                                                        <span className="text-muted-foreground text-[11px]">(Finance)</span>
                                                    </div>
                                                    <span className="text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                                                        Cuti Tahunan Disetujui
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between rounded-lg bg-[var(--landing-color-surface)] p-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2 rounded-full bg-indigo-500" />
                                                        <span className="font-semibold">Ahmad Fauzi</span>
                                                        <span className="text-muted-foreground text-[11px]">(Sales Area)</span>
                                                    </div>
                                                    <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                                        Check-in Kunjungan Klien PT Maju
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl bg-[var(--landing-color-accent)] p-3.5 text-white">
                                            <div className="flex items-center gap-2.5">
                                                <Zap className="size-5 shrink-0" aria-hidden="true" />
                                                <div>
                                                    <div className="text-xs font-bold">Hemat 85% Waktu Operasional HR</div>
                                                    <div className="text-[10px] text-white/80">Sistem terotomatisasi tanpa input berulang</div>
                                                </div>
                                            </div>
                                            <Link
                                                href={trialHref}
                                                className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--landing-color-accent)] transition-opacity hover:opacity-95"
                                            >
                                                Coba
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. STATS & PROOF METRICS BAR */}
                <section
                    aria-label="Statistik performa Humi HRIS"
                    className="border-y border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] px-5 py-8 sm:px-8"
                >
                    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
                        <div className="text-center sm:text-left">
                            <div className="text-2xl font-bold tracking-tight text-[var(--landing-color-accent)] sm:text-3xl">
                                85%
                            </div>
                            <div className="mt-1 text-xs font-medium text-[var(--landing-color-ink-soft)]">
                                Waktu Administrasi HR Terpangkas
                            </div>
                        </div>
                        <div className="text-center sm:text-left">
                            <div className="text-2xl font-bold tracking-tight text-[var(--landing-color-accent)] sm:text-3xl">
                                100%
                            </div>
                            <div className="mt-1 text-xs font-medium text-[var(--landing-color-ink-soft)]">
                                Akurasi Payroll &amp; Regulasi Pajak
                            </div>
                        </div>
                        <div className="text-center sm:text-left">
                            <div className="text-2xl font-bold tracking-tight text-[var(--landing-color-accent)] sm:text-3xl">
                                Rp2.900
                            </div>
                            <div className="mt-1 text-xs font-medium text-[var(--landing-color-ink-soft)]">
                                Investasi Hemat Mulai per Karyawan/Bln
                            </div>
                        </div>
                        <div className="text-center sm:text-left">
                            <div className="text-2xl font-bold tracking-tight text-[var(--landing-color-accent)] sm:text-3xl">
                                99.9%
                            </div>
                            <div className="mt-1 text-xs font-medium text-[var(--landing-color-ink-soft)]">
                                Server Cloud Uptime Bergaransi
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. CORE HRIS MODULES DEEP DIVE (KEYWORD-RICH) */}
                <section
                    id="features"
                    aria-labelledby="features-heading"
                    className="px-5 py-16 sm:px-8 sm:py-24"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <span className="text-xs font-bold tracking-wider text-[var(--landing-color-accent)] uppercase">
                                Modul Lengkap &amp; Terintegrasi
                            </span>
                            <h2 id="features-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-[var(--landing-color-ink)]">
                                Solusi Software HRIS Terlengkap untuk Perusahaan Modern di Indonesia
                            </h2>
                            <p className="mt-4 text-base text-[var(--landing-color-ink-soft)] leading-relaxed">
                                Didesain khusus untuk menjawab tantangan tata kelola personalia dari perusahaan skala kecil (UMKM), startup teknologi, hingga korporasi multi-cabang dengan ratusan staf.
                            </p>
                        </div>

                        {/* Interactive Feature Tabs */}
                        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12 items-start">
                            {/* Module Selector List */}
                            <div className="flex flex-col gap-2">
                                {modules.map((m, idx) => {
                                    const Icon = m.icon;
                                    const isSelected = activeModule === idx;
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setActiveModule(idx)}
                                            className={cn(
                                                'flex items-start gap-4 rounded-xl p-4 text-left transition-all',
                                                isSelected
                                                    ? 'bg-[var(--landing-color-surface)] border-2 border-[var(--landing-color-accent)] shadow-md'
                                                    : 'hover:bg-[var(--landing-color-surface-soft)] border border-transparent text-[var(--landing-color-ink-soft)]',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'rounded-lg p-2.5 transition-colors',
                                                    isSelected
                                                        ? 'bg-[var(--landing-color-accent)] text-white'
                                                        : 'bg-[var(--landing-color-paper)] text-[var(--landing-color-muted)]',
                                                )}
                                            >
                                                <Icon className="size-5" aria-hidden="true" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={cn('text-sm font-bold', isSelected ? 'text-[var(--landing-color-ink)]' : 'text-inherit')}>
                                                        {m.name}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-[var(--landing-color-accent)] uppercase">
                                                        {m.badge}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-[var(--landing-color-ink-soft)] line-clamp-2">
                                                    {m.shortDesc}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active Module Showcase Card */}
                            <div className="sticky top-28 rounded-2xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-6 sm:p-8 shadow-xl">
                                {(() => {
                                    const active = modules[activeModule];
                                    const Icon = active.icon;
                                    return (
                                        <div>
                                            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--landing-color-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--landing-color-accent)]">
                                                <Icon className="size-4" aria-hidden="true" />
                                                <span>Modul Unggulan: {active.name}</span>
                                            </div>

                                            <h3 className="mt-4 text-2xl font-bold tracking-tight text-[var(--landing-color-ink)]">
                                                {active.headline}
                                            </h3>

                                            <p className="mt-3 text-sm text-[var(--landing-color-ink-soft)] leading-relaxed">
                                                {active.description}
                                            </p>

                                            <div className="mt-6 border-t border-[var(--landing-color-rule)] pt-6">
                                                <h4 className="text-xs font-bold text-[var(--landing-color-ink)] uppercase tracking-wider">
                                                    Keunggulan Utama:
                                                </h4>
                                                <ul className="mt-3 space-y-2.5 text-xs text-[var(--landing-color-ink-soft)]">
                                                    {active.bullets.map((bullet, i) => (
                                                        <li key={i} className="flex items-start gap-2.5">
                                                            <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                                                            <span>{bullet}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Mock visual widget */}
                                            <div className="mt-8 rounded-xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] p-4">
                                                <div className="text-xs font-semibold text-[var(--landing-color-muted)]">
                                                    {active.mockData.title}
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-4">
                                                    <div className="rounded-lg bg-[var(--landing-color-surface)] p-3 border border-[var(--landing-color-rule)]">
                                                        <div className="text-xl font-bold text-[var(--landing-color-accent)]">
                                                            {active.mockData.stat1}
                                                        </div>
                                                        <div className="text-[11px] text-[var(--landing-color-muted)]">
                                                            {active.mockData.stat1Label}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-lg bg-[var(--landing-color-surface)] p-3 border border-[var(--landing-color-rule)]">
                                                        <div className="text-xl font-bold text-emerald-600">
                                                            {active.mockData.stat2}
                                                        </div>
                                                        <div className="text-[11px] text-[var(--landing-color-muted)]">
                                                            {active.mockData.stat2Label}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-[var(--landing-color-rule)]">
                                                <span className="text-xs text-[var(--landing-color-muted)]">
                                                    Siap digunakan dalam 15 menit.
                                                </span>
                                                <Link
                                                    href={trialHref}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--landing-color-accent)] hover:underline"
                                                >
                                                    Coba Modul Ini Gratis
                                                    <ArrowRight className="size-3.5" aria-hidden="true" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. INTERACTIVE ROI & COST SAVING CALCULATOR */}
                <section
                    aria-labelledby="calculator-heading"
                    className="border-y border-[var(--landing-color-rule)] bg-[var(--landing-color-surface-soft)] px-5 py-16 sm:px-8 sm:py-24"
                >
                    <div className="mx-auto max-w-5xl">
                        <div className="text-center">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--landing-color-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--landing-color-accent)]">
                                <Calculator className="size-3.5" aria-hidden="true" />
                                Kalkulator Penghematan Operasional
                            </span>
                            <h2 id="calculator-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Hitung Berapa Biaya &amp; Waktu yang Anda Hemat Bersama Humi
                            </h2>
                            <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--landing-color-ink-soft)] leading-relaxed">
                                Kelola karyawan tanpa beban mesin fingerprint mahal, kertas slip gaji, atau lembur admin HR tiap tanggal gajian.
                            </p>
                        </div>

                        <div className="mt-12 rounded-2xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-6 sm:p-10 shadow-xl">
                            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
                                {/* Left Controls */}
                                <div>
                                    <label htmlFor={sliderId} className="flex items-center justify-between text-sm font-semibold text-[var(--landing-color-ink)]">
                                        <span>Jumlah Karyawan Perusahaan Anda:</span>
                                        <span className="text-xl font-bold text-[var(--landing-color-accent)]">
                                            {employeeCount} Orang
                                        </span>
                                    </label>

                                    <input
                                        id={sliderId}
                                        type="range"
                                        min={10}
                                        max={300}
                                        step={5}
                                        value={employeeCount}
                                        onChange={(e) => setEmployeeCount(Number(e.target.value))}
                                        className="mt-4 w-full accent-[var(--landing-color-accent)] h-2 cursor-pointer bg-[var(--landing-color-paper)] rounded-lg"
                                        aria-label="Slider jumlah karyawan"
                                    />
                                    <div className="mt-1 flex justify-between text-[10px] text-[var(--landing-color-muted)]">
                                        <span>10 Karyawan</span>
                                        <span>100 Karyawan</span>
                                        <span>300+ Karyawan</span>
                                    </div>

                                    {/* Plan Selector */}
                                    <div className="mt-8">
                                        <span className="text-xs font-semibold text-[var(--landing-color-ink)]">Pilihan Paket:</span>
                                        <div className="mt-2.5 grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setPlanSelected('basic')}
                                                className={cn(
                                                    'rounded-xl border p-3 text-left transition-all',
                                                    planSelected === 'basic'
                                                        ? 'border-[var(--landing-color-accent)] bg-[var(--landing-color-accent-soft)]'
                                                        : 'border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)]',
                                                )}
                                            >
                                                <div className="text-xs font-bold">Paket Basic</div>
                                                <div className="text-[11px] text-muted-foreground">Rp2.900/karyawan/bln</div>
                                                <div className="text-[10px] mt-1 text-[var(--landing-color-accent)]">Absensi &amp; Cuti</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPlanSelected('plus')}
                                                className={cn(
                                                    'rounded-xl border p-3 text-left transition-all',
                                                    planSelected === 'plus'
                                                        ? 'border-[var(--landing-color-accent)] bg-[var(--landing-color-accent-soft)]'
                                                        : 'border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)]',
                                                )}
                                            >
                                                <div className="text-xs font-bold">Paket Plus (All-in)</div>
                                                <div className="text-[11px] text-muted-foreground">Rp7.500/karyawan/bln</div>
                                                <div className="text-[10px] mt-1 text-[var(--landing-color-accent)]">Termasuk Payroll &amp; PPh 21</div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-6 text-xs text-[var(--landing-color-muted)]">
                                        &bull; Gratis uji coba 30 hari pertama tanpa kartu kredit.
                                    </div>
                                </div>

                                {/* Right Result Display */}
                                <div className="rounded-xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] p-6">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--landing-color-muted)]">
                                        Estimasi Penghematan Anda
                                    </div>

                                    <div className="mt-4 flex items-baseline gap-2">
                                        <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600">
                                            {currencyFormatter.format(monthlySavings)}
                                        </span>
                                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                            Hemat {savingsPercentage}%
                                        </span>
                                    </div>
                                    <div className="text-xs text-[var(--landing-color-ink-soft)] mt-1">
                                        Per bulan (atau setara <strong className="text-foreground">{currencyFormatter.format(yearlySavings)}</strong> per tahun)
                                    </div>

                                    <div className="mt-6 space-y-3 border-t border-[var(--landing-color-rule)] pt-4 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-[var(--landing-color-muted)]">Estimasi Biaya Pengelolaan Manual:</span>
                                            <span className="line-through text-rose-500 font-medium">
                                                {currencyFormatter.format(manualEstimatedCost)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-[var(--landing-color-ink)]">Biaya Langganan Humi HRIS:</span>
                                            <span className="font-bold text-[var(--landing-color-accent)]">
                                                {currencyFormatter.format(humiMonthlyCost)} / bln
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={trialHref}
                                        className={cn(landingPrimaryActionClass, 'mt-6 w-full justify-center')}
                                    >
                                        Mulai Hemat Sekarang (Coba Gratis)
                                        <ArrowRight className="size-4" aria-hidden="true" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. COMPARISON TABLE (HUMI VS MANUAL VS LEGACY) */}
                <section
                    aria-labelledby="comparison-heading"
                    className="px-5 py-16 sm:px-8 sm:py-24"
                >
                    <div className="mx-auto max-w-5xl">
                        <div className="text-center max-w-3xl mx-auto">
                            <span className="text-xs font-bold tracking-wider text-[var(--landing-color-accent)] uppercase">
                                Mengapa Harus Beralih?
                            </span>
                            <h2 id="comparison-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Perbandingan: Humi HRIS Cloud vs Metode Konvensional
                            </h2>
                            <p className="mt-3 text-sm text-[var(--landing-color-ink-soft)] leading-relaxed">
                                Lihat bagaimana sistem HRIS modern mengeliminasi kerumitan rekap manual dan software lama yang kaku.
                            </p>
                        </div>

                        <div className="mt-12 overflow-x-auto rounded-2xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] shadow-md">
                            <table className="w-full min-w-[620px] text-left text-xs sm:text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--landing-color-rule)] bg-[var(--landing-color-surface-soft)]">
                                        <th scope="col" className="p-4 font-semibold text-[var(--landing-color-ink)]">Fitur &amp; Kemudahan</th>
                                        <th scope="col" className="p-4 font-bold text-[var(--landing-color-accent)] bg-[var(--landing-color-accent-soft)]/50">
                                            Humi HRIS Cloud
                                        </th>
                                        <th scope="col" className="p-4 font-medium text-[var(--landing-color-muted)]">
                                            Excel &amp; Fingerprint Manual
                                        </th>
                                        <th scope="col" className="p-4 font-medium text-[var(--landing-color-muted)]">
                                            Software HR Legacy / On-Premise
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--landing-color-rule)]">
                                    <tr>
                                        <td className="p-4 font-medium">Biaya Setup &amp; Instalasi</td>
                                        <td className="p-4 font-bold text-emerald-600 bg-[var(--landing-color-accent-soft)]/20">
                                            Rp 0 (Gratis Setup Awal)
                                        </td>
                                        <td className="p-4 text-muted-foreground">Beli mesin Rp2-5jt + kartu</td>
                                        <td className="p-4 text-muted-foreground">Puluhan juta (lisensi server)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-medium">Validasi Absensi &amp; Anti-Titip</td>
                                        <td className="p-4 font-bold text-emerald-600 bg-[var(--landing-color-accent-soft)]/20">
                                            Geofencing GPS + Face Verification
                                        </td>
                                        <td className="p-4 text-rose-500">Rawan titip / antre jam masuk</td>
                                        <td className="p-4 text-muted-foreground">Hanya bisa di jaringan lokal</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-medium">Kalkulasi Payroll &amp; PPh 21 TER</td>
                                        <td className="p-4 font-bold text-emerald-600 bg-[var(--landing-color-accent-soft)]/20">
                                            Otomatis 1-Klik Akurat 100%
                                        </td>
                                        <td className="p-4 text-rose-500">Hitung manual di Excel (Rawan Error)</td>
                                        <td className="p-4 text-muted-foreground">Modul tambahan berbayar</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-medium">Akses Portal Karyawan (ESS)</td>
                                        <td className="p-4 font-bold text-emerald-600 bg-[var(--landing-color-accent-soft)]/20">
                                            Mobile PWA Mandiri Kapan Saja
                                        </td>
                                        <td className="p-4 text-rose-500">Tidak ada (Karyawan selalu tanya HR)</td>
                                        <td className="p-4 text-muted-foreground">Aplikasi berat / terbatas VPN</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-medium">Pembaruan Regulasi Pajak &amp; BPJS</td>
                                        <td className="p-4 font-bold text-emerald-600 bg-[var(--landing-color-accent-soft)]/20">
                                            Update Otomatis di Cloud Tanpa Biaya
                                        </td>
                                        <td className="p-4 text-rose-500">Rumus Excel harus diubah manual</td>
                                        <td className="p-4 text-rose-500">Biaya maintenance tahunan tinggi</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-medium">Keamanan &amp; Backup Data</td>
                                        <td className="p-4 font-bold text-emerald-600 bg-[var(--landing-color-accent-soft)]/20">
                                            Enkripsi AES-256 + Backup Tiap Hari
                                        </td>
                                        <td className="p-4 text-rose-500">File Excel rawan korup / hilang</td>
                                        <td className="p-4 text-muted-foreground">Tergantung tim IT internal</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* 6. MULTI-INDUSTRY SOLUTIONS */}
                <section
                    aria-labelledby="industries-heading"
                    className="border-y border-[var(--landing-color-rule)] bg-[var(--landing-color-surface-soft)] px-5 py-16 sm:px-8 sm:py-24"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <span className="text-xs font-bold tracking-wider text-[var(--landing-color-accent)] uppercase">
                                Solusi Spesifik Industri
                            </span>
                            <h2 id="industries-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Disesuaikan untuk Berbagai Karakteristik Industri di Indonesia
                            </h2>
                            <p className="mt-3 text-sm text-[var(--landing-color-ink-soft)] leading-relaxed">
                                Setiap sektor memiliki tantangan HR unik. Humi memberikan fleksibilitas alur kerja untuk kebutuhan bisnis Anda.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <article className="rounded-2xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="rounded-xl bg-blue-100 dark:bg-blue-950 p-3 w-fit text-blue-600">
                                    <Building2 className="size-6" aria-hidden="true" />
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-[var(--landing-color-ink)]">
                                    Outsourcing &amp; Vendor Tenaga Kerja
                                </h3>
                                <p className="mt-2 text-xs text-[var(--landing-color-ink-soft)] leading-relaxed">
                                    Kelola ratusan pekerja yang tersebar di puluhan klien berbeda dengan sistem multi-lokasi penugasan, invoice klien terintegrasi, dan rekap lembur presisi.
                                </p>
                                <Link
                                    href="/hris-outsourcing"
                                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--landing-color-accent)] hover:underline"
                                >
                                    Pelajari Solusi Outsourcing &rarr;
                                </Link>
                            </article>

                            <article className="rounded-2xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="rounded-xl bg-amber-100 dark:bg-amber-950 p-3 w-fit text-amber-600">
                                    <Layers className="size-6" aria-hidden="true" />
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-[var(--landing-color-ink)]">
                                    Retail, F&amp;B &amp; Restoran Multi-Outlet
                                </h3>
                                <p className="mt-2 text-xs text-[var(--landing-color-ink-soft)] leading-relaxed">
                                    Atasi pergantian staf kasir/waiter yang cepat, atur jadwal shift harian antar outlet secara mudah, dan cegah absensi palsu saat pergantian shift jam sibuk.
                                </p>
                                <Link
                                    href="/hris-retail-fnb"
                                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--landing-color-accent)] hover:underline"
                                >
                                    Pelajari Solusi Retail &amp; F&amp;B &rarr;
                                </Link>
                            </article>

                            <article className="rounded-2xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="rounded-xl bg-rose-100 dark:bg-rose-950 p-3 w-fit text-rose-600">
                                    <Clock className="size-6" aria-hidden="true" />
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-[var(--landing-color-ink)]">
                                    Manufaktur, Pabrik &amp; Shift 24 Jam
                                </h3>
                                <p className="mt-2 text-xs text-[var(--landing-color-ink-soft)] leading-relaxed">
                                    Roster shift malam, aturan jam istirahat, lembur akhir pekan, dan sinkronisasi hari libur nasional tersambung otomatis ke laporan payroll bulanan.
                                </p>
                                <Link
                                    href="/hris-manufaktur-shift"
                                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--landing-color-accent)] hover:underline"
                                >
                                    Pelajari Solusi Manufaktur &rarr;
                                </Link>
                            </article>
                        </div>
                    </div>
                </section>

                {/* 7. TRANSPARENT PRICING SECTION */}
                <section
                    id="pricing"
                    aria-labelledby="pricing-heading"
                    className="px-5 py-16 sm:px-8 sm:py-24"
                >
                    <div className="mx-auto max-w-5xl text-center">
                        <span className="text-xs font-bold tracking-wider text-[var(--landing-color-accent)] uppercase">
                            Transparansi Harga
                        </span>
                        <h2 id="pricing-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            Pilihan Paket Investasi yang Hemat &amp; Terjangkau
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--landing-color-ink-soft)] leading-relaxed">
                            Tanpa biaya setup tersembunyi. Bayar sesuai jumlah karyawan aktif dan nikmati fitur enterprise dengan harga UMKM.
                        </p>

                        <div className="mt-12 grid gap-8 md:grid-cols-2 text-left items-stretch">
                            {/* Paket Basic */}
                            <div className="flex flex-col justify-between rounded-2xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-8 shadow-sm">
                                <div>
                                    <div className="text-xs font-bold text-[var(--landing-color-muted)] uppercase">
                                        Starter / Operasional
                                    </div>
                                    <div className="mt-2 text-2xl font-bold text-[var(--landing-color-ink)]">
                                        Paket Basic
                                    </div>
                                    <div className="mt-4 flex items-baseline gap-1">
                                        <span className="text-3xl font-extrabold text-[var(--landing-color-ink)]">Rp2.900</span>
                                        <span className="text-xs text-[var(--landing-color-muted)]">/karyawan/bulan</span>
                                    </div>
                                    <p className="mt-3 text-xs text-[var(--landing-color-ink-soft)]">
                                        Cocok untuk UMKM dan perusahaan yang ingin merapikan database dan absensi online karyawan.
                                    </p>

                                    <ul className="mt-6 space-y-3 text-xs text-[var(--landing-color-ink-soft)]">
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                            <span>Database karyawan &amp; dokumen digital</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                            <span>Absensi GPS geofencing &amp; selfie</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                            <span>Pengaturan jadwal shift &amp; kalender kerja</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                            <span>Pengajuan cuti, izin &amp; lembur online</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                            <span>Mobile PWA Portal Karyawan (ESS)</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-8 pt-6 border-t border-[var(--landing-color-rule)]">
                                    <Link
                                        href={trialHref}
                                        className={cn(landingSecondaryActionClass, 'w-full justify-center')}
                                    >
                                        Pilih Paket Basic
                                    </Link>
                                </div>
                            </div>

                            {/* Paket Plus */}
                            <div className="relative flex flex-col justify-between rounded-2xl border-2 border-[var(--landing-color-accent)] bg-[var(--landing-color-surface)] p-8 shadow-xl">
                                <div className="absolute -top-3.5 right-6 rounded-full bg-[var(--landing-color-accent)] px-3 py-1 text-[11px] font-bold text-[var(--landing-color-accent-ink)]">
                                    Paling Direkomendasikan
                                </div>

                                <div>
                                    <div className="text-xs font-bold text-[var(--landing-color-accent)] uppercase">
                                        Komprehensif (All-in-One)
                                    </div>
                                    <div className="mt-2 text-2xl font-bold text-[var(--landing-color-ink)]">
                                        Paket Plus
                                    </div>
                                    <div className="mt-4 flex items-baseline gap-1">
                                        <span className="text-3xl font-extrabold text-[var(--landing-color-accent)]">Rp7.500</span>
                                        <span className="text-xs text-[var(--landing-color-muted)]">/karyawan/bulan</span>
                                    </div>
                                    <p className="mt-3 text-xs text-[var(--landing-color-ink-soft)]">
                                        Semua fitur Paket Basic ditambah otomatisasi penggajian lengkap, pajak PPh 21, dan integrasi transfer.
                                    </p>

                                    <ul className="mt-6 space-y-3 text-xs text-[var(--landing-color-ink-soft)]">
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                            <span><strong>Semua fitur Paket Basic</strong></span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                            <span><strong>Modul Payroll Otomatis &amp; THR</strong></span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                            <span>Kalkulasi PPh 21 TER &amp; BPJS resmi</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                            <span>Generate slip gaji digital berpassword PDF</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                            <span>Klaim reimbursement &amp; kasbon pinjaman</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                                            <span>Kunjungan klien dengan map marker lokasi</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-8 pt-6 border-t border-[var(--landing-color-rule)]">
                                    <Link
                                        href={trialHref}
                                        className={cn(landingPrimaryActionClass, 'w-full justify-center')}
                                    >
                                        Mulai Trial Paket Plus (30 Hari)
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 8. SEO EDUCATIONAL ARTICLES / KNOWLEDGE SECTION */}
                <section
                    aria-labelledby="seo-guide-heading"
                    className="border-y border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] px-5 py-16 sm:px-8 sm:py-20"
                >
                    <div className="mx-auto max-w-5xl">
                        <header className="max-w-3xl">
                            <span className="text-xs font-bold tracking-wider text-[var(--landing-color-accent)] uppercase">
                                Panduan HRIS Indonesia
                            </span>
                            <h2 id="seo-guide-heading" className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--landing-color-ink)]">
                                Panduan Memilih Software HRIS Terbaik untuk Bisnis Anda
                            </h2>
                        </header>

                        <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--landing-color-ink-soft)]">
                            <article className="rounded-xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-6">
                                <h3 className="text-lg font-bold text-[var(--landing-color-ink)]">
                                    Apa Itu Software HRIS dan Bagaimana Cara Kerjanya?
                                </h3>
                                <p className="mt-3">
                                    <strong>Human Resource Information System (HRIS)</strong> adalah sistem berbasis perangkat lunak yang dirancang untuk mengotomatiskan pengelolaan data personalia, absensi, evaluasi kinerja, hingga perhitungan gaji (payroll). Di era kerja modern di mana model kerja hybrid dan mobile semakin umum, HRIS berbasis cloud seperti Humi memungkinkan HR dan karyawan mengakses informasi yang sama secara real-time dari mana saja tanpa ketergantungan pada berkas manual.
                                </p>
                            </article>

                            <article className="rounded-xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-6">
                                <h3 className="text-lg font-bold text-[var(--landing-color-ink)]">
                                    5 Tanda Perusahaan Anda Sudah Harus Beralih dari Excel ke Software HRIS
                                </h3>
                                <ul className="mt-3 list-disc pl-5 space-y-2">
                                    <li><strong>Rekap kehadiran memakan waktu berhari-hari:</strong> HR menghabiskan akhir bulan hanya untuk mencocokkan data fingerprint dengan form cuti kertas.</li>
                                    <li><strong>Sering terjadi kesalahan perhitungan gaji atau lembur:</strong> Rumus Excel yang rumit rentan salah ketik (human error) yang memicu ketidakpuasan karyawan.</li>
                                    <li><strong>Karyawan bolak-balik menanyakan saldo cuti dan slip gaji:</strong> Tim HR terbebani pertanyaan berulang yang seharusnya bisa diakses mandiri oleh staf via ESS.</li>
                                    <li><strong>Kontrak kerja PKWT terlewat:</strong> Tidak ada sistem pengingat otomatis menjelang masa perpanjangan kontrak karyawan.</li>
                                    <li><strong>Perusahaan berencana membuka cabang atau merekrut lebih banyak staf:</strong> Pengelolaan manual di spreadsheet tidak scalable saat jumlah pekerja bertambah.</li>
                                </ul>
                            </article>
                        </div>
                    </div>
                </section>

                {/* 9. FAQ ACCORDION (MODERN WEB GUIDANCE COMPLIANT: DETAILS/SUMMARY) */}
                <section
                    id="faq"
                    aria-labelledby="faq-heading"
                    className="px-5 py-16 sm:px-8 sm:py-24"
                >
                    <div className="mx-auto max-w-4xl">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-wider text-[var(--landing-color-accent)] uppercase">
                                Tanya Jawab Seputar HRIS
                            </span>
                            <h2 id="faq-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Pertanyaan yang Sering Diajukan (FAQ)
                            </h2>
                            <p className="mt-3 text-sm text-[var(--landing-color-ink-soft)]">
                                Temukan jawaban lengkap seputar fitur, implementasi, dan keamanan software HRIS Humi.
                            </p>
                        </div>

                        {/* Native details/summary Accordion (Modern Web Guidance compliant) */}
                        <div className="mt-12 space-y-3">
                            {faqs.map((faq, index) => (
                                <details
                                    key={index}
                                    name="faq"
                                    className="group rounded-xl border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-5 transition-all [&_summary::-webkit-details-marker]:hidden"
                                >
                                    <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[var(--landing-color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--landing-color-focus)] rounded-sm">
                                        <span>{faq.q}</span>
                                        <ChevronDown className="size-4 shrink-0 text-[var(--landing-color-muted)] transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                                    </summary>
                                    <div className="mt-3 text-xs sm:text-sm text-[var(--landing-color-ink-soft)] leading-relaxed border-t border-[var(--landing-color-rule)] pt-3">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 10. FINAL CONVERSION CTA BANNER */}
                <section
                    aria-labelledby="cta-heading"
                    className="px-5 py-16 sm:px-8 sm:py-24"
                >
                    <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[var(--landing-color-ink)] px-6 py-12 text-center text-white sm:px-12 sm:py-20 relative">
                        <div
                            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.4_0.082_195/0.4)_0%,transparent_70%)]"
                            aria-hidden="true"
                        />
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            <Sparkles className="size-3.5" aria-hidden="true" />
                            Bergabung Bersama Ratusan Perusahaan Cerdas di Indonesia
                        </span>
                        <h2 id="cta-heading" className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl text-white">
                            Tingkatkan Produktivitas HR Anda Hari Ini Bersama Humi
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-white/80 leading-relaxed">
                            Mulai uji coba 30 hari tanpa komitmen. Tim spesialis kami siap mendampingi proses migrasi data dari Excel secara gratis.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href={trialHref}
                                className={cn(landingPrimaryActionClass, 'text-base px-8 py-3.5 bg-white text-[var(--landing-color-ink)] hover:bg-white/90')}
                            >
                                Coba Gratis 30 Hari Sekarang
                                <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(landingSecondaryActionClass, 'text-base px-7 py-3.5 border-white/20 text-white bg-white/5 hover:bg-white/10')}
                            >
                                <MessageCircle className="size-4 text-emerald-400" aria-hidden="true" />
                                Tanya Tim via WhatsApp
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <LandingFooter hasUser={hasUser} trialHref={trialHref} />

            {/* Floating WhatsApp Action Button */}
            <aside aria-label="Bantuan WhatsApp" className="fixed bottom-6 right-6 z-50">
                <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-xl hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95"
                    aria-label="Konsultasi langsung via WhatsApp"
                >
                    <MessageCircle className="size-5" aria-hidden="true" />
                    <span className="hidden sm:inline">Tanya HRIS (WhatsApp)</span>
                </a>
            </aside>
        </div>
    );
}
