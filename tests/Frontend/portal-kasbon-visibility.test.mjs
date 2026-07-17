import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const portalSource = await readFile(
    new URL('../../resources/js/pages/portal/index.tsx', import.meta.url),
    'utf8',
);
const serviceWorkerSource = await readFile(
    new URL('../../public/sw.js', import.meta.url),
    'utf8',
);

test('portal only shows Kasbon after the server explicitly enables it', () => {
    assert.match(portalSource, /summary\?\.features\?\.kasbon === true/);
    assert.doesNotMatch(
        portalSource,
        /summary\?\.features\?\.kasbon !== false/,
    );
});

test('service worker never serves authenticated portal APIs from cache', () => {
    assert.match(serviceWorkerSource, /isAuthenticatedApiRequest\(url\)/);
    assert.match(serviceWorkerSource, /event\.respondWith\(fetch\(request\)\)/);
    assert.doesNotMatch(
        serviceWorkerSource,
        /\/\\\/portal\\\/api\\\/summary\//,
    );
});
