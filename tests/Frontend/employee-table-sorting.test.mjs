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

test('employee table headers trigger server-side sorting', () => {
    assert.match(source, /const handleSort/);
    assert.match(source, /sort: key/);
    assert.match(source, /<SortableEmployeeHeader/);
    assert.match(source, /sortKey="name"/);
    assert.match(source, /sortKey="hire_date"/);
});
