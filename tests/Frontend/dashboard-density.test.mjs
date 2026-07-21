import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(
    new URL('../../resources/js/pages/dashboard.tsx', import.meta.url),
    'utf8',
);

test('dashboard keeps the approved compact density contract', () => {
    assert.match(source, /space-y-\[14px\] p-3 sm:p-4/);
    assert.match(source, /grid gap-\[14px\] md:grid-cols-2 xl:grid-cols-5/);
    assert.match(source, /grid gap-\[14px\] xl:grid-cols-3/);
    assert.match(source, /h-36/);
    assert.match(source, /max-h-64[^"\n]*overflow-y-auto/);
});
