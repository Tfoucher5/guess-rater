import test from 'node:test';
import assert from 'node:assert/strict';
import { levenshtein, damerau, jaroWinkler } from '../dist/esm/index.js';

function naive(a, b, transpositions) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j += 1) d[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (transpositions && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

function randomString(maxLength, alphabet) {
  const length = Math.floor(Math.random() * maxLength);
  let out = '';
  for (let i = 0; i < length; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

test('levenshtein: known values', () => {
  assert.equal(levenshtein('kitten', 'sitting'), 3);
  assert.equal(levenshtein('', 'abc'), 3);
  assert.equal(levenshtein('abc', ''), 3);
  assert.equal(levenshtein('same', 'same'), 0);
  assert.equal(levenshtein('teh', 'the'), 2);
});

test('damerau: a swap costs 1', () => {
  assert.equal(damerau('teh', 'the'), 1);
  assert.equal(damerau('ca', 'abc'), 3); // OSA, not unrestricted Damerau
  assert.equal(damerau('martha', 'marhta'), 1);
});

test('bit-parallel and DP paths agree with a naive implementation (fuzz)', () => {
  for (const [maxLength, alphabet] of [[12, 'ab'], [40, 'abc'], [80, 'abcdefgh '], [35, 'aé€😀']]) {
    for (let i = 0; i < 1500; i += 1) {
      const a = randomString(maxLength, alphabet);
      const b = randomString(maxLength, alphabet);
      assert.equal(levenshtein(a, b), naive(a, b, false), `levenshtein(${a}, ${b})`);
      assert.equal(damerau(a, b), naive(a, b, true), `damerau(${a}, ${b})`);
    }
  }
});

test('distances are symmetric', () => {
  for (let i = 0; i < 500; i += 1) {
    const a = randomString(50, 'abcd');
    const b = randomString(50, 'abcd');
    assert.equal(levenshtein(a, b), levenshtein(b, a));
    assert.equal(damerau(a, b), damerau(b, a));
  }
});

test('jaroWinkler: known values', () => {
  assert.equal(Math.round(jaroWinkler('martha', 'marhta') * 1000) / 1000, 0.961);
  assert.equal(jaroWinkler('', ''), 1);
  assert.equal(jaroWinkler('abc', ''), 0);
  assert.equal(jaroWinkler('abc', 'xyz'), 0);
});

test('searchDistance (bit-parallel) agrees with a naive DP and bounds partial matches (fuzz)', async () => {
  const { searchDistance, partialDistance, prefixDistance } = await import('../dist/esm/distance.js');
  const naiveSearch = (q, t) => {
    const d = Array.from({ length: q.length + 1 }, (_, i) => Array(t.length + 1).fill(i));
    for (let j = 0; j <= t.length; j += 1) d[0][j] = 0;
    let best = q.length;
    for (let j = 1; j <= t.length; j += 1) {
      for (let i = 1; i <= q.length; i += 1) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (q[i - 1] === t[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && q[i - 1] === t[j - 2] && q[i - 2] === t[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
      best = Math.min(best, d[q.length][j]);
    }
    return q.length === 0 ? 0 : best;
  };
  for (const [maxLength, alphabet] of [[10, 'ab '], [40, 'abcd '], [60, 'abcdefgh ']]) {
    for (let i = 0; i < 1500; i += 1) {
      const q = randomString(maxLength, alphabet);
      const t = randomString(maxLength * 2, alphabet);
      const s = searchDistance(q, t);
      assert.equal(s, naiveSearch(q, t), `searchDistance(${q}, ${t})`);
      assert.ok(s <= partialDistance(q, t), `bound partial(${q}, ${t})`);
      assert.ok(s <= prefixDistance(q, t), `bound prefix(${q}, ${t})`);
    }
  }
});

test('bagDistance is a lower bound of damerau, whatever the word order (fuzz)', async () => {
  const { bagDistance } = await import('../dist/esm/distance.js');
  for (let i = 0; i < 2000; i += 1) {
    const a = randomString(30, 'abc d');
    const b = randomString(30, 'abc d');
    const bd = bagDistance(a, b);
    assert.ok(bd <= damerau(a, b), `${a} / ${b}`);
    const sorted = (s) => s.split(' ').sort().join(' ');
    assert.ok(bd <= damerau(sorted(a), sorted(b)) + 0, `${a} / ${b} sorted`);
  }
  assert.equal(bagDistance('aab', 'abb'), 1);
  assert.equal(bagDistance('abc', 'xyz'), 3);
});
