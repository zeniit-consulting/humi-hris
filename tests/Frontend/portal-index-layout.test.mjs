import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
    new URL('../../resources/js/pages/portal/index.tsx', import.meta.url),
    'utf8',
);

test('portal home uses a horizontal Quick Menu and compact one-row statistics', () => {
    assert.match(source, /Quick Menu/);
    assert.doesNotMatch(source, /Akses cepat/);
    assert.doesNotMatch(source, /Kebutuhan Anda/);
    assert.doesNotMatch(source, /Cuti sakit/);
    assert.match(source, /grid grid-cols-3 gap-2 sm:gap-3/);
    assert.match(source, /portal-horizontal-scroll/);
    assert.match(source, /border-\[var\(--portal-color-accent\)\]/);
});

test('portal home prioritizes the employee greeting over the position label', () => {
    assert.match(source, /text-base font-bold[\s\S]{0,200}Halo, \{firstName\}/);
    assert.match(
        source,
        /text-xs font-normal[\s\S]{0,200}employee\?\.position\?\.name/,
    );
});

test('Statistik and Quick Menu labels use the compact 0.95rem size', () => {
    assert.match(
        source,
        /id="statistik-karyawan"[\s\S]{0,160}text-\[0\.95rem\][\s\S]{0,120}Statistik/,
    );
    assert.match(
        source,
        /id="quick-menu"[\s\S]{0,160}text-\[0\.95rem\][\s\S]{0,120}Quick Menu/,
    );
});

test('portal attendance header only shows the date and shift code', () => {
    assert.doesNotMatch(source, /Presensi hari ini/);
    assert.doesNotMatch(source, /attendanceFocus\.description/);
    assert.match(source, /summary\?\.today\.formatted/);
    assert.match(source, /quick_action\.shift[\s\S]{0,100}\?\.code \?\? '—'/);
    assert.doesNotMatch(source, /quick_action\.shift\?\.start_time/);
    assert.doesNotMatch(source, /quick_action\.shift\?\.end_time/);
});

test('portal attendance header aligns the date with the shift code', () => {
    assert.match(
        source,
        /flex items-center justify-between gap-3[\s\S]{0,500}summary\?\.today\.formatted[\s\S]{0,500}quick_action\.shift/,
    );
    assert.doesNotMatch(
        source,
        /portal-tabular mt-4 rounded-\[calc\(var\(--portal-radius-control\)-0\.125rem\)\]/,
    );
});

test('portal attendance card straddles the extended teal header boundary', () => {
    assert.match(source, /portal-top-header/);
    assert.match(source, /pb-28[\s\S]{0,160}sm:pb-32/);
    assert.match(source, /<main className="flex-1 pt-0">/);
    assert.match(source, /-mt-24[\s\S]{0,220}sm:-mt-28/);
    assert.match(source, /-mt-24[\s\S]{0,220}bg-\[var\(--portal-color-surface\)\]/);
    assert.doesNotMatch(
        source,
        /-mt-24[\s\S]{0,220}surface-glass-strong/,
    );
    assert.match(
        source,
        /text-\[var\(--portal-color-paper\)\][\s\S]{0,200}Halo, \{firstName\}/,
    );
    assert.match(
        source,
    /text-\[var\(--portal-color-paper\)\][\s\S]{0,200}employee\?\.position\?\.name/,
    );
});
