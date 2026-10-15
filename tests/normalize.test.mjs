import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize } from '../dist/esm/index.js';

test('default: lower case, no accents, no punctuation, single spaces', () => {
  assert.equal(normalize('  Saint-Étienne !! '), 'saint etienne');
  assert.equal(normalize('Ça   VA'), 'ca va');
});

test('ligatures are expanded', () => {
  assert.equal(normalize('Cœur Æther Straße'), 'coeur aether strasse');
});

test('apostrophes are removed, not turned into spaces', () => {
  assert.equal(normalize("Don't Stop Me Now"), 'dont stop me now');
  assert.equal(normalize('Don’t'), 'dont');
});

test('punctuation strategies', () => {
  assert.equal(normalize('saint-nazaire', { punctuation: 'remove' }), 'saintnazaire');
  assert.equal(normalize('AC/DC', { punctuation: 'keep' }), 'ac/dc');
});

test('case and accent sensitivity', () => {
  assert.equal(normalize('Éte', { caseSensitive: true }), 'Ete');
  assert.equal(normalize('Été', { accentSensitive: true }), 'été');
});

test('replace works on whole words only', () => {
  assert.equal(normalize('St Malo', { replace: { st: 'saint' } }), 'saint malo');
  assert.equal(normalize('Stairs', { replace: { st: 'saint' } }), 'stairs');
  assert.equal(normalize('Simon & Garfunkel', { replace: { '&': 'and' } }), 'simon and garfunkel');
  assert.equal(normalize('NYC', { replace: { nyc: 'New York City' } }), 'new york city');
});

test('ignoreWords removes whole words', () => {
  assert.equal(normalize('Le Petit Prince', { ignoreWords: ['le', 'la'] }), 'petit prince');
  assert.equal(normalize('Apple Inc.', { ignoreWords: ['Inc'] }), 'apple');
});

test('strip rules', () => {
  assert.equal(normalize('Hey Jude - Remastered 2015', { strip: ['version'] }), 'hey jude');
  assert.equal(normalize('Smells Like Teen Spirit (Live)', { strip: ['version'] }), 'smells like teen spirit');
  assert.equal(normalize('Get Lucky (feat. Pharrell Williams)', { strip: ['featuring'] }), 'get lucky');
  assert.equal(normalize('Get Lucky ft. Pharrell', { strip: ['featuring'] }), 'get lucky');
  assert.equal(normalize('Song [Bonus] (2012)', { strip: ['brackets'] }), 'song');
  assert.equal(normalize('The Beatles', { strip: ['articles'] }), 'beatles');
  assert.equal(normalize("L'Amour toujours", { strip: ['articles'] }), 'amour toujours');
  assert.equal(normalize('Les Rita Mitsouko', { strip: ['articles'] }), 'rita mitsouko');
});

test('strip never empties a text', () => {
  assert.equal(normalize('(Intro)', { strip: ['brackets'] }), 'intro');
  assert.equal(normalize('The', { strip: ['articles'] }), 'the');
});

test('non-string input never throws', () => {
  assert.equal(normalize(undefined), '');
  assert.equal(normalize(null), '');
  assert.equal(normalize(42), '42');
});

test('numbers: words and roman numerals become digits', () => {
  assert.equal(normalize('Two Become One'), '2 become 1');
  assert.equal(normalize('twenty-one pilots'), '21 pilots');
  assert.equal(normalize('quatre-vingt-dix-neuf'), '99');
  assert.equal(normalize('soixante et onze'), '71');
  assert.equal(normalize('dix-sept'), '17');
  assert.equal(normalize('Louis XIV'), 'louis 14');
  assert.equal(normalize('The Seventh Seal'), 'the 7th seal');
  assert.equal(normalize('deuxième 3ème premier'), '2e 3e 1er');
  // Single letters and words that only look like numerals stay.
  assert.equal(normalize('I Will Survive'), 'i will survive');
  assert.equal(normalize('Malcolm X mix'), 'malcolm x mix');
  assert.equal(normalize('Two', { numbers: false }), 'two');
});
