import {
  bagDistance,
  bagMissingLetters,
  damerau,
  jaroWinkler,
  levenshtein,
  partialDistance,
  prefixDistance,
  searchDistance,
} from './distance.js';
import { compileNormalizer, type Normalizer } from './normalize.js';
import type { Algorithm, Comparison, MatchOptions, Preset } from './types.js';

const PRESETS: Readonly<Record<Preset, MatchOptions>> = {
  music: {
    strip: ['featuring', 'version', 'brackets', 'articles'],
    replace: { '&': 'and', '+': 'and', n: 'and' },
  },
  search: { partial: true, threshold: 70 },
  strict: { ignoreWordOrder: false, ignoreSpaces: false, threshold: 90 },
};

const ALGORITHMS: readonly Algorithm[] = [
  'smart',
  'levenshtein',
  'damerau',
  'jaroWinkler',
  'tokenSort',
  'tokenSet',
];

/** Options with every default filled in. */
export interface ResolvedOptions extends Required<Omit<MatchOptions, 'preset'>> {
  preset: Preset | undefined;
}

/** Options compiled once, reused for every comparison. */
export interface Engine {
  readonly options: ResolvedOptions;
  readonly normalize: Normalizer;
}

/** A normalized text and the variants `smart` needs, computed once. */
export interface Prepared {
  readonly text: string;
  readonly sorted: string;
  readonly compact: string;
  readonly words: readonly string[];
}

export function resolveOptions(options: MatchOptions = {}): ResolvedOptions {
  const preset = options.preset;
  if (preset !== undefined && !(preset in PRESETS)) {
    throw new TypeError(
      `[guess-rater] Unknown preset "${String(preset)}". Use one of: ${Object.keys(PRESETS).join(', ')}.`,
    );
  }
  const base = preset ? PRESETS[preset] : {};
  const merged: MatchOptions = {
    ...base,
    ...stripUndefined(options),
    replace: { ...base.replace, ...options.replace },
  };

  const algorithm = merged.algorithm ?? 'smart';
  if (!ALGORITHMS.includes(algorithm)) {
    throw new TypeError(
      `[guess-rater] Unknown algorithm "${String(algorithm)}". Use one of: ${ALGORITHMS.join(', ')}.`,
    );
  }
  const threshold = merged.threshold ?? 80;
  if (typeof threshold !== 'number' || Number.isNaN(threshold)) {
    throw new TypeError('[guess-rater] "threshold" must be a number between 0 and 100.');
  }

  return Object.freeze({
    preset,
    threshold,
    algorithm,
    ignoreWordOrder: merged.ignoreWordOrder ?? true,
    ignoreSpaces: merged.ignoreSpaces ?? true,
    partial: merged.partial ?? false,
    caseSensitive: merged.caseSensitive ?? false,
    accentSensitive: merged.accentSensitive ?? false,
    punctuation: merged.punctuation ?? 'space',
    strip: Object.freeze([...(merged.strip ?? [])]),
    ignoreWords: Object.freeze([...(merged.ignoreWords ?? [])]),
    replace: Object.freeze({ ...merged.replace }),
  });
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(value) as (keyof T)[]) {
    if (value[key] !== undefined) out[key] = value[key];
  }
  return out;
}

const engineCache = new WeakMap<object, Engine>();
let defaultEngine: Engine | undefined;

export function compileEngine(options: MatchOptions = {}): Engine {
  const resolved = resolveOptions(options);
  return { options: resolved, normalize: compileNormalizer(resolved) };
}

/**
 * Compiles options into an engine. Passing the same options object again
 * reuses the compiled engine, so `const opts = {...}` costs nothing per call.
 */
export function getEngine(options?: MatchOptions): Engine {
  if (!options) return (defaultEngine ??= compileEngine());
  let engine = engineCache.get(options);
  if (!engine) {
    engine = compileEngine(options);
    engineCache.set(options, engine);
  }
  return engine;
}

export function prepare(text: string): Prepared {
  const words = text === '' ? [] : text.split(' ');
  const multi = words.length > 1;
  return {
    text,
    words,
    sorted: multi ? [...words].sort().join(' ') : text,
    compact: multi ? words.join('') : text,
  };
}

function ratio(distance: number, a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  return max === 0 ? 100 : (1 - distance / max) * 100;
}

function round(score: number): number {
  return Math.round(score * 100) / 100;
}

