import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const portalSource = readFileSync(
    new URL(
        '../../resources/js/pages/portal/attendance-request.tsx',
        import.meta.url,
    ),
    'utf8',
);
const approvalSource = readFileSync(
    new URL(
        '../../resources/js/pages/hris/attendance-approvals/index.tsx',
        import.meta.url,
    ),
    'utf8',
);

test('portal attendance request exposes Lupa Absen and Lupa Absen Pulang categories', () => {
    assert.match(portalSource, /value="manual_attendance"/);
    assert.match(portalSource, /value="missing_clock_out"/);
    assert.match(portalSource, /Lupa Absen Pulang/);
    assert.match(portalSource, /form\.request_type === 'missing_clock_out'/);
});

test('attendance approval page displays the request category', () => {
    assert.match(approvalSource, /request_type: 'manual_attendance' \| 'missing_clock_out'/);
    assert.match(approvalSource, /Lupa Absen Pulang/);
});
