import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
    new URL('../../resources/js/pages/portal/shell.tsx', import.meta.url),
    'utf8',
);

test('portal page header title uses 700 weight and expanded 20 percent spacing', () => {
    assert.match(
        source,
        /<h1 className="[^"]*font-bold[^"]*tracking-\[0\.2em\][^"]*">/,
    );
});
