import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(
    new URL(
        '../../resources/js/pages/hris/employees/index.tsx',
        import.meta.url,
    ),
    'utf8',
);

test('employee page provides separate resigned employee navigation', () => {
    assert.match(source, /employeeList === 'resigned'/);
    assert.match(source, /employeeRoutes\.resigned/);
    assert.match(source, /Karyawan Resign/);
    assert.match(source, /Kembali ke Data Karyawan/);
});
