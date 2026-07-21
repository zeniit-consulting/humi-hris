import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(
    new URL('../../resources/js/pages/dashboard.tsx', import.meta.url),
    'utf8',
);

test('dashboard renders three compact operational cards', () => {
    assert.match(source, /xl:grid-cols-3/);
    assert.match(source, /Reminder Kontrak & Probation/);
    assert.match(source, /contractReminders\.items/);
    assert.match(source, /attendanceFocus\.items/);

    assert.ok(
        source.indexOf('Request Terbaru') <
            source.indexOf('Reminder Kontrak & Probation'),
    );
});
