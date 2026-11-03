import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createInertiaApp } from '@inertiajs/react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ts from 'typescript';

const source = readFileSync(new URL('../../resources/js/components/seo-head.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
}).outputText.replace(/from ["'](@inertiajs\/react|react\/jsx-runtime)["']/g, (_, name) => `from ${JSON.stringify(import.meta.resolve(name))}`);
const { default: SeoHead } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

async function renderHead(seo) {
    const result = await createInertiaApp({
        page: { component: 'test', url: '/berita/test?utm_source=example', version: '', props: { appUrl: 'https://humi.test', seo } },
        render: ReactDOMServer.renderToString,
        resolve: () => () => React.createElement(SeoHead, { title: 'Old title', description: 'Old description', canonicalPath: '/old-path' }),
        setup: ({ App, props }) => React.createElement(App, props),
    });
    return result.head.join('\n');
}

test('React renders server metadata and article dates as individual valid head elements', async () => {
    const head = await renderHead({
        title: 'Panduan HRIS | Humi', description: 'Panduan payroll', type: 'article',
        canonicalUrl: 'https://humi.test/berita/test', imageUrl: 'https://humi.test/og-image.png',
        robots: 'index, follow', publishedTime: '2026-07-08', modifiedTime: '2026-11-03',
        structuredData: [{ '@type': 'Article', headline: '</script><script>alert(1)</script>' }],
    });
    assert.match(head, /<title[^>]*>Panduan HRIS \| Humi<\/title>/);
    assert.match(head, /property="article:published_time" content="2026-07-08"/);
    assert.match(head, /property="article:modified_time" content="2026-11-03"/);
    assert.match(head, /rel="canonical" href="https:\/\/humi.test\/berita\/test"/);
    assert.doesNotMatch(head, /Symbol\(react.fragment\)|<script>alert/);
    const json = head.match(/type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)[1];
    assert.equal(JSON.parse(json)[0].headline, '</script><script>alert(1)</script>');
});

test('React preserves noindex on filtered pages', async () => {
    const head = await renderHead({ robots: 'noindex, follow' });
    assert.match(head, /name="robots" content="noindex, follow"/);
});
