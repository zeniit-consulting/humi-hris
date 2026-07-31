import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const adminSource = await readFile(
    new URL('../../resources/js/pages/hris/surveys/index.tsx', import.meta.url),
    'utf8',
);
const portalSource = await readFile(
    new URL('../../resources/js/pages/portal/surveys.tsx', import.meta.url),
    'utf8',
);

test('survey builder supports Google Forms question types and options', () => {
    assert.match(adminSource, /type SurveyQuestionType/);
    assert.match(adminSource, /long_text/);
    assert.match(adminSource, /numeric/);
    assert.match(adminSource, /checkbox/);
    assert.match(adminSource, /radio/);
    assert.match(adminSource, /questions: SurveyQuestion\[\]/);
    assert.match(adminSource, /Tambah pertanyaan/);
});

test('employee survey form renders typed answer controls', () => {
    assert.match(portalSource, /question\.type === 'long_text'/);
    assert.match(portalSource, /question\.type === 'date'/);
    assert.match(portalSource, /question\.type === 'numeric'/);
    assert.match(portalSource, /question\.type === 'checkbox'/);
    assert.match(portalSource, /question\.type === 'radio'/);
});
