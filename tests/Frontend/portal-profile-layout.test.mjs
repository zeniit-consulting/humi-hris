import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
    new URL('../../resources/js/pages/portal/profile.tsx', import.meta.url),
    'utf8',
);

test('profile uses a Humi teal identity hero and compact accordion sections', () => {
    assert.match(source, /profile-identity-hero/);
    assert.match(source, /bg-\[var\(--portal-color-accent-strong\)\]/);
    assert.match(source, /Data Pribadi/);
    assert.match(source, /Kontak & Data Keluarga/);
    assert.match(source, /Identitas & Kepesertaan/);
    assert.match(source, /Rekening Utama/);
    assert.match(source, /function ProfileAccordion/);
    assert.match(source, /min-h-14/);
});

test('profile and bank saving contracts remain unchanged', () => {
    assert.match(
        source,
        /requestApi\(\s*'\/portal\/api\/profile'\s*,\s*'PUT'/,
    );
    assert.match(
        source,
        /requestApi\(\s*'\/portal\/api\/profile\/bank-account'\s*,\s*'PUT'/,
    );
    assert.match(source, /onSubmit=\{handleSaveProfile\}/);
    assert.match(source, /onSubmit=\{handleSaveBank\}/);
});