function tokenSet(a: Prepared, b: Prepared): number {
  const left = new Set(a.words);
  const right = new Set(b.words);
  const common = [...left].filter((w) => right.has(w)).sort();
  const onlyLeft = [...left].filter((w) => !right.has(w)).sort();
  const onlyRight = [...right].filter((w) => !left.has(w)).sort();
  const base = common.join(' ');
  const withLeft = [base, onlyLeft.join(' ')].filter(Boolean).join(' ');
  const withRight = [base, onlyRight.join(' ')].filter(Boolean).join(' ');
  const pairs: [string, string][] = [
    [withLeft, withRight],
    ...(base ? ([[base, withLeft], [base, withRight]] as [string, string][]) : []),
  ];
  return Math.max(...pairs.map(([x, y]) => ratio(damerau(x, y), x, y)));
}

/**
 * Score of the shorter text matching part of the longer one, or -1 when it
 * provably cannot exceed `floor` (checked first with cheap bit-parallel bounds).
 */
function partialScore(short: Prepared, long: Prepared, floor: number): number {
  const s = short.text;
  const l = long.text;
  // A part never scores as high as the whole: weigh by how much is covered,
  // with a bonus when it is the start of the text (what autocomplete expects).
  const coverage = 100 * (0.85 + (0.15 * s.length) / l.length);
  const startCoverage = 100 * (0.9 + (0.1 * s.length) / l.length);
  const multiWord = short.words.length > 1;

  const wholeBound = 1 - searchDistance(s, l) / s.length;
  let wordsBound = -1;
  if (multiWord) {
    let distance = 0;
    let letters = 0;
    for (const word of short.words) {
      distance += searchDistance(word, l);
      letters += word.length;
    }
    wordsBound = 1 - distance / letters;
  }
  if (Math.max(wholeBound * startCoverage, wordsBound * coverage) <= floor) return -1;

  let best = wholeBound > 0 ? 1 - partialDistance(s, l) / s.length : 0;
  const fromStart = wholeBound > 0 ? (1 - prefixDistance(s, l) / s.length) * startCoverage : 0;

  // Several words: each one may match the start of any word, in any order.
  if (multiWord && best < 1 && wordsBound > best) {
    let distance = 0;
    let letters = 0;
    for (const word of short.words) {
      let wordBest = word.length;
      for (const target of long.words) {
        if (wordBest === 0) break;
        wordBest = Math.min(wordBest, prefixDistance(word, target));
      }
      distance += wordBest;
      letters += word.length;
    }
    best = Math.max(best, 1 - distance / letters);
  }

  return Math.max(0, best * coverage, fromStart);
}

type Scores = Comparison['scores'];

/** Scores two prepared texts. Fills `scores` with each strategy's result. */
export function scorePrepared(
  a: Prepared,
  b: Prepared,
  engine: Engine,
  scores?: Scores,
  floor = 0,
  queryFirst = false,
): number {
  const { algorithm } = engine.options;
  if (a.text === b.text) {
    if (scores) scores[algorithm === 'smart' ? 'characters' : algorithm] = 100;
    return 100;
  }
  if (a.text === '' || b.text === '') {
    if (scores) scores[algorithm === 'smart' ? 'characters' : algorithm] = 0;
    return 0;
  }

  switch (algorithm) {
    case 'levenshtein':
      return record(scores, algorithm, ratio(levenshtein(a.text, b.text), a.text, b.text));
    case 'damerau':
      return record(scores, algorithm, ratio(damerau(a.text, b.text), a.text, b.text));
    case 'jaroWinkler':
      return record(scores, algorithm, jaroWinkler(a.text, b.text) * 100);
    case 'tokenSort':
      return record(scores, algorithm, ratio(damerau(a.sorted, b.sorted), a.sorted, b.sorted));
    case 'tokenSet':
      return record(scores, algorithm, tokenSet(a, b));
    default:
      return smart(a, b, engine.options, scores, floor, queryFirst);
  }
}

function record(scores: Scores | undefined, key: keyof Scores, value: number): number {
  const rounded = round(value);
  if (scores) scores[key] = rounded;
  return rounded;
}

