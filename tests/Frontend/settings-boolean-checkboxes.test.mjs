import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
    new URL('../../resources/js/pages/settings/profile.tsx', import.meta.url),
    'utf8',
);

test('company boolean settings submit explicit controlled values', () => {
    assert.match(source, /const \[portalKasbonEnabled/);
    assert.match(source, /name="portal_kasbon_enabled"/);
    assert.match(source, /value=\{portalKasbonEnabled \? '1' : '0'\}/);
    assert.match(source, /checked=\{portalKasbonEnabled\}/);
    assert.doesNotMatch(
        source,
        /defaultChecked=\{company\.portal_kasbon_enabled\}/,
    );
});

test('company boolean settings are inside the company settings form', () => {
    const companyForm = source.indexOf('CompanySettingController.update.form()');
    const kasbonField = source.indexOf('name="portal_kasbon_enabled"');
    const otpField = source.indexOf('name="employee_activation_otp_enabled"');

    assert.ok(companyForm >= 0);
    assert.ok(kasbonField > companyForm);
    assert.ok(otpField > companyForm);
});

test('company settings do not submit a blank attendance location by default', () => {
    assert.match(
        source,
        /const \[attendanceLocations, setAttendanceLocations\] = useState\(\s*company\.attendance_locations\.length > 0\s*\? company\.attendance_locations\s*:\s*\[\],/s,
    );
});

test('profile avatar preview synchronizes with the R2 URL returned after save', () => {
    assert.match(
        source,
        /useEffect\(\(\) => \{\s*setAvatarPreview\(\s*\(auth\.user\.avatar as string \| null \| undefined\) \?\? null,\s*\);\s*\}, \[auth\.user\.avatar\]\);/s,
    );
});
