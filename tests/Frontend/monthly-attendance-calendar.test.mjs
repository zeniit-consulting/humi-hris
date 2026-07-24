import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
    new URL(
        '../../resources/js/pages/hris/attendances/monthly.tsx',
        import.meta.url,
    ),
    'utf8',
);

test('monthly attendance highlights dates without attendance data', () => {
    assert.match(source, /row\.is_missing/);
    assert.match(source, /bg-red-50\/70/);
    assert.match(source, /row\.status === 'absent'/);
    assert.match(source, /Tidak ada data kehadiran/);
});