function smart(
  a: Prepared,
  b: Prepared,
  options: ResolvedOptions,
  scores: Scores | undefined,
  floor: number,
  queryFirst: boolean,
): number {
  // In a search, only the query may be the partial side: "i don" finds
  // "I Don't Care", but "I Do" is not a match for "i don".
  const partial = options.partial && (queryFirst ? a.text.length < b.text.length : a.text.length !== b.text.length);
  // In lists, most candidates are far off: rule them out with cheap bounds.
  if (floor > 0 && !scores && !canReach(a, b, options, partial, floor - 0.01)) return 0;

  let best = record(scores, 'characters', ratio(damerau(a.text, b.text), a.text, b.text));
  const multiWord = a.words.length > 1 || b.words.length > 1;
  // A strategy is only worth running if its length bound can beat both.
  const worth = (x: number, y: number): boolean =>
    best < 100 && lengthBound(x, y) > Math.max(best, floor - 0.01);

  const reordered = a.sorted !== a.text || b.sorted !== b.text;
  if (options.ignoreWordOrder && reordered && worth(a.sorted.length, b.sorted.length)) {
    const value = record(scores, 'wordOrder', ratio(damerau(a.sorted, b.sorted), a.sorted, b.sorted));
    if (value > best) best = value;
  }
  if (options.ignoreSpaces && multiWord && worth(a.compact.length, b.compact.length)) {
    const value = record(scores, 'spaces', ratio(damerau(a.compact, b.compact), a.compact, b.compact));
    if (value > best) best = value;
  }
  if (best < 100 && partial) {
    const [short, long] = a.text.length < b.text.length ? [a, b] : [b, a];
    const value = partialScore(short, long, Math.max(best, floor - 0.01));
    if (value >= 0) {
      record(scores, 'partial', value);
      if (round(value) > best) best = round(value);
    }
  }
  return best;
}

/**
 * Lower bounds of `searchDistance` computed once on a text that contains all
 * the candidate texts (an item's joined keys). -1 when unknown.
 */
const hint = { whole: -1, words: -1 };

/** Sets {@link hint} for the next comparisons; call `clearSearchHint()` after. */
export function setSearchHint(query: Prepared, container: Prepared): void {
  hint.whole = searchDistance(query.text, container.text);
  hint.words = -1;
  if (query.words.length > 1) {
    let distance = 0;
    for (const word of query.words) distance += searchDistance(word, container.text);
    hint.words = distance;
  }
}

export function clearSearchHint(): void {
  hint.whole = -1;
  hint.words = -1;
}

/**
 * Whether the `smart` score could reach `floor`, judging from lengths,
 * character counts and one bit-parallel scan, cheapest checks first.
 */
function canReach(a: Prepared, b: Prepared, options: ResolvedOptions, partial: boolean, floor: number): boolean {
  const swap = a.text.length > b.text.length;
  const short = swap ? b : a;
  const long = swap ? a : b;
  const s = short.text.length;
  const l = long.text.length;

  const byLength = lengthBound(s, l);
  const byCompact = options.ignoreSpaces ? lengthBound(a.compact.length, b.compact.length) : 0;
  if (Math.max(byLength, byCompact) >= floor) {
    const missing = bagDistance(a.text, b.text);
    if ((1 - Math.max(missing, l - s) / l) * 100 >= floor) return true;
    if (options.ignoreSpaces) {
      const cmax = Math.max(a.compact.length, b.compact.length, 1);
      const cdiff = Math.abs(a.compact.length - b.compact.length);
      if ((1 - Math.max(bagMissingLetters(), cdiff) / cmax) * 100 >= floor) return true;
    }
  }
  if (!partial) return false;

  const coverage = 100 * (0.85 + (0.15 * s) / l);
  const startCoverage = 100 * (0.9 + (0.1 * s) / l);
  if (startCoverage < floor) return false;
  const known = short === a ? hint : null;
  if (
    (!known || known.whole < 0 || (1 - known.whole / s) * startCoverage >= floor) &&
    (1 - searchDistance(short.text, long.text) / s) * startCoverage >= floor
  ) {
    return true;
  }
  if (short.words.length > 1) {
    const letters = s - short.words.length + 1;
    if (known && known.words >= 0 && (1 - known.words / letters) * coverage < floor) return false;
    let distance = 0;
    for (const word of short.words) distance += searchDistance(word, long.text);
    if ((1 - distance / (s - short.words.length + 1)) * coverage >= floor) return true;
  }
  return false;
}

function lengthBound(x: number, y: number): number {
  const max = Math.max(x, y);
  return max === 0 ? 100 : (1 - Math.abs(x - y) / max) * 100;
}

/**
 * Cheap upper bound of the score, from lengths alone. Lets list functions skip
 * candidates that cannot reach the threshold without computing a distance.
 */
export function maxPossibleScore(a: Prepared, b: Prepared, options: ResolvedOptions): number {
  const { algorithm } = options;
  if (algorithm === 'jaroWinkler' || algorithm === 'tokenSet') return 100;
  if (algorithm === 'smart' && options.partial) return 100;
  let best = lengthBound(a.text.length, b.text.length);
  if (algorithm === 'smart' && options.ignoreSpaces) {
    best = Math.max(best, lengthBound(a.compact.length, b.compact.length));
  }
  return best;
}

export { round as roundScore };
