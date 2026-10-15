import test from 'node:test';
import assert from 'node:assert/strict';
import {
  similarity, isMatch, compare, check, closest, search, dedupe, group, createMatcher, createIndex,
} from '../dist/esm/index.js';

const songs = [
  { title: 'Bohemian Rhapsody', artist: 'Queen' },
  { title: 'Stairway to Heaven', artist: 'Led Zeppelin' },
  { title: "Don't Stop Me Now", artist: 'Queen' },
  { title: 'Beat It', artist: 'Michael Jackson' },
  { title: 'Hey Jude', artist: 'The Beatles', aliases: ['Hey Jules'] },
];

test('similarity: identical after normalization', () => {
  assert.equal(similarity('Molière', 'moliere'), 100);
  assert.equal(similarity('Saint-Nazaire', 'saint nazaire'), 100);
});

test('similarity: typos, word order, spaces', () => {
  assert.ok(similarity('stairway to heven', 'Stairway to Heaven') > 90);
  assert.equal(similarity('Smith John', 'John Smith'), 100);
  assert.equal(similarity('stairwaytoheaven', 'stairway to heaven'), 100);
});

test('similarity: unrelated texts score low', () => {
  assert.ok(similarity('Paris', 'Tokyo') < 30);
  assert.equal(similarity('abc', ''), 0);
  assert.equal(similarity('', ''), 100);
});

test('similarity is symmetric', () => {
  const pairs = [['stair', 'stairway to heaven'], ['john smith', 'smith jon'], ['abc', 'abd e']];
  for (const [a, b] of pairs) {
    assert.equal(similarity(a, b), similarity(b, a));
    assert.equal(similarity(a, b, { preset: 'search' }), similarity(b, a, { preset: 'search' }));
  }
});

test('strict preset cares about order and spaces', () => {
  assert.ok(similarity('Smith John', 'John Smith', { preset: 'strict' }) < 50);
  assert.ok(similarity('stairwaytoheaven', 'stairway to heaven', { preset: 'strict' }) < 100);
});

test('algorithms can be chosen explicitly', () => {
  assert.equal(similarity('teh', 'the', { algorithm: 'levenshtein' }), 33.33);
  assert.equal(similarity('teh', 'the', { algorithm: 'damerau' }), 66.67);
  assert.equal(similarity('b a', 'a b', { algorithm: 'tokenSort' }), 100);
  assert.equal(similarity('hey jude', 'hey jude beatles', { algorithm: 'tokenSet' }), 100);
  assert.ok(similarity('martha', 'marhta', { algorithm: 'jaroWinkler' }) > 95);
});

test('invalid options throw a clear error', () => {
  assert.throws(() => similarity('a', 'b', { algorithm: 'nope' }), /Unknown algorithm "nope"/);
  assert.throws(() => similarity('a', 'b', { preset: 'nope' }), /Unknown preset "nope"/);
});

test('isMatch: threshold shorthand and options', () => {
  assert.equal(isMatch('Saint-Étienne', 'saint etienne'), true);
  assert.equal(isMatch('color', 'colour', 90), false);
  assert.equal(isMatch('color', 'colour', { threshold: 80 }), true);
});

test('compare explains the score', () => {
  const result = compare('The Beatles', 'beatles', { preset: 'music' });
  assert.equal(result.score, 100);
  assert.equal(result.match, true);
  assert.equal(result.a, 'beatles');
  const details = compare('Smith Jon', 'John Smith');
  assert.ok(details.scores.characters < details.scores.wordOrder);
});

test('check: correct, close and wrong', () => {
  assert.equal(check('bohemian rapsody', 'Bohemian Rhapsody').verdict, 'correct');
  assert.equal(check('bohemian rapsodi', 'Bohemian Rhapsody', { threshold: 95 }).verdict, 'close');
  assert.equal(check('bohemian', 'Bohemian Rhapsody').verdict, 'close');
  assert.equal(check('we will rock you', 'Bohemian Rhapsody').verdict, 'wrong');
  assert.equal(check('the', 'The Beatles').verdict, 'wrong');
});

test('check: several accepted answers, reports the closest', () => {
  const result = check('zeppelin', ['Led Zeppelin', 'Zeppelin'], { preset: 'music' });
  assert.equal(result.correct, true);
  assert.equal(result.answer, 'Zeppelin');
});

test('check: music preset ignores versions, featurings and articles', () => {
  assert.equal(check('get lucky', 'Get Lucky (feat. Pharrell Williams) - Radio Edit', { preset: 'music' }).verdict, 'correct');
  assert.equal(check('beatles', 'The Beatles', { preset: 'music' }).verdict, 'correct');
  assert.equal(check('simon and garfunkel', 'Simon & Garfunkel', { preset: 'music' }).verdict, 'correct');
});

test('check: an empty guess is always wrong', () => {
  assert.equal(check('', '').verdict, 'wrong');
  assert.equal(check('   !!! ', 'Hey Jude').verdict, 'wrong');
});

