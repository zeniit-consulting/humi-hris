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

test('employee form places birth place before birth date', () => {
    const birthPlaceInput = source.indexOf('id="birth_place"');
    const birthDateInput = source.indexOf('id="birth_date"');

    assert.notEqual(birthPlaceInput, -1);
    assert.notEqual(birthDateInput, -1);
    assert.ok(birthPlaceInput < birthDateInput);
    assert.match(source, /employeeForm\.data\.birth_place/);
    assert.match(source, /employeeForm\.errors\.birth_place/);
});
