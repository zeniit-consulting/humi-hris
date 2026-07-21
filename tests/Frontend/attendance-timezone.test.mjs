import assert from 'node:assert/strict';
import test from 'node:test';

import {
    formatAttendanceTime,
    toAttendanceDateTimeInput,
} from '../../resources/js/lib/attendance-timezone.ts';

test('attendance time remains in its source timezone', () => {
    assert.equal(
        formatAttendanceTime('2026-07-20T01:30:00+00:00', 'Asia/Jakarta'),
        '08.30 WIB',
    );
    assert.equal(
        formatAttendanceTime('2026-07-20T01:30:00+00:00', 'Asia/Makassar'),
        '09.30 WITA',
    );
});

test('attendance edit input uses the stored source timezone', () => {
    assert.equal(
        toAttendanceDateTimeInput(
            '2026-07-20T01:30:00+00:00',
            'Asia/Jakarta',
        ),
        '2026-07-20T08:30',
    );
});