test('closest: did you mean', () => {
  assert.equal(closest('pari', ['Paris', 'Lyon', 'Marseille'])?.item, 'Paris');
  assert.equal(closest('xyz', ['Paris', 'Lyon']), undefined);
});

test('search: strings, best first, stable for ties', () => {
  const results = search('iphone', ['iPhone 15', 'Galaxy S24', 'iphone 14'], { preset: 'search' });
  assert.deepEqual(results.map((r) => r.item), ['iPhone 15', 'iphone 14']);
  assert.deepEqual(results.map((r) => r.index), [0, 2]);
});

test('search: objects with keys, getter or arrays', () => {
  const byKeys = search('queen', songs, { keys: ['title', 'artist'], preset: 'search' });
  assert.deepEqual(byKeys.map((r) => r.item.title), ['Bohemian Rhapsody', "Don't Stop Me Now"]);
  assert.equal(byKeys[0].text, 'Queen');

  const byGetter = search('zep stair', songs, { keys: (s) => `${s.title} ${s.artist}`, preset: 'search' });
  assert.equal(byGetter[0].item.title, 'Stairway to Heaven');

  const byAlias = search('hey jules', songs, { keys: ['title', 'aliases'] });
  assert.equal(byAlias[0].item.title, 'Hey Jude');
  assert.equal(byAlias[0].score, 100);
});

test('search: prefixes rank whole matches first', () => {
  const results = search('beat', ['The Beatles', 'Beat It', 'Beat'], { preset: 'search' });
  assert.equal(results[0].item, 'Beat');
  assert.equal(results[1].item, 'Beat It');
});

test('search: limit', () => {
  assert.equal(search('a', ['a', 'ab', 'abc'], { preset: 'search', limit: 2 }).length, 2);
  assert.equal(search('a', ['a', 'ab', 'abc'], { preset: 'search', limit: 0 }).length, 0);
});

test('search: objects without keys throw a helpful error', () => {
  assert.throws(() => search('x', [{ a: 'x' }]), /pass `keys`/);
});

test('dedupe and group', () => {
  assert.deepEqual(dedupe(['Hey Jude', 'hey jude - Remastered 2015', 'Let It Be'], { preset: 'music' }), ['Hey Jude', 'Let It Be']);
  assert.deepEqual(group(['Jean Dupont', 'Dupont Jean', 'Marie Curie']), [['Jean Dupont', 'Dupont Jean'], ['Marie Curie']]);
  assert.deepEqual(dedupe(songs, { keys: 'artist' }).map((s) => s.artist), ['Queen', 'Led Zeppelin', 'Michael Jackson', 'The Beatles']);
});

test('createMatcher: reusable configuration', () => {
  const quiz = createMatcher({ preset: 'music', threshold: 85 });
  assert.equal(quiz.options.threshold, 85);
  assert.deepEqual(quiz.options.strip, ['featuring', 'version', 'brackets', 'articles']);
  assert.equal(quiz.check('bohemian rapsody', 'Bohemian Rhapsody - Remastered 2011').verdict, 'correct');
  assert.equal(quiz.normalize('The Beatles - Live'), 'beatles');
  assert.equal(quiz.isMatch('beatles', 'The Beatles'), true);
  assert.equal(quiz.similarity('beatles', 'The Beatles'), 100);
  assert.equal(quiz.closest('queen', songs, { keys: 'artist' })?.item.title, 'Bohemian Rhapsody');
  assert.equal(quiz.search('queen', songs, { keys: 'artist' }).length, 2);
  assert.deepEqual(quiz.dedupe(['A', 'a', 'B']), ['A', 'B']);
  assert.throws(() => { quiz.options.threshold = 1; });
});

test('createMatcher: preset values can be overridden', () => {
  const m = createMatcher({ preset: 'music', strip: ['articles'], replace: { n: 'and' } });
  assert.equal(m.normalize('The Rock n Roll (Live)'), 'rock and roll live');
});

test('createIndex: prepared once, searched many times', () => {
  const index = createIndex(songs, { keys: ['title', 'artist'], preset: 'search' });
  assert.equal(index.size, 5);
  assert.equal(index.closest('bohemian')?.item.artist, 'Queen');
  assert.equal(index.search('queen', { limit: 1 }).length, 1);
  assert.equal(createMatcher({ preset: 'search' }).index(['Paris', 'Lyon']).closest('lyo')?.item, 'Lyon');
});

test('search preset: typos in prefixes, words spread across keys', () => {
  const index = createIndex(songs, { keys: ['title', 'artist'], preset: 'search' });
  assert.equal(index.search('bohemain')[0]?.item.title, 'Bohemian Rhapsody');
  assert.equal(index.search('zep stair')[0]?.item.title, 'Stairway to Heaven');
  assert.equal(index.search('queen bohem')[0]?.item.title, 'Bohemian Rhapsody');
  assert.equal(index.search('queen')[0]?.text, 'Queen');
});

test('non-string input never throws', () => {
  assert.equal(similarity(undefined, null), 100);
  assert.equal(similarity(42, '42'), 100);
  assert.equal(check(undefined, 'x').verdict, 'wrong');
});
