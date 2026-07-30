import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const landingNavSource = readFileSync(
    new URL('../../resources/js/components/landing-nav.tsx', import.meta.url),
    'utf8',
);
const welcomeSource = readFileSync(
    new URL('../../resources/js/pages/welcome.tsx', import.meta.url),
    'utf8',
);

test('landing header keeps login beside the trial CTA', () => {
    assert.match(landingNavSource, /landing-nav-actions/);
    assert.match(landingNavSource, /gap-2/);
    assert.match(landingNavSource, /Masuk/);
    assert.match(landingNavSource, /Mulai Trial Gratis/);
});

test('landing pricing presents all plans in one responsive row and keeps Plus white', () => {
    assert.match(welcomeSource, /md:grid-cols-3/);
    assert.match(welcomeSource, /pricingPlans\.map/);
    assert.match(welcomeSource, /text-white/);
});

test('landing footer uses a light teal surface and backlink menu', () => {
    assert.match(welcomeSource, /bg-\[var\(--landing-color-accent-soft\)\]/);
    assert.match(welcomeSource, /landing-footer-links/);
    assert.match(welcomeSource, /Produk/);
    assert.match(welcomeSource, /Solusi/);
    assert.match(welcomeSource, /Karier/);
});
