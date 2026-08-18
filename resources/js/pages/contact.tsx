import { Link, usePage } from '@inertiajs/react';
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
    const { auth } = usePage().props as {
        auth: { user?: unknown };
    };
    const hasUser = Boolean(auth.user);
    const trialHref = hasUser ? dashboard().url : register().url;
    const trialLabel = hasUser ? 'Buka Dashboard' : 'Mulai Trial Gratis';

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

            <div className="min-h-screen overflow-x-clip bg-[var(--landing-color-paper)] font-[family-name:var(--landing-font-body)] text-[var(--landing-color-ink)]">
                <LandingNav hasUser={hasUser} trialHref={trialHref} />

                <main>
                    <section className="pt-28 pb-16 sm:pt-32 sm:pb-20">
                        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                            <div>
                                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-[var(--landing-color-accent)] uppercase">
                                    <span
                                        className="size-2 rounded-full bg-[var(--landing-color-accent)]"
                                        aria-hidden="true"
                                    />
                                    Kontak Humi
                                </span>
                                <h1
                                    className={`mt-4 max-w-2xl ${frontHeroTitleClass}`}
                                >
                                    Diskusikan kebutuhan HRIS{' '}
                                    <span className={frontHeroTealTextClass}>
                                        dengan tim ahli kami.
                                    </span>
                                </h1>
                                <p
                                    className={`mt-5 max-w-xl ${frontHeroSubtitleClass}`}
                                >
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
                                        className={landingPrimaryActionClass}
                                    >
                                        Chat WhatsApp
                                        <ArrowRight className="size-4" />
                                    </a>
                                    <Link
                                        href={trialHref}
                                        className={landingSecondaryActionClass}
                                    >
                                        {trialLabel}
                                    </Link>
                                </div>
                            </div>

                            <aside className="rounded-[var(--landing-radius-panel)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-6 shadow-[var(--landing-shadow-panel)] sm:p-8">
                                <div className="flex size-12 items-center justify-center rounded-[var(--landing-radius-card)] bg-[var(--landing-color-accent-soft)] text-[var(--landing-color-accent)]">
                                    <Building2 className="size-6" />
                                </div>
                                <h2 className="mt-5 text-xl font-semibold text-[var(--landing-color-ink)]">
                                    Yang bisa dibahas dalam sesi konsultasi
                                </h2>
                                <ul className="mt-5 space-y-3">
                                    {checklist.map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-3 text-sm text-[var(--landing-color-ink-soft)]"
                                        >
                                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--landing-color-accent)]" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </aside>
                        </div>
                    </section>

                    <section className="bg-[var(--landing-color-surface)] py-20 sm:py-24">
                        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 md:grid-cols-2">
                            {contactOptions.map((option) => (
                                <article
                                    key={option.title}
                                    className="flex flex-col justify-between rounded-[var(--landing-radius-panel)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] p-7 shadow-xs"
                                >
                                    <div>
                                        <div className="flex size-12 items-center justify-center rounded-[var(--landing-radius-card)] bg-[var(--landing-color-accent-soft)] text-[var(--landing-color-accent)]">
                                            <option.icon className="size-6" />
                                        </div>
                                        <h2 className="mt-5 text-xl font-semibold text-[var(--landing-color-ink)]">
                                            {option.title}
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-[var(--landing-color-ink-soft)]">
                                            {option.description}
                                        </p>
                                        <p className="mt-5 text-lg font-semibold text-[var(--landing-color-ink)]">
                                            {option.value}
                                        </p>
                                    </div>
                                    <div className="mt-6 border-t border-[var(--landing-color-rule)] pt-4">
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
                                            className={
                                                landingSecondaryActionClass
                                            }
                                        >
                                            {option.label}
                                            <ArrowRight className="size-4" />
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="py-20 sm:py-24">
                        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                            <div>
                                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-[var(--landing-color-accent)] uppercase">
                                    Solusi Industri
                                </span>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--landing-color-ink)] sm:text-4xl">
                                    Ingin demo yang lebih spesifik?
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-[var(--landing-color-ink-soft)]">
                                    Buka halaman sesuai tipe perusahaan agar
                                    diskusi langsung masuk ke masalah
                                    operasional utama.
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {industryOptions.map((option) => (
                                    <Link
                                        key={option.href}
                                        href={option.href}
                                        className="group rounded-[var(--landing-radius-card)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] p-5 text-sm font-semibold text-[var(--landing-color-ink)] transition-transform duration-[var(--landing-duration-press)] ease-[var(--landing-ease-out)] hover:-translate-y-px"
                                    >
                                        <p className="text-base font-semibold">
                                            {option.label}
                                        </p>
                                        <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-[var(--landing-color-accent)]">
                                            Lihat Solusi
                                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-[var(--landing-color-rule)] bg-[var(--landing-color-surface)] py-20 sm:py-24">
                        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 md:grid-cols-3">
                            <div className="rounded-[var(--landing-radius-card)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] p-6">
                                <Clock className="size-6 text-[var(--landing-color-accent)]" />
                                <h3 className="mt-4 font-semibold text-[var(--landing-color-ink)]">
                                    Waktu respon cepat
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-[var(--landing-color-ink-soft)]">
                                    Tim akan merespon inquiry bisnis pada jam
                                    kerja secepat mungkin.
                                </p>
                            </div>
                            <div className="rounded-[var(--landing-radius-card)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] p-6">
                                <ShieldCheck className="size-6 text-[var(--landing-color-accent)]" />
                                <h3 className="mt-4 font-semibold text-[var(--landing-color-ink)]">
                                    Konsultasi aman & rahasia
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-[var(--landing-color-ink-soft)]">
                                    Detail kebutuhan perusahaan dipakai hanya
                                    untuk pemetaan solusi HRIS.
                                </p>
                            </div>
                            <div className="rounded-[var(--landing-radius-card)] border border-[var(--landing-color-rule)] bg-[var(--landing-color-paper)] p-6">
                                <Phone className="size-6 text-[var(--landing-color-accent)]" />
                                <h3 className="mt-4 font-semibold text-[var(--landing-color-ink)]">
                                    Demo terarah & relevan
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-[var(--landing-color-ink-soft)]">
                                    Demo difokuskan ke modul yang paling relevan
                                    untuk operasional Anda.
                                </p>
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
