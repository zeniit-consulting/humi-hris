import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(
    new URL('../../resources/js/pages/auth/portal-login.tsx', import.meta.url),
    'utf8',
);

test('portal login only exposes employee id and WhatsApp number', () => {
    assert.match(source, /employee_code/);
    assert.match(source, /phone/);
    assert.doesNotMatch(source, /InputOTP|OTP Email|send-otp|verify-otp/);
});
