import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(
    new URL('../../resources/js/pages/dashboard.tsx', import.meta.url),
    'utf8',
);

test('dashboard keeps the approved compact density contract', () => {
    assert.match(source, /space-y-6 p-4/);
    assert.match(source, /Selamat datang, \{userName\}/);
    assert.doesNotMatch(source, /Action Queue/);
    assert.match(source, /Pending actions/);
    assert.match(source, /actionQueue\.items\.map/);
    assert.match(source, /border-rose-200 bg-rose-50\/70/);
    assert.match(source, /grid gap-4 sm:grid-cols-2 xl:grid-cols-8/);
    assert.match(source, /Total Karyawan/);
    assert.match(source, /Karyawan Aktif/);
    assert.match(source, /Total Divisi/);
    assert.match(source, /Total Jabatan/);
    assert.match(source, /grid gap-4 xl:grid-cols-3/);
    assert.match(source, /h-36/);
    assert.match(source, /max-h-64[^"\n]*overflow-y-auto/);
});
