import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Banknote,
    BarChart3,
    Building2,
    CalendarCheck2,
    Check,
    Clock3,
    FileText,
    LockKeyhole,
    MessageSquareText,
    MousePointer2,
    Network,
    ShieldCheck,
    Sparkles,
    UsersRound,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';

const clientLogos = [
    { name: 'Nusantara Retail', logo: '/images/clients/nusantara-retail.svg' },
    {
        name: 'Prima Manufacture',
        logo: '/images/clients/prima-manufacture.svg',
    },
    {
        name: 'Sentra Distribusi',
        logo: '/images/clients/sentra-distribusi.svg',
    },
    { name: 'Rasa Nusantara', logo: '/images/clients/rasa-nusantara.svg' },
    { name: 'Bumi Logistic', logo: '/images/clients/bumi-logistic.svg' },
];

const outcomes = [
    { value: '10 menit', label: 'closing payroll bulanan' },
    { value: '1 sumber', label: 'data karyawan, jadwal, dan approval' },
    { value: '24/7', label: 'akses self-service karyawan' },
];

const featureCards = [
    {
        icon: UsersRound,
        title: 'Database karyawan yang rapi',
        body: 'Profil, kontrak, dokumen, jabatan, divisi, dan status kerja tersusun dalam struktur yang bisa dicari cepat.',
        tone: 'bg-white',
    },
    {
        icon: CalendarCheck2,
        title: 'Absensi dan jadwal operasional',
        body: 'Pantau kehadiran, shift, lembur, cuti, dan keterlambatan dari dashboard yang sama.',
        tone: 'bg-[#fde8ce]',
    },
    {
        icon: Banknote,
        title: 'Payroll siap audit',
        body: 'Komponen gaji, kasbon, denda, tunjangan, dan slip gaji terkalkulasi dengan jejak data yang jelas.',
        tone: 'bg-[#bee9f4]',
    },
];

const workflow = [
    {
        title: 'Migrasi struktur organisasi',
        detail: 'Divisi, jabatan, sub-jabatan, dan data karyawan dimasukkan ke fondasi HRIS.',
    },
    {
        title: 'Aktifkan workflow harian',
        detail: 'Approval cuti, lembur, absensi, kasbon, dan pengumuman berjalan dari satu alur.',
    },
    {
        title: 'Pantau biaya dan produktivitas',
        detail: 'HR dan owner membaca headcount, payroll, dan kehadiran tanpa rekap manual.',
    },
];

const faq = [
    {
        question: 'Apakah cocok untuk perusahaan dengan banyak divisi?',
        answer: 'Ya. ZENI HRIS mendukung struktur divisi, posisi, level, dan akses berbasis role.',
    },
    {
        question: 'Apakah karyawan punya portal sendiri?',
        answer: 'Ya. Karyawan bisa mengakses absensi, cuti, lembur, dan slip gaji melalui portal self-service.',
    },
    {
        question: 'Apakah payroll bisa menyesuaikan komponen internal?',
        answer: 'Bisa. Tunjangan, potongan, kasbon, denda, dan item payroll fleksibel mengikuti kebijakan perusahaan.',
    },
];

