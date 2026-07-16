import assert from 'node:assert/strict';
import test from 'node:test';

import {
    formatThousandDigits,
    normalizeDigitInput,
} from '../../resources/js/lib/currency-input.ts';

test('normalizeDigitInput keeps only whole-number digits', () => {
    assert.equal(normalizeDigitInput('Rp 12.345.678'), '12345678');
    assert.equal(normalizeDigitInput(''), '');
});

test('formatThousandDigits formats clean or masked values for Indonesian input', () => {
    assert.equal(formatThousandDigits('12345678'), '12.345.678');
    assert.equal(formatThousandDigits('Rp 12.345'), '12.345');
    assert.equal(formatThousandDigits(''), '');
});
