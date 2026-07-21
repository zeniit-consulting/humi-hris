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

test('employee export opens a category selection dialog', () => {
    assert.match(source, /employeeExportDialogOpen/);
    assert.match(source, /Pilih Data Export/);
    assert.match(source, /Data Pribadi/);
    assert.match(source, /Data Administrasi/);
    assert.match(source, /Data Payroll/);
    assert.match(source, /Data Pekerjaan/);
    assert.match(source, /Seluruhnya/);
    assert.match(source, /category: employeeExportCategory/);
    assert.match(source, /employeeExportFormat/);
    assert.match(source, /format: employeeExportFormat/);
    assert.match(source, /XLS/);
    assert.match(source, /PDF/);
});
