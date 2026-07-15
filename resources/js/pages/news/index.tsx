import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpenText,
    CalendarDays,
    CheckCircle2,
    Clock,
    SearchCheck,
} from 'lucide-react';
import SeoHead from '@/components/seo-head';
import { login, register } from '@/routes';

type ArticleSummary = {
    title: string;
    slug: string;
    category: string;
    published_at: string;
    updated_at: string;
    reading_time: string;
    description: string;
    hero_summary: string;
    takeaways: string[];
};

type PageProps = {
    articles: ArticleSummary[];
    appUrl: string;
};

const formatDate = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${value}T00:00:00+08:00`));

const navLinks = [
    { label: 'Fitur', href: '/features' },
    { label: 'Solusi', href: '/#segments' },
    { label: 'Berita', href: '/berita' },
    { label: 'Kontak', href: '/contact' },
];

export default function NewsIndex() {
    const { articles, appUrl } = usePage<PageProps>().props;
    const siteUrl = appUrl.replace(/\/$/, '');
    const featuredArticle = articles[0];
    const supportingArticles = articles.slice(1);

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Berita Humi',
        url: `${siteUrl}/berita`,
        inLanguage: 'id-ID',
        description:
            'Kumpulan artikel Humi tentang HRIS, aplikasi absensi karyawan, software payroll, outsourcing, dan digitalisasi HR perusahaan Indonesia.',
        publisher: {
            '@type': 'Organization',
            name: 'Humi',
            url: siteUrl,
            logo: `${siteUrl}/logo.png`,
        },
        blogPost: articles.map((article) => ({
            '@type': 'BlogPosting',
            headline: article.title,
            url: `${siteUrl}/berita/${article.slug}`,
            datePublished: article.published_at,
            dateModified: article.updated_at,
            description: article.description,
        })),
    };

    return (
        <>
            <SeoHead
                title="Berita Humi - Panduan HRIS, Absensi, Payroll, dan Digitalisasi HR"
                description="Baca artikel Humi tentang HRIS, aplikasi absensi karyawan, software payroll, outsourcing, dan cara memilih sistem HR untuk perusahaan Indonesia."
                keywords="berita HRIS, artikel HRIS, panduan HRIS, aplikasi absensi karyawan, software payroll Indonesia, digitalisasi HR"
                canonicalPath="/berita"
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
                        <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={
                                        link.href === '/berita'
                                            ? 'rounded-full bg-slate-100 px-4 py-2 text-slate-950'
                                            : 'rounded-full px-4 py-2 transition hover:bg-slate-50 hover:text-slate-950'
                                    }
                                >
                                    {link.label}
                                </Link>
                            ))}
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
                    <section className="border-b border-slate-100 bg-slate-50/60">
                        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
                            <div className="flex flex-col justify-center">
                                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                                    Berita dan panduan HRIS untuk tim HR modern
                                </h1>
                                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                                    Artikel Humi dibuat untuk menjawab
                                    pertanyaan yang sering dicari manajemen, HR,
                                    dan AI answer engine tentang HRIS, absensi,
                                    payroll, outsourcing, dan digitalisasi HR di
                                    Indonesia.
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0d4d52] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3e42]"
                                    >
                                        Konsultasi HRIS
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/features"
                                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300"
                                    >
                                        Lihat Fitur Humi
                                    </Link>
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#14a8b0]/10 text-[#0d4d52]">
                                        <SearchCheck className="size-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-950">
                                            GEO-ready content
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Format jawaban langsung, FAQ, dan
                                            schema.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    {[
                                        'Menjawab query seperti apa itu HRIS, aplikasi absensi, dan software payroll.',
                                        'Memakai struktur ringkasan, poin penting, FAQ, dan link internal.',
                                        'Masuk sitemap agar crawler lebih mudah menemukan halaman.',
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-start gap-3"
                                        >
                                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#14a8b0]" />
                                            <p className="text-sm leading-6 text-slate-700">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="py-16">
                        <div className="mx-auto max-w-6xl px-6">
                            {featuredArticle ? (
                                <Link
                                    href={`/berita/${featuredArticle.slug}`}
                                    className="group grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-[#14a8b0]/50 hover:shadow-[0_22px_70px_rgba(15,23,42,0.1)] lg:grid-cols-[0.9fr_1.1fr]"
                                >
                                    <div className="flex min-h-[280px] flex-col justify-between bg-[#0d4d52] p-8 text-white">
                                        <div>
                                            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase">
                                                Artikel pilihan
                                            </span>
                                            <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
                                                {featuredArticle.title}
                                            </h2>
                                        </div>
                                        <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white">
                                            Baca panduan
                                            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                                        </span>
                                    </div>
                                    <div className="p-8">
                                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                                            <span className="rounded-full bg-[#14a8b0]/10 px-3 py-1 text-[#0d4d52]">
                                                {featuredArticle.category}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <CalendarDays className="size-3.5" />
                                                {formatDate(
                                                    featuredArticle.published_at,
                                                )}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="size-3.5" />
                                                {featuredArticle.reading_time}
                                            </span>
                                        </div>
                                        <p className="mt-5 text-base leading-7 text-slate-700">
                                            {featuredArticle.hero_summary}
                                        </p>
                                        <div className="mt-6 space-y-3">
                                            {featuredArticle.takeaways.map(
                                                (takeaway) => (
                                                    <div
                                                        key={takeaway}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <BookOpenText className="mt-0.5 size-5 shrink-0 text-[#14a8b0]" />
                                                        <p className="text-sm leading-6 text-slate-600">
                                                            {takeaway}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ) : null}

                            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {supportingArticles.map((article) => (
                                    <Link
                                        key={article.slug}
                                        href={`/berita/${article.slug}`}
                                        className="group flex min-h-[360px] flex-col rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#14a8b0]/50 hover:shadow-[0_18px_56px_rgba(15,23,42,0.08)]"
                                    >
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                                                {article.category}
                                            </span>
                                            <span>{article.reading_time}</span>
                                        </div>
                                        <h2 className="mt-5 text-xl leading-tight font-bold tracking-tight text-slate-950">
                                            {article.title}
                                        </h2>
                                        <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">
                                            {article.description}
                                        </p>
                                        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0d4d52]">
                                            Baca artikel
                                            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-slate-100 bg-slate-50/60 py-14">
                        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                    Ingin lihat Humi berdasarkan kebutuhan
                                    perusahaan?
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                    Buka halaman solusi untuk outsourcing,
                                    retail/F&B, atau manufaktur shift agar
                                    konteks implementasi lebih spesifik.
                                </p>
                            </div>
                            <Link
                                href={register()}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0d4d52] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3e42]"
                            >
                                Coba Gratis
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
