import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appLogoSource = readFileSync(
    new URL('../../resources/js/components/app-logo.tsx', import.meta.url),
    'utf8',
);
const landingSource = readFileSync(
    new URL('../../resources/js/pages/welcome.tsx', import.meta.url),
    'utf8',
);
const landingNavSource = readFileSync(
    new URL('../../resources/js/components/landing-nav.tsx', import.meta.url),
    'utf8',
);

test('sidebar brand uses the current Humi wordmark asset', () => {
    assert.match(appLogoSource, /src="\/humi-wordmark\.png"/);
    assert.doesNotMatch(appLogoSource, /AppLogoIcon/);
    assert.match(appLogoSource, /group-data-\[collapsible=icon\]:w-8/);
});

test('landing header footer and structured data use the current Humi wordmark asset', () => {
    assert.match(landingSource, /logo: `\$\{siteUrl\}\/humi-wordmark\.png`/);
    assert.match(landingNavSource, /src="\/humi-wordmark\.png"/);
    assert.match(landingSource, /src="\/humi-wordmark\.png"/);
});
