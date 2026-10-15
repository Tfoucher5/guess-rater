import test from 'node:test';
import assert from 'node:assert/strict';
import {
  similarity, isMatch, compare, check, checkAll, closest, search, dedupe, group, join, find, createMatcher, createIndex,
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

test('weighted keys: a lighter property scores less', async () => {
  const items = [
    { title: 'Queen of Hearts', artist: 'Fleet Foxes' },
    { title: 'Bohemian Rhapsody', artist: 'Queen' },
  ];
  const results = search('queen', items, { keys: ['title', { name: 'artist', weight: 0.9 }] });
  assert.deepEqual(results.map((r) => [r.item.title, r.score]), [['Bohemian Rhapsody', 90]]);
  assert.equal(search('queen', items, { keys: [{ name: 'artist', weight: 0 }] }).length, 0);
});

test('find: fuzzy occurrences with positions in the original text', async () => {
  const { find } = await import('../dist/esm/index.js');
  const message = "je pense que c'est bohemian rapsody de queen";
  const [hit] = find(message, 'Bohemian Rhapsody');
  assert.equal(hit.text, 'bohemian rapsody');
  assert.equal(message.slice(hit.start, hit.end), hit.text);
  assert.equal(find('I love Stairway to Heaven and stairway to heven', 'stairway to heaven').length, 2);
  assert.deepEqual(find('nothing here', 'Bohemian Rhapsody'), []);
  assert.deepEqual(find('', 'x'), []);
  assert.deepEqual(find('x', ''), []);
});

test('highlight: segments rebuild the original text', async () => {
  const { highlight } = await import('../dist/esm/index.js');
  assert.deepEqual(highlight('Bohemian Rhapsody', 'bohem'), [
    { text: 'Bohem', match: true },
    { text: 'ian Rhapsody', match: false },
  ]);
  const text = 'Stairway to Heaven - Led Zeppelin';
  const segments = highlight(text, 'zep stair');
  assert.equal(segments.map((s) => s.text).join(''), text);
  assert.deepEqual(segments.filter((s) => s.match).map((s) => s.text), ['Stair', 'Zep']);
  assert.deepEqual(highlight('Crème brûlée', 'creme')[0], { text: 'Crème', match: true });
  assert.deepEqual(highlight('abc', ''), [{ text: 'abc', match: false }]);
  assert.deepEqual(highlight('Hey Jude', 'hey jude'), [{ text: 'Hey Jude', match: true }]);
});

test('matcher.find and matcher.highlight use the matcher options', () => {
  const m = createMatcher({ preset: 'music' });
  assert.equal(m.find('on écoute The Beatles ce soir', 'beatles')[0]?.text, 'Beatles');
  assert.ok(m.highlight('Hey Jude', 'jude').some((s) => s.match));
});

test('list pruning never drops or changes a result (fuzz)', () => {
  const words = ['stair', 'way', 'heaven', 'bohemian', 'rhapsody', 'queen', 'jude', 'hey', 'love', 'é', 'a'];
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const phrase = () => Array.from({ length: 1 + Math.floor(rnd() * 4) }, () => {
    const w = words[Math.floor(rnd() * words.length)];
    return rnd() < 0.3 ? w.slice(0, Math.max(1, Math.floor(rnd() * w.length))) : w;
  }).join(rnd() < 0.2 ? '' : ' ');
  const items = Array.from({ length: 300 }, phrase);
  for (const options of [{}, { preset: 'search' }, { preset: 'strict' }, { threshold: 50 }, { preset: 'search', threshold: 90 }]) {
    for (let i = 0; i < 40; i += 1) {
      const query = phrase();
      // Threshold 0 disables every shortcut: it is the reference.
      const threshold = options.threshold ?? (options.preset === 'search' ? 70 : options.preset === 'strict' ? 90 : 80);
      const expected = search(query, items, { ...options, threshold: 0 })
        .filter((r) => r.score >= threshold)
        .map(({ item, index, score }) => ({ item, index, score }));
      const actual = search(query, items, options).map(({ item, index, score }) => ({ item, index, score }));
      assert.deepEqual(actual, expected, `${JSON.stringify(options)} ${query}`);
      const top = search(query, items, { ...options, limit: 5 }).map(({ item, index, score }) => ({ item, index, score }));
      assert.deepEqual(top, expected.slice(0, 5), `top 5 ${JSON.stringify(options)} ${query}`);
    }
  }
});

test('checkAll: each part found anywhere in the guess', () => {
  const song = { title: 'Bohemian Rhapsody - Remastered 2011', artist: 'Queen' };
  const both = checkAll('bohemian rapsody de queen', song, { preset: 'music' });
  assert.equal(both.correct, true);
  assert.deepEqual(both.found, ['title', 'artist']);
  assert.deepEqual(both.missing, []);

  const artistOnly = checkAll('queen', song, { preset: 'music' });
  assert.equal(artistOnly.correct, false);
  assert.deepEqual(artistOnly.found, ['artist']);
  assert.equal(artistOnly.parts.title.verdict, 'wrong');

  assert.equal(checkAll('bohemian', song, { preset: 'music' }).parts.title.verdict, 'close');
  assert.deepEqual(checkAll('the beatles hey jude', { title: 'Hey Jude', artist: 'The Beatles' }, { preset: 'music' }).found, ['title', 'artist']);
  assert.deepEqual(checkAll('beatles', { artist: ['The Beatles', 'Fab Four'] }, { preset: 'music' }).found, ['artist']);

  const empty = checkAll('', song);
  assert.equal(empty.correct, false);
  assert.deepEqual(empty.missing, ['title', 'artist']);
  assert.equal(checkAll('anything', {}).correct, false);
});

test('checkAll: same through a matcher', () => {
  const quiz = createMatcher({ preset: 'music' });
  assert.equal(quiz.checkAll('queen bohemian rhapsody', { title: 'Bohemian Rhapsody', artist: 'Queen' }).correct, true);
});

test('numbers: words, roman numerals and digits compare equal', () => {
  assert.equal(similarity('2 Become 1', 'Two Become One'), 100);
  assert.equal(similarity('Louis 14', 'Louis XIV'), 100);
  assert.equal(check('rocky 2', 'Rocky II').correct, true);
  assert.equal(check('vingt et un', '21').correct, true);
  assert.equal(similarity('2 become 1', 'Two Become One', { numbers: false }) < 80, true);
  // The search preset keeps words, so prefixes work while typing.
  assert.equal(search('sev', ['Seven Nation Army'], { preset: 'search' }).length, 1);
  assert.deepEqual(find('on écoute twenty one pilots ce soir', 'Twenty One Pilots').map((f) => f.text), ['twenty one pilots']);
});

test('join: best match for each left item', () => {
  const rows = join(['Apple Inc.', 'Microsoft Corp', 'Nokia'], ['MICROSOFT CORPORATION', 'Apple', 'Google LLC'], {
    ignoreWords: ['inc', 'corp', 'corporation', 'llc'],
  });
  assert.deepEqual(rows.map((r) => r.match?.item), ['Apple', 'MICROSOFT CORPORATION', undefined]);
  assert.deepEqual(rows.map((r) => r.index), [0, 1, 2]);
});

test('join: objects and unique pairs', () => {
  const orders = [{ customer: 'Jon Smith' }, { customer: 'John Smith' }];
  const customers = [{ name: 'John Smith', id: 1 }, { name: 'Jane Smyth', id: 2 }];
  const loose = join(orders, customers, { left: 'customer', right: 'name', threshold: 60 });
  assert.deepEqual(loose.map((r) => r.match?.item.id), [1, 1]);
  const unique = join(orders, customers, { left: 'customer', right: 'name', threshold: 60, unique: true });
  assert.deepEqual(unique.map((r) => r.match?.item.id), [2, 1]);
  assert.throws(() => join(orders, customers, { right: 'name' }), /keys/);
  assert.equal(createMatcher().join(['paris'], ['Paris', 'Lyon'])[0].match?.item, 'Paris');
});
