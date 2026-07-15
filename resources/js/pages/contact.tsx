import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock,
    Mail,
    MessageCircle,
    Phone,
    ShieldCheck,
} from 'lucide-react';
import SeoHead from '@/components/seo-head';
import { login, register } from '@/routes';

const WHATSAPP_CONTACT_URL =
    'https://wa.me/6285710999144?text=Halo%20Humi%2C%20saya%20ingin%20konsultasi%20tentang%20HRIS.';
const EMAIL = 'hello@zeniconsulting.com';
const PHONE = '+62 857-1099-9144';
const SEO_TITLE = 'Kontak Humi HRIS - Konsultasi Software HRIS Indonesia';
const SEO_DESCRIPTION =
    'Hubungi tim Humi untuk konsultasi software HRIS, absensi, payroll, portal karyawan, rekrutmen, dan implementasi sistem HR perusahaan.';

const contactOptions = [
    {
        icon: MessageCircle,
        title: 'WhatsApp Sales',
        description:
            'Respon paling cepat untuk konsultasi paket, demo, dan kebutuhan implementasi.',
        value: PHONE,
        href: WHATSAPP_CONTACT_URL,
        label: 'Chat WhatsApp',
    },
    {
        icon: Mail,
        title: 'Email',
        description:
            'Kirim detail kebutuhan, jumlah karyawan, dan modul prioritas perusahaan Anda.',
        value: EMAIL,
        href: `mailto:${EMAIL}`,
        label: 'Kirim Email',
    },
];

const checklist = [
    'Demo fitur HRIS sesuai kebutuhan perusahaan',
    'Estimasi biaya berdasarkan jumlah karyawan',
    'Diskusi alur approval, absensi, payroll, dan portal karyawan',
    'Pilihan halaman demo untuk outsourcing, retail/F&B, atau manufaktur shift',
    'Arahan implementasi untuk tim HR dan manajemen',
];

const industryOptions = [
    { label: 'Outsourcing', href: '/hris-outsourcing' },
    { label: 'Retail & F&B', href: '/hris-retail-fnb' },
    { label: 'Manufaktur Shift', href: '/hris-manufaktur-shift' },
];

export default function Contact() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Kontak Humi HRIS',
        description: SEO_DESCRIPTION,
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'sales',
            telephone: PHONE,
            email: EMAIL,
            availableLanguage: ['id'],
        },
    };

    return (
        <>
            <SeoHead
                title={SEO_TITLE}
                description={SEO_DESCRIPTION}
                keywords="kontak HRIS, konsultasi HRIS, demo software HRIS, aplikasi payroll Indonesia, aplikasi absensi karyawan"
                canonicalPath="/contact"
                structuredData={structuredData}
            />

            <div className="min-h-screen bg-white text-slate-900">
                <header className="border-b border-slate-100 bg-white">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="Humi"
                                className="h-8 w-auto"
                            />
                        </Link>
                        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
                            <Link
                                href="/features"
                                className="transition hover:text-slate-900"
                            >
                                Fitur
                            </Link>
                            <Link
                                href="/berita"
                                className="transition hover:text-slate-900"
                            >
                                Berita
                            </Link>
                            <Link href="/contact" className="text-[#0d4d52]">
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
                        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-20">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.12em] text-[#14a8b0] uppercase">
                                    Kontak Humi
                                </p>
                                <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                                    Diskusikan kebutuhan HRIS perusahaan Anda
                                    dengan tim Humi.
                                </h1>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                                    Kami bantu memetakan kebutuhan data
                                    karyawan, absensi, cuti, lembur, payroll,
                                    rekrutmen, dan portal karyawan agar
                                    implementasi lebih terarah.
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <a
                                        href={WHATSAPP_CONTACT_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0d4d52] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3e42]"
                                    >
                                        Chat WhatsApp
                                        <ArrowRight className="h-4 w-4" />
                                    </a>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                                    >
                                        Mulai Trial
                                    </Link>
                                </div>
                            </div>

                            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                <Building2 className="h-7 w-7 text-[#0d4d52]" />
                                <h2 className="mt-4 text-xl font-semibold text-slate-950">
                                    Yang bisa dibahas
                                </h2>
                                <ul className="mt-5 space-y-3">
                                    {checklist.map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-3 text-sm text-slate-700"
                                        >
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#14a8b0]" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </aside>
                        </div>
                    </section>

                    <section className="bg-slate-50/60 py-16">
                        <div className="mx-auto grid max-w-6xl gap-5 px-6 md:grid-cols-2">
                            {contactOptions.map((option) => (
                                <article
                                    key={option.title}
                                    className="rounded-2xl border border-slate-200 bg-white p-6"
                                >
                                    <option.icon className="h-7 w-7 text-[#0d4d52]" />
                                    <h2 className="mt-4 text-xl font-semibold text-slate-950">
                                        {option.title}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {option.description}
                                    </p>
                                    <p className="mt-5 font-semibold text-slate-950">
                                        {option.value}
                                    </p>
                                    <a
                                        href={option.href}
                                        target={
                                            option.href.startsWith('http')
                                                ? '_blank'
                                                : undefined
                                        }
                                        rel={
                                            option.href.startsWith('http')
                                                ? 'noopener noreferrer'
                                                : undefined
                                        }
                                        className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                                    >
                                        {option.label}
                                        <ArrowRight className="h-4 w-4" />
                                    </a>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="border-y border-slate-100 py-14">
                        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-[0.8fr_1.2fr]">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                    Ingin demo yang lebih spesifik?
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                    Buka halaman sesuai tipe perusahaan agar
                                    diskusi langsung masuk ke masalah
                                    operasional utama.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {industryOptions.map((option) => (
                                    <Link
                                        key={option.href}
                                        href={option.href}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-800 transition hover:border-[#14a8b0]/60"
                                    >
                                        {option.label}
                                        <ArrowRight className="mt-4 h-4 w-4 text-[#0d4d52]" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-16">
                        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 p-5">
                                <Clock className="h-6 w-6 text-[#14a8b0]" />
                                <h2 className="mt-4 font-semibold text-slate-950">
                                    Waktu respon
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Tim akan merespon inquiry bisnis pada jam
                                    kerja secepat mungkin.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 p-5">
                                <ShieldCheck className="h-6 w-6 text-[#14a8b0]" />
                                <h2 className="mt-4 font-semibold text-slate-950">
                                    Konsultasi aman
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Detail kebutuhan perusahaan dipakai hanya
                                    untuk pemetaan solusi HRIS.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 p-5">
                                <Phone className="h-6 w-6 text-[#14a8b0]" />
                                <h2 className="mt-4 font-semibold text-slate-950">
                                    Demo terarah
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Demo difokuskan ke modul yang paling relevan
                                    untuk operasional Anda.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
