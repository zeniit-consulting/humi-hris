import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const mapSource = readFileSync(
    new URL('../../resources/js/components/mapbox-location-map.tsx', import.meta.url),
    'utf8',
);
const mapStyles = readFileSync(
    new URL('../../resources/css/app.css', import.meta.url),
    'utf8',
);

test('map uses the employee and office marker assets', () => {
    assert.match(mapSource, /map-marker-employee\.png/);
    assert.match(mapSource, /map-marker-office\.png/);
    assert.match(mapSource, /anchor: 'bottom'/);
    assert.match(mapStyles, /mapbox-location-marker-user/);
    assert.match(mapStyles, /mapbox-location-marker-office/);
});
