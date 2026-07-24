import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
    new URL('../../resources/js/pages/settings/profile.tsx', import.meta.url),
    'utf8',
);

test('company boolean settings submit explicit controlled values', () => {
    assert.match(source, /const \[portalKasbonEnabled/);
    assert.match(source, /name="portal_kasbon_enabled"/);
    assert.match(source, /value=\{portalKasbonEnabled \? '1' : '0'\}/);
    assert.match(source, /checked=\{portalKasbonEnabled\}/);
    assert.doesNotMatch(
        source,
        /defaultChecked=\{company\.portal_kasbon_enabled\}/,
    );
});
