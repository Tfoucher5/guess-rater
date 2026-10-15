// Micro-benchmarks. Run with `npm run bench`.
// Set GUESS_RATER_COMPARE=/path/to/other/index.js to compare with another build.
import { performance } from 'node:perf_hooks';
import * as current from '../dist/esm/index.js';

const words = ['stairway', 'heaven', 'bohemian', 'rhapsody', 'queen', 'beatles', 'jude', 'zeppelin',
  'love', 'night', 'dance', 'moon', 'river', 'fire', 'dream', 'road', 'heart', 'light', 'blue', 'girl'];
let seed = 42;
const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = () => words[Math.floor(random() * words.length)];
const titles = Array.from({ length: 10_000 }, () =>
  Array.from({ length: 1 + Math.floor(random() * 4) }, pick).join(' '));
const typo = (s) => { const i = Math.floor(random() * s.length); return s.slice(0, i) + s.slice(i + 1); };
const pairs = titles.slice(0, 2000).map((t) => [t, typo(t)]);

function bench(name, fn, iterations = 5) {
  fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i += 1) fn();
  const ms = (performance.now() - start) / iterations;
  console.log(`${name.padEnd(48)} ${ms.toFixed(2).padStart(9)} ms`);
}

console.log('guess-rater (this build)');
bench('similarity x2000 pairs', () => { for (const [a, b] of pairs) current.similarity(a, b); });
const quiz = current.createMatcher({ preset: 'music' });
bench('matcher.check x2000', () => { for (const [a, b] of pairs) quiz.check(b, a); });
bench('search 1 query in 10k titles', () => current.search('bohemian rapsody', titles));
bench('search 1 query in 10k (preset search)', () => current.search('bohem', titles, { preset: 'search', limit: 10 }));
const index = current.createIndex(titles, { preset: 'search' });
bench('index.search x20 in 10k (preset search)', () => { for (let i = 0; i < 20; i += 1) index.search('bohem', { limit: 10 }); });
bench('dedupe 2000 titles', () => current.dedupe(titles.slice(0, 2000)));

if (process.env.GUESS_RATER_COMPARE) {
  const other = await import(process.env.GUESS_RATER_COMPARE);
  console.log(`\ncompared build: ${process.env.GUESS_RATER_COMPARE}`);
  bench('rate x2000 pairs (levenshtein)', () => { for (const [a, b] of pairs) other.rate(a, b); });
  bench('rate x2000 pairs (hybrid)', () => { for (const [a, b] of pairs) other.rate(a, b, { algorithm: 'hybrid' }); });
  bench('filterMatches 1 query in 10k titles', () => other.filterMatches('bohemian rapsody', titles));
}
