import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const typographySource = readFileSync(
    new URL(
        '../../resources/js/components/front-hero-typography.ts',
        import.meta.url,
    ),
    'utf8',
);

const publicHeroPages = [
    '../../resources/js/pages/welcome.tsx',
    '../../resources/js/pages/features.tsx',
    '../../resources/js/pages/news/index.tsx',
    '../../resources/js/pages/news/show.tsx',
    '../../resources/js/pages/contact.tsx',
    '../../resources/js/pages/landing/industry.tsx',
    '../../resources/js/pages/landing/mintlify.tsx',
    '../../resources/js/pages/careers/index.tsx',
];

test('front website hero typography uses the requested shared title and subtitle styles', () => {
    assert.match(
        typographySource,
        /frontHeroTitleClass =\s*'font-bold text-\[40px\] leading-\[56px\] text-\[rgb\(35,41,51\)\]'/,
    );
    assert.match(
        typographySource,
        /frontHeroSubtitleClass =\s*'font-normal text-\[16px\] leading-\[24px\] text-\[rgb\(35,41,51\)\]'/,
    );
    assert.match(typographySource, /frontHeroTealTextClass/);

    const tokenSource = readFileSync(
        new URL('../../tokens.css', import.meta.url),
        'utf8',
    );
    assert.match(tokenSource, /--landing-font-display: 'Inter'/);
    assert.match(tokenSource, /--landing-font-body: 'Inter'/);
    assert.match(tokenSource, /--portal-font-display: 'Inter'/);
    assert.match(tokenSource, /--portal-font-body:\s*'Inter'/);

    const appCssSource = readFileSync(
        new URL('../../resources/css/app.css', import.meta.url),
        'utf8',
    );
    assert.match(appCssSource, /--font-sans:\s*'Inter'/);

    const appBladeSource = readFileSync(
        new URL('../../resources/views/app.blade.php', import.meta.url),
        'utf8',
    );
    assert.match(appBladeSource, /family=Inter:wght@100\.\.900/);

    for (const page of publicHeroPages) {
        const source = readFileSync(new URL(page, import.meta.url), 'utf8');

        assert.match(source, /frontHeroTitleClass/);
        assert.match(source, /frontHeroSubtitleClass/);
    }

    const welcomeSource = readFileSync(
        new URL('../../resources/js/pages/welcome.tsx', import.meta.url),
        'utf8',
    );
    assert.match(welcomeSource, /whitespace-nowrap/);
    assert.match(welcomeSource, /Kelola tim Anda/);
    assert.match(welcomeSource, /frontHeroTealTextClass/);
    assert.match(welcomeSource, /dengan lebih sederhana/);
    assert.match(welcomeSource, /rounded-\[2%\]/);
    assert.match(welcomeSource, /border border-\[var\(--landing-color-rule\)\]/);
    assert.doesNotMatch(welcomeSource, /rounded-\[15%\]/);
    assert.doesNotMatch(welcomeSource, /rounded-\[14%\]/);
});
