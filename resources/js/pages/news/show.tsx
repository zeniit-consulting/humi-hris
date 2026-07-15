import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock,
    HelpCircle,
} from 'lucide-react';
import SeoHead from '@/components/seo-head';
import { login } from '@/routes';

type ArticleSection = {
    heading: string;
    body: string[];
};

type Faq = {
    question: string;
    answer: string;
};

type RelatedLink = {
    label: string;
    href: string;
};

type Article = {
    title: string;
    slug: string;
    category: string;
    published_at: string;
    updated_at: string;
    reading_time: string;
    description: string;
    keywords: string;
    hero_summary: string;
    takeaways: string[];
    sections: ArticleSection[];
    faqs: Faq[];
    related_links: RelatedLink[];
};

type ArticleSummary = Pick<
    Article,
    | 'title'
    | 'slug'
    | 'category'
    | 'published_at'
    | 'updated_at'
    | 'reading_time'
    | 'description'
    | 'hero_summary'
    | 'takeaways'
>;

type PageProps = {
    article: Article;
    relatedArticles: ArticleSummary[];
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

export default function NewsShow() {
    const { article, relatedArticles, appUrl } = usePage<PageProps>().props;
    const siteUrl = appUrl.replace(/\/$/, '');
    const articleUrl = `${siteUrl}/berita/${article.slug}`;
    const structuredData = [
        {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.description,
            datePublished: article.published_at,
            dateModified: article.updated_at,
            inLanguage: 'id-ID',
            mainEntityOfPage: articleUrl,
            author: {
                '@type': 'Organization',
                name: 'Humi',
                url: siteUrl,
            },
            publisher: {
                '@type': 'Organization',
                name: 'Humi',
                url: siteUrl,
                logo: {
                    '@type': 'ImageObject',
                    url: `${siteUrl}/logo.png`,
                },
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: article.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
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
                    item: siteUrl,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Berita',
                    item: `${siteUrl}/berita`,
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: article.title,
                    item: articleUrl,
                },
            ],
        },
    ];

    return (
        <>
            <SeoHead
                title={`${article.title} - Humi`}
                description={article.description}
                keywords={article.keywords}
                canonicalPath={`/berita/${article.slug}`}
                type="article"
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
                    <article>
                        <section className="border-b border-slate-100 bg-slate-50/60">
                            <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
                                <Link
                                    href="/berita"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d4d52] transition hover:text-[#14a8b0]"
                                >
                                    <ArrowLeft className="size-4" />
                                    Semua artikel
                                </Link>

                                <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                    <span className="rounded-full bg-[#14a8b0]/10 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#0d4d52] uppercase">
                                        {article.category}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarDays className="size-4" />
                                        {formatDate(article.published_at)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock className="size-4" />
                                        {article.reading_time}
                                    </span>
                                </div>

                                <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                                    {article.title}
                                </h1>
                                <p className="mt-6 text-lg leading-8 text-slate-600 md:text-xl">
                                    {article.hero_summary}
                                </p>
                            </div>
                        </section>

                        <section className="py-12">
                            <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                                <div className="min-w-0">
                                    <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
                                        <h2 className="text-xl font-bold tracking-tight text-slate-950">
                                            Ringkasan cepat
                                        </h2>
                                        <div className="mt-5 space-y-3">
                                            {article.takeaways.map(
                                                (takeaway) => (
                                                    <div
                                                        key={takeaway}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#14a8b0]" />
                                                        <p className="text-sm leading-6 text-slate-700">
                                                            {takeaway}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-10 space-y-10">
                                        {article.sections.map((section) => (
                                            <section key={section.heading}>
                                                <h2 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
                                                    {section.heading}
                                                </h2>
                                                <div className="mt-4 space-y-4">
                                                    {section.body.map(
                                                        (paragraph) => (
                                                            <p
                                                                key={paragraph}
                                                                className="text-base leading-8 text-slate-700"
                                                            >
                                                                {paragraph}
                                                            </p>
                                                        ),
                                                    )}
                                                </div>
                                            </section>
                                        ))}
                                    </div>

                                    <section className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
                                        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                            Pertanyaan yang sering ditanyakan
                                        </h2>
                                        <div className="mt-6 divide-y divide-slate-200">
                                            {article.faqs.map((faq) => (
                                                <div
                                                    key={faq.question}
                                                    className="py-5 first:pt-0 last:pb-0"
                                                >
                                                    <h3 className="flex items-start gap-3 text-base font-semibold text-slate-950">
                                                        <HelpCircle className="mt-0.5 size-5 shrink-0 text-[#14a8b0]" />
                                                        {faq.question}
                                                    </h3>
                                                    <p className="mt-3 pl-8 text-sm leading-7 text-slate-700">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                                    <div className="rounded-3xl border border-slate-200 bg-white p-6">
                                        <h2 className="text-base font-bold text-slate-950">
                                            Lanjutkan eksplorasi
                                        </h2>
                                        <div className="mt-5 space-y-3">
                                            {article.related_links.map(
                                                (link) => (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-[#14a8b0]/50 hover:text-[#0d4d52]"
                                                    >
                                                        {link.label}
                                                        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                                                    </Link>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-3xl bg-[#0d4d52] p-6 text-white">
                                        <h2 className="text-lg font-bold tracking-tight">
                                            Butuh HRIS untuk operasional nyata?
                                        </h2>
                                        <p className="mt-3 text-sm leading-6 text-white/78">
                                            Tim Humi bisa bantu memetakan modul
                                            absensi, payroll, approval, dan
                                            portal karyawan berdasarkan proses
                                            perusahaan Anda.
                                        </p>
                                        <Link
                                            href="/contact"
                                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0d4d52] transition hover:bg-slate-100"
                                        >
                                            Jadwalkan demo
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </div>
                                </aside>
                            </div>
                        </section>
                    </article>

                    {relatedArticles.length > 0 ? (
                        <section className="border-t border-slate-100 bg-slate-50/60 py-14">
                            <div className="mx-auto max-w-6xl px-6">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                    Artikel terkait
                                </h2>
                                <div className="mt-6 grid gap-5 md:grid-cols-3">
                                    {relatedArticles.map((related) => (
                                        <Link
                                            key={related.slug}
                                            href={`/berita/${related.slug}`}
                                            className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#14a8b0]/50 hover:shadow-[0_18px_56px_rgba(15,23,42,0.08)]"
                                        >
                                            <p className="text-xs font-semibold tracking-[0.12em] text-[#0d4d52] uppercase">
                                                {related.category}
                                            </p>
                                            <h3 className="mt-4 text-lg leading-tight font-bold text-slate-950">
                                                {related.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                                {related.description}
                                            </p>
                                            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0d4d52]">
                                                Baca
                                                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ) : null}
                </main>
            </div>
        </>
    );
}
