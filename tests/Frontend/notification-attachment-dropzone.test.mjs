import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(
    new URL(
        '../../resources/js/pages/hris/notifications/index.tsx',
        import.meta.url,
    ),
    'utf8',
);

test('notification form provides a Dropzone attachment upload', () => {
    assert.match(source, /import Dropzone from ['"]dropzone['"]/);
    assert.match(source, /attachment: File \| null/);
    assert.match(source, /new Dropzone/);
    assert.match(source, /form\.setData\('attachment'/);
});
