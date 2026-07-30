import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { transformSync } from 'esbuild';

const source = readFileSync(
    new URL('../../resources/js/pages/portal/lib.ts', import.meta.url),
    'utf8',
);

const compiled = transformSync(source, {
    format: 'esm',
    loader: 'ts',
    target: 'es2022',
}).code;

const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`;
const portalLib = await import(moduleUrl);

test('attendance notification setup card is hidden after push notification activation exists', () => {
    assert.equal(portalLib.shouldShowAttendanceNotificationSetup(false), true);
    assert.equal(portalLib.shouldShowAttendanceNotificationSetup(true), false);
});
