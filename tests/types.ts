// Type-level tests, checked by `npm run typecheck`. Never executed.
import {
  check,
  closest,
  createIndex,
  createMatcher,
  dedupe,
  search,
  similarity,
  type CheckResult,
  type Match,
} from '../src/index.js';

interface Song {
  id: number;
  title: string;
  artist: string;
  aliases?: string[];
  year: number;
}
declare const songs: Song[];

// Strings need no options.
const s1: Match<string>[] = search('abc', ['abc']);
const s2: Match<string> | undefined = closest('abc', ['abc'], { limit: 1 });

// Objects require `keys`, and only text properties are accepted.
const s3: Match<Song>[] = search('queen', songs, { keys: ['title', 'artist', 'aliases'] });
search('queen', songs, { keys: 'title' });
search('queen', songs, { keys: (song) => [song.title, song.artist] });
// @ts-expect-error keys is required for objects
search('queen', songs);
// @ts-expect-error `year` is a number, not text
search('queen', songs, { keys: ['year'] });
// @ts-expect-error unknown property
search('queen', songs, { keys: ['album'] });

// Literal unions autocomplete and are checked.
similarity('a', 'b', { preset: 'music', algorithm: 'damerau', strip: ['featuring', 'version'] });
// @ts-expect-error unknown preset
similarity('a', 'b', { preset: 'musique' });
// @ts-expect-error unknown strip rule
similarity('a', 'b', { strip: ['feat'] });

const verdict: 'correct' | 'close' | 'wrong' = check('a', ['a', 'b']).verdict;
const result: CheckResult = createMatcher({ preset: 'music' }).check('a', 'b', { closeThreshold: 50 });

const matcher = createMatcher({ preset: 'search' });
const m1: Match<Song> | undefined = matcher.closest('x', songs, { keys: 'title' });
// @ts-expect-error keys is required for objects
matcher.search('x', songs);
const deduped: Song[] = dedupe(songs, { keys: 'title' });

const index = createIndex(songs, { keys: ['title', 'artist'], preset: 'search' });
const first: Song | undefined = index.closest('bohemian')?.item;

export { s1, s2, s3, verdict, result, m1, deduped, first };

// Weighted keys
search('queen', songs, { keys: ['title', { name: 'artist', weight: 0.8 }] });
// @ts-expect-error weighted key must name a text property
search('queen', songs, { keys: [{ name: 'year', weight: 1 }] });
