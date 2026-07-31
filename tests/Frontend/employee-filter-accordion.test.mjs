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

test('employee filters are rendered inside a collapsible accordion', () => {
    assert.match(
        source,
        /const \[filtersOpen, setFiltersOpen\] = useState\(true\)/,
    );
    assert.match(source, /aria-expanded=\{filtersOpen\}/);
    assert.match(
        source,
        /onClick=\{\(\) => setFiltersOpen\(\(open\) => !open\)\}/,
    );
    assert.match(source, /filtersOpen \? \(/);
    assert.match(source, /id="employee-filters"/);
});
