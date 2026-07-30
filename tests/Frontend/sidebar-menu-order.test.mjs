import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
    new URL('../../resources/js/components/app-sidebar.tsx', import.meta.url),
    'utf8',
);

test('main sidebar keeps HRIS navigation in at most five ordered groups', () => {
    const buildNavGroupsBody = source.match(
        /function buildNavGroups[\s\S]*?return \[([\s\S]*?)\n\s{4}\];/,
    )?.[1];

    assert.ok(buildNavGroupsBody, 'buildNavGroups return array should exist');

    const groupTitles = [...buildNavGroupsBody.matchAll(/title: '([^']+)'/g)]
        .map((match) => match[1])
        .filter((title) =>
            [
                'Organisasi',
                'Waktu Kerja',
                'Approval',
                'Payroll',
                'Operasional',
            ].includes(title),
        );

    assert.deepEqual(groupTitles, [
        'Organisasi',
        'Waktu Kerja',
        'Approval',
        'Payroll',
        'Operasional',
    ]);
    assert.equal(groupTitles.length, 5);
    assert.doesNotMatch(buildNavGroupsBody, /title: 'SDM'/);
});

test('platform menu is merged when the normal sidebar already has five groups', () => {
    assert.match(source, /mainNavGroups\.length >= 5/);
    assert.match(source, /mainNavGroups\[mainNavGroups\.length - 1\]\.items\.push/);
});
