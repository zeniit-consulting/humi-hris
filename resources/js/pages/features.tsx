import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    BriefcaseBusiness,
    CalendarClock,
    CheckCircle2,
    CircleDollarSign,
    ClipboardCheck,
    FileText,
    Fingerprint,
    FolderKanban,
    ShieldCheck,
    Users,
} from 'lucide-react';
import SeoHead from '@/components/seo-head';
import { login, register } from '@/routes';

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

const SEO_TITLE = 'Fitur Humi HRIS - Absensi, Payroll, Rekrutmen, dan Portal Karyawan';
const SEO_DESCRIPTION =
    'Lihat fitur Humi HRIS untuk manajemen karyawan, absensi, cuti, lembur, payroll, rekrutmen, asset management, performance tracker, dan portal karyawan.';

export default function Features() {
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

            <div className="min-h-screen bg-white text-slate-900">
                <header className="border-b border-slate-100 bg-white">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="Humi" className="h-8 w-auto" />
                        </Link>
                        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
                            <Link href="/features" className="text-[#0d4d52]">
                                Fitur
                            </Link>
                            <Link href="/contact" className="transition hover:text-slate-900">
                                Kontak
                            </Link>
                        </nav>
                        <Link
                            href={login()}
                            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                        >
                            Masuk
                        </Link>
                    </div>
                </header>

                <main>
                    <section className="border-b border-slate-100">
                        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.12em] text-[#14a8b0] uppercase">
                                    Fitur Humi HRIS
                                </p>
                                <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                                    Satu sistem untuk menjalankan operasional HR dari awal sampai evaluasi.
                                </h1>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                                    Humi menyatukan data karyawan, absensi, cuti, lembur, payroll, rekrutmen,
                                    aset, dan performa dalam alur kerja yang mudah dipakai oleh HR, manajer,
                                    dan karyawan.
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0d4d52] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3e42]"
                                    >
                                        Coba Gratis
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                                    >
                                        Konsultasi Fitur
                                    </Link>
                                </div>
                            </div>

                            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                {[
                                    ['Database Karyawan', 'Dokumen dan struktur organisasi'],
                                    ['Absensi Real-time', 'Cuti, lembur, shift, dan approval'],
                                    ['Payroll', 'Slip gaji dan komponen payroll'],
                                    ['Performance', 'KPI, OKR, dan review manajer'],
                                ].map(([title, text]) => (
                                    <div key={title} className="rounded-xl bg-white p-4 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#14a8b0]" />
                                            <div>
                                                <p className="font-semibold text-slate-950">{title}</p>
                                                <p className="mt-1 text-sm text-slate-600">{text}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-50/60 py-16">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
                                {featureGroups.map((feature) => (
                                    <article key={feature.title} className="bg-white p-7">
                                        <feature.icon className="h-7 w-7 text-[#0d4d52]" />
                                        <h2 className="mt-5 text-lg font-semibold text-slate-950">
                                            {feature.title}
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {feature.description}
                                        </p>
                                        <ul className="mt-5 space-y-2">
                                            {feature.items.map((item) => (
                                                <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                                                    <ClipboardCheck className="h-4 w-4 text-[#14a8b0]" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-16">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.12em] text-[#14a8b0] uppercase">
                                        Alur Kerja
                                    </p>
                                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                                        Dibangun untuk pekerjaan HR harian.
                                    </h2>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {workflow.map((step, index) => (
                                        <article key={step.title} className="rounded-2xl border border-slate-200 p-5">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14a8b0]/10 text-sm font-bold text-[#0d4d52]">
                                                {index + 1}
                                            </div>
                                            <h3 className="mt-4 font-semibold text-slate-950">{step.title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-slate-100 bg-[#0d4d52] py-14 text-white">
                        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
                            <div>
                                <FileText className="h-6 w-6 text-[#7ae5e0]" />
                                <h2 className="mt-4 text-2xl font-bold">Butuh demo fitur yang sesuai kebutuhan perusahaan?</h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                                    Ceritakan jumlah karyawan, alur approval, dan modul prioritas Anda.
                                </p>
                            </div>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0d4d52] transition hover:bg-slate-100"
                            >
                                Hubungi Tim Humi
                                <ShieldCheck className="h-4 w-4" />
                            </Link>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
