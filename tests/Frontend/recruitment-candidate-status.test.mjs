import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
    new URL(
        '../../resources/js/pages/hris/recruitment/index.tsx',
        import.meta.url,
    ),
    'utf8',
);

test('candidate tracker updates stage directly from the table', () => {
    assert.match(source, /updateCandidateStage/);
    assert.match(source, /router\.put\(/);
    assert.match(source, /Data Masuk/);
    assert.match(source, /Diinterview/);
    assert.match(source, /Diterima/);
    assert.match(source, /updatingApplicationId\s*===\s*application\.id/);
});

test('candidate tracker captures candidate compensation and join expectations', () => {
    assert.match(source, /Take Home Pay Range/);
    assert.match(source, /take_home_pay_min/);
    assert.match(source, /take_home_pay_max/);
    assert.match(source, /Expected Salary/);
    assert.match(source, /expected_join_date/);
    assert.match(source, /Expected Join Date/);
});
