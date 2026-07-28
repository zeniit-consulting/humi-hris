import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
    new URL('../../resources/js/pages/portal/attendance.tsx', import.meta.url),
    'utf8',
);

test('attendance history keeps the date in each entry without a separate left date rail', () => {
    assert.doesNotMatch(source, /flex w-12 shrink-0 flex-col items-center/);
    assert.doesNotMatch(source, /mt-2 size-2 rounded-full/);
    assert.match(
        source,
        /<p className="text-sm font-semibold">[\s\S]{0,120}formatDate\([\s\S]{0,120}item\.attendance_date/,
    );
});

test('schedule actions are displayed in one balanced row', () => {
    assert.match(
        source,
        /<div className="mt-4 flex gap-2">[\s\S]{0,900}Ubah Jadwal[\s\S]{0,900}Req Absensi/,
    );
    assert.match(source, /h-12 flex-1/);
    assert.doesNotMatch(source, /mt-2 inline-flex h-12 w-full/);
});
