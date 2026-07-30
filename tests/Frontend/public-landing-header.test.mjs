import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const landingNavUrl = new URL(
    '../../resources/js/components/landing-nav.tsx',
    import.meta.url,
);
const welcomeSource = readFileSync(
    new URL('../../resources/js/pages/welcome.tsx', import.meta.url),
    'utf8',
);
const newsIndexSource = readFileSync(
    new URL('../../resources/js/pages/news/index.tsx', import.meta.url),
    'utf8',
);
const newsShowSource = readFileSync(
    new URL('../../resources/js/pages/news/show.tsx', import.meta.url),
    'utf8',
);
const contactSource = readFileSync(
    new URL('../../resources/js/pages/contact.tsx', import.meta.url),
    'utf8',
);

test('public pages share the default home landing header', () => {
    assert.equal(existsSync(landingNavUrl), true);

    const landingNavSource = readFileSync(landingNavUrl, 'utf8');

    assert.match(landingNavSource, /src="\/humi-wordmark\.png"/);
    assert.match(landingNavSource, /Navigasi utama/);
    assert.match(landingNavSource, /\['Produk', '#product'\]/);
    assert.match(landingNavSource, /\['Harga', '#pricing'\]/);

    for (const source of [
        welcomeSource,
        newsIndexSource,
        newsShowSource,
        contactSource,
    ]) {
        assert.match(source, /LandingNav/);
        assert.match(source, /<LandingNav/);
    }

    for (const source of [newsIndexSource, newsShowSource, contactSource]) {
        assert.doesNotMatch(source, /src="\/logo\.png"/);
    }
});
