import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
    new URL(
        '../../resources/js/pages/hris/employees/index.tsx',
        import.meta.url,
    ),
    'utf8',
);

test('employee form provides a default attendance timezone', () => {
    assert.match(source, /timezone: string/);
    assert.match(source, /Zona Waktu Utama/);
    assert.match(source, /Asia\/Jakarta/);
    assert.match(source, /Asia\/Makassar/);
    assert.match(source, /Asia\/Jayapura/);
});
