import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
    new URL('../../resources/js/pages/careers/show.tsx', import.meta.url),
    'utf8',
);

test('shared career form captures candidate compensation expectations', () => {
    assert.match(source, /Take Home Pay Range/);
    assert.match(source, /take_home_pay_min/);
    assert.match(source, /take_home_pay_max/);
    assert.match(source, /Expected Salary/);
    assert.match(source, /Expected Join Date/);
    assert.match(source, /formatThousandDigits/);
});
