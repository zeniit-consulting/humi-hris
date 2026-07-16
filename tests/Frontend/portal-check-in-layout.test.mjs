import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
    new URL('../../resources/js/pages/portal/check-in.tsx', import.meta.url),
    'utf8',
);

test('check-in keeps the map full screen with one unified bottom action card', () => {
    assert.match(source, /data-testid="portal-checkin-canvas"/);
    assert.equal(
        (source.match(/data-testid="portal-checkin-card"/g) ?? []).length,
        1,
    );
    assert.doesNotMatch(source, /bg-gradient-to-b/);
});
