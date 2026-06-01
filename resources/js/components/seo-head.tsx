import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

const DEFAULT_IMAGE = '/icons/icon-512.png';

type StructuredData = Record<string, unknown> | Record<string, unknown>[];

type SeoHeadProps = {
    title: string;
    description: string;
    keywords?: string;
    canonicalPath?: string;
    image?: string;
    type?: 'website' | 'article';
    noIndex?: boolean;
    structuredData?: StructuredData;
    children?: ReactNode;
};

const toAbsoluteUrl = (baseUrl: string, value: string) => {
    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    const base = baseUrl.replace(/\/$/, '');
    const path = value.startsWith('/') ? value : `/${value}`;

    return `${base}${path}`;
};

export default function SeoHead({
    title,
    description,
    keywords,
    canonicalPath,
    image = DEFAULT_IMAGE,
    type = 'website',
    noIndex = false,
    structuredData,
    children,
}: SeoHeadProps) {
    const page = usePage();
    const props = page.props as { appUrl?: string };
    const appUrl =
        props.appUrl ??
        (typeof window !== 'undefined' ? window.location.origin : '');
    const path = canonicalPath ?? page.url.split('?')[0] ?? '/';
    const canonicalUrl = toAbsoluteUrl(appUrl, path);
    const imageUrl = toAbsoluteUrl(appUrl, image);
    const robots = noIndex
        ? 'noindex, nofollow, noarchive'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    return (
        <Head title={title}>
            <meta
                head-key="description"
                name="description"
                content={description}
            />
            {keywords ? (
                <meta head-key="keywords" name="keywords" content={keywords} />
            ) : null}
            <meta head-key="robots" name="robots" content={robots} />
            <link head-key="canonical" rel="canonical" href={canonicalUrl} />

            <meta head-key="og:type" property="og:type" content={type} />
            <meta head-key="og:title" property="og:title" content={title} />
            <meta
                head-key="og:description"
                property="og:description"
                content={description}
            />
            <meta head-key="og:url" property="og:url" content={canonicalUrl} />
            <meta head-key="og:image" property="og:image" content={imageUrl} />
            <meta
                head-key="og:image:alt"
                property="og:image:alt"
                content="Humi HRIS"
            />
            <meta head-key="og:locale" property="og:locale" content="id_ID" />

            <meta
                head-key="twitter:card"
                name="twitter:card"
                content="summary"
            />
            <meta
                head-key="twitter:title"
                name="twitter:title"
                content={title}
            />
            <meta
                head-key="twitter:description"
                name="twitter:description"
                content={description}
            />
            <meta
                head-key="twitter:image"
                name="twitter:image"
                content={imageUrl}
            />

            {structuredData ? (
                <script
                    head-key="structured-data"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            ) : null}

            {children}
        </Head>
    );
}