export default function WorkableLanding({
    canRegister = true,
    landingVariant = 'workable',
}: {
    canRegister?: boolean;
    landingVariant?: string;
}) {
    const { auth } = usePage().props;
    const primaryHref = auth.user
        ? dashboard()
        : canRegister
          ? register()
          : login();
    const primaryText = auth.user
        ? 'Buka Dashboard'
        : canRegister
          ? 'Mulai Coba Gratis'
          : 'Masuk';

    return (
        <>
            <Head title="ZENI HRIS - Landing Workable">
                <meta name="landing-variant" content={landingVariant} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400&family=Open+Sans:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-screen bg-[#fff5ee] text-[#0f161e]"
                style={{
                    fontFamily:
                        '"Open Sans", ui-sans-serif, system-ui, sans-serif',
                }}
            >
                <header className="sticky top-0 z-40 border-b border-[#004038]/10 bg-[#fff5ee]/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link
                            href="/"
                            className="flex items-center gap-3"
                            aria-label="ZENI HRIS home"
                        >
                            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#004038]">
                                <Building2 className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="text-lg font-bold text-[#004038]">
                                    ZENI HRIS
                                </p>
                                <p className="hidden text-xs text-[#333942] sm:block">
                                    Human resources, payroll, attendance
                                </p>
                            </div>
                        </Link>

                        <nav className="flex items-center gap-2">
                            <a
                                href="#fitur"
                                className="hidden rounded-2xl px-3 py-2 text-sm font-bold text-[#004038] hover:bg-white md:inline-flex"
                            >
                                Fitur
                            </a>
                            <a
                                href="#cara-kerja"
                                className="hidden rounded-2xl px-3 py-2 text-sm font-bold text-[#004038] hover:bg-white md:inline-flex"
                            >
                                Cara kerja
                            </a>
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="rounded-2xl px-4 py-2 text-sm font-bold text-[#004038] hover:bg-white"
                            >
                                {auth.user ? 'Dashboard' : 'Masuk'}
                            </Link>
                            {canRegister && !auth.user && (
                                <Link
                                    href={register()}
                                    className="rounded-2xl bg-[#004038] px-4 py-2 text-sm font-bold text-white hover:bg-[#012620]"
                                >
                                    Coba Gratis
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                <main>
                    <section className="bg-[#012620] text-white">
                        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:py-16">
                            <div className="flex flex-col justify-center">
                                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#7edcaf]/40 px-4 py-2 text-sm font-bold text-[#7edcaf]">
                                    <Sparkles className="h-4 w-4" />
                                    Varian landing Workable
                                </div>

                                <h1 className="max-w-3xl text-5xl leading-none font-bold text-balance md:text-6xl lg:text-7xl">
                                    Bereskan HR tanpa rekap manual.
                                </h1>
                                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d9eee9] md:text-xl">
                                    ZENI HRIS menyatukan data karyawan, absensi,
                                    approval, dan payroll agar tim HR punya satu
                                    sistem kerja yang jelas.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={primaryHref}
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#d5ff4d] px-6 py-3 text-sm font-bold text-[#012620] hover:bg-[#c6f241]"
                                    >
                                        {primaryText}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <a
                                        href="#fitur"
                                        className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/25 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
                                    >
                                        Lihat modul
                                    </a>
                                </div>

                                <div className="mt-9 grid gap-3 sm:grid-cols-3">
                                    {outcomes.map((item) => (
                                        <div
                                            key={item.label}
                                            className="border-t border-[#7edcaf]/35 pt-4"
                                        >
                                            <p className="text-2xl font-bold text-[#d5ff4d]">
                                                {item.value}
                                            </p>
                                            <p className="mt-1 text-sm leading-5 text-[#d9eee9]">
                                                {item.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="min-h-[430px]">
                                <div className="relative h-full overflow-hidden rounded-2xl border border-white/15 bg-[#fff5ee] p-4 text-[#0f161e]">
                                    <div className="grid gap-4 md:grid-cols-[0.78fr_1.22fr]">
                                        <aside className="rounded-2xl bg-[#004038] p-4 text-white">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-5 w-5 text-[#d5ff4d]" />
                                                <span className="font-bold">
                                                    HR Command
                                                </span>
                                            </div>
                                            <div className="mt-6 space-y-2">
                                                {[
                                                    'Karyawan',
                                                    'Absensi',
                                                    'Payroll',
                                                    'Approval',
                                                ].map((item, index) => (
                                                    <div
                                                        key={item}
                                                        className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${index === 1 ? 'bg-[#d5ff4d] text-[#012620]' : 'bg-white/10'}`}
                                                    >
                                                        <MousePointer2 className="h-4 w-4" />
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </aside>

                                        <div className="space-y-4">
                                            <div className="grid gap-3 sm:grid-cols-3">
                                                {[
                                                    [
                                                        'Hadir',
                                                        '93%',
                                                        'bg-[#00f5dc]',
                                                    ],
                                                    [
                                                        'Lembur',
                                                        '18',
                                                        'bg-[#ffdcbf]',
                                                    ],
                                                    [
                                                        'Payroll',
                                                        'Ready',
                                                        'bg-[#bee9f4]',
                                                    ],
                                                ].map(
                                                    ([label, value, color]) => (
                                                        <div
                                                            key={label}
                                                            className={`rounded-2xl ${color} p-4`}
                                                        >
                                                            <p className="text-xs font-bold text-[#333942]">
                                                                {label}
                                                            </p>
                                                            <p className="mt-3 text-2xl font-bold text-[#012620]">
                                                                {value}
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            <div className="rounded-2xl bg-white p-5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-[#004038]">
                                                            Payroll Mei
                                                        </p>
                                                        <p className="mt-1 text-xs text-[#333942]">
                                                            143 karyawan siap
                                                            diproses
                                                        </p>
                                                    </div>
                                                    <BadgeCheck className="h-8 w-8 text-[#00544c]" />
                                                </div>
                                                <div className="mt-5 h-3 rounded-full bg-[#fde8ce]">
                                                    <div className="h-3 w-[84%] rounded-full bg-[#004038]" />
                                                </div>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {[
                                                    [
                                                        Clock3,
                                                        '12 approval selesai hari ini',
                                                    ],
                                                    [
                                                        MessageSquareText,
                                                        'Slip gaji siap dikirim',
                                                    ],
                                                ].map(([Icon, text]) => (
                                                    <div
                                                        key={text as string}
                                                        className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-bold text-[#012620]"
                                                    >
                                                        <Icon className="h-5 w-5 text-[#00544c]" />
                                                        {text as string}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm font-bold text-[#333942]">
                                Dipercaya tim operasional yang bergerak cepat
                            </p>
                            <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                                {clientLogos.map((client) => (
                                    <img
                                        key={client.name}
                                        src={client.logo}
                                        alt={`Logo ${client.name}`}
                                        className="h-10 w-full object-contain grayscale"
                                        loading="lazy"
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        id="fitur"
                        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
                    >
                        <div className="max-w-3xl">
                            <p className="text-sm font-bold tracking-normal text-[#00544c]">
                                Modul inti
                            </p>
                            <h2 className="mt-3 text-3xl leading-tight font-bold text-[#012620] md:text-5xl">
                                Dibuat untuk HR yang butuh rapi, cepat, dan bisa
                                diaudit.
                            </h2>
                        </div>
                        <div className="mt-8 grid gap-4 lg:grid-cols-3">
                            {featureCards.map((feature) => (
                                <article
                                    key={feature.title}
                                    className={`rounded-2xl ${feature.tone} p-8`}
                                >
                                    <feature.icon className="h-9 w-9 text-[#004038]" />
                                    <h3 className="mt-6 text-2xl font-bold text-[#012620]">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-4 text-base leading-7 text-[#333942]">
                                        {feature.body}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section id="cara-kerja" className="bg-white">
                        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                            <div>
                                <p className="text-sm font-bold text-[#00544c]">
                                    Cara kerja
                                </p>
                                <h2 className="mt-3 text-3xl leading-tight font-bold text-[#012620] md:text-5xl">
                                    Implementasi bertahap, dampaknya langsung
                                    terasa.
                                </h2>
                                <p className="mt-5 text-lg leading-8 text-[#333942]">
                                    Mulai dari struktur organisasi, lalu
                                    aktifkan workflow harian, kemudian gunakan
                                    data untuk keputusan operasional.
                                </p>
                            </div>
                            <div className="space-y-3">
                                {workflow.map((item, index) => (
                                    <article
                                        key={item.title}
                                        className="grid gap-4 rounded-2xl border border-[#004038]/10 bg-[#fff5ee] p-5 sm:grid-cols-[56px_1fr]"
                                    >
                                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#004038] text-xl font-bold text-white">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <h3 className="text-xl font-bold text-[#012620]">
                                                {item.title}
                                            </h3>
                                            <p className="mt-2 leading-7 text-[#333942]">
                                                {item.detail}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                        <div className="grid gap-4 lg:grid-cols-4">
                            {[
                                [ShieldCheck, 'Akses role-based'],
                                [FileText, 'Dokumen karyawan'],
                                [BarChart3, 'Analitik HR'],
                                [Network, 'Org chart'],
                            ].map(([Icon, label]) => (
                                <div
                                    key={label as string}
                                    className="flex min-h-32 flex-col justify-between rounded-2xl bg-[#012620] p-6 text-white"
                                >
                                    <Icon className="h-7 w-7 text-[#7edcaf]" />
                                    <p className="text-xl font-bold">
                                        {label as string}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-[#fde8ce]">
                        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
                            <div>
                                <p className="text-sm font-bold text-[#00544c]">
                                    FAQ
                                </p>
                                <h2 className="mt-3 text-3xl leading-tight font-bold text-[#012620] md:text-5xl">
                                    Jawaban untuk keputusan pertama.
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {faq.map((item) => (
                                    <details
                                        key={item.question}
                                        className="group rounded-2xl bg-white p-5"
                                    >
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-[#012620]">
                                            {item.question}
                                            <Check className="h-5 w-5 text-[#00544c] transition group-open:rotate-45" />
                                        </summary>
                                        <p className="mt-3 leading-7 text-[#333942]">
                                            {item.answer}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                        <div className="rounded-2xl bg-[#004038] p-8 text-white md:p-12">
                            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                                <div>
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-[#d5ff4d]">
                                        <LockKeyhole className="h-4 w-4" />
                                        Data HR tetap dalam akses yang
                                        terkendali
                                    </div>
                                    <h2 className="max-w-3xl text-3xl leading-tight font-bold md:text-5xl">
                                        Siapkan operasi HR yang siap tumbuh
                                        bersama bisnis.
                                    </h2>
                                </div>
                                <Link
                                    href={primaryHref}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#d5ff4d] px-6 py-3 text-sm font-bold text-[#012620] hover:bg-[#c6f241]"
                                >
                                    {primaryText}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
