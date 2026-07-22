import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const policySource = await readFile(
    new URL(
        '../../resources/js/pages/hris/leaves/balances.tsx',
        import.meta.url,
    ),
    'utf8',
);
const approvalSource = await readFile(
    new URL(
        '../../resources/js/pages/hris/leave-approvals/index.tsx',
        import.meta.url,
    ),
    'utf8',
);

test('leave policy offers one or two approval levels', () => {
    assert.match(policySource, /approval_levels/);
    assert.match(policySource, /<SelectItem value="1">/);
    assert.match(policySource, /<SelectItem value="2">/);
});

test('leave policy form uses a balanced responsive grid and separate footer', () => {
    assert.match(policySource, /md:grid-cols-2 xl:grid-cols-12/);
    assert.match(policySource, /xl:col-span-4/);
    assert.match(
        policySource,
        /flex justify-end border-t pt-4 md:col-span-2 xl:col-span-12/,
    );
    assert.match(policySource, /Batas per Pengajuan/);
    assert.doesNotMatch(policySource, /Maks Hari \/ Pengajuan/);
});

test('leave approval table displays the active approval stage', () => {
    assert.match(approvalSource, /approval_stage/);
    assert.match(approvalSource, /Menunggu \$\{row\.approval_stage \+ 1\}\/2/);
    assert.match(approvalSource, /Approval tingkat 1:/);
});
