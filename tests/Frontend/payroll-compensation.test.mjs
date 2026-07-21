import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const employeeSource = await readFile(
    new URL(
        '../../resources/js/pages/hris/employees/index.tsx',
        import.meta.url,
    ),
    'utf8',
);
const payrollSource = await readFile(
    new URL(
        '../../resources/js/pages/hris/payrolls/index.tsx',
        import.meta.url,
    ),
    'utf8',
);

test('employee wizard manages multiple fixed allowances', () => {
    assert.match(employeeSource, /fixed_allowances:\s*\[\]/);
    assert.match(employeeSource, /Tambah Tunjangan Tetap/);
    assert.match(employeeSource, /Komponen bulanan tanpa batas waktu/);
    assert.match(employeeSource, /selectedEmployee\.allowances\.map/);
});

test('draft payroll manages variable allowances and bonuses separately', () => {
    assert.match(payrollSource, /variable_allowances/);
    assert.match(payrollSource, /bonus_breakdown/);
    assert.match(payrollSource, /title="Tunjangan Tidak Tetap"/);
    assert.match(payrollSource, /title="Bonus"/);
});
