const test = require('node:test');
const assert = require('node:assert/strict');
const { similarity, check } = require('../dist/cjs/index.js');

test('CommonJS build works', () => {
  assert.equal(similarity('Molière', 'moliere'), 100);
  assert.equal(check('beatles', 'The Beatles', { preset: 'music' }).correct, true);
});
