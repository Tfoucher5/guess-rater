import {
  compileEngine,
  getEngine,
  maxPossibleScore,
  prepare,
  roundScore,
  scorePrepared,
  setSearchHint,
  clearSearchHint,
  type Engine,
  type Prepared,
  type ResolvedOptions,
} from './engine.js';
import { partialDistance } from './distance.js';
import { findIn, highlightIn, type Found, type Segment } from './text.js';
import type {
  CheckOptions,
  CheckResult,
  Comparison,
  GroupOptions,
  KeysOption,
  ListOptions,
  Match,
  MatchOptions,
} from './types.js';

/**
 * Makes `options` required, with `keys`, when items are not strings, so the
 * editor tells you right away which properties can be searched.
 */
export type ItemsArgs<T, O> = [T] extends [string]
  ? [options?: O]
  : [options: O & { keys: KeysOption<T> }];

/** Per-call options of a matcher's list methods. */
export interface MatcherListOptions<T> {
  /** Maximum number of results. @default Infinity */
  limit?: number;
  /** Override the matcher's threshold for this call. */
  threshold?: number;
  /** Where to read the text of each item. Required when items are objects. */
  keys?: KeysOption<T>;
}

/** Per-call options of {@link Matcher.check}. */
export interface MatcherCheckOptions {
  /** Override the matcher's threshold for this call. */
  threshold?: number;
  /** Minimum score for `close`. @default threshold - 15 */
  closeThreshold?: number;
}

/** A pre-processed list of items, ready to be searched many times. */
export interface Index<T> {
  /** Number of items in the index. */
  readonly size: number;
  /** The indexed items, in their original order. */
  readonly items: readonly T[];
  /**
   * Items matching `query`, best first.
   * @example
   * const songs = createIndex(catalog, { keys: ['title', 'artist'], preset: 'search' })
   * songs.search('bohem', { limit: 5 })
   */
  search(query: string, options?: Omit<MatcherListOptions<T>, 'keys'>): Match<T>[];
  /** The best item for `query`, or `undefined` if none reaches the threshold. */
  closest(query: string, options?: Pick<MatcherListOptions<T>, 'threshold'>): Match<T> | undefined;
}

/**
 * A reusable, pre-compiled configuration. Create one per use case and reuse
 * it: options are parsed and regular expressions compiled only once.
 */
export interface Matcher {
  /** The options in use, with every default filled in. */
  readonly options: Readonly<ResolvedOptions>;
  /** Normalizes a text the way this matcher does before comparing. */
  normalize(text: string): string;
  /** Similarity score between `a` and `b`, from 0 to 100. */
  similarity(a: string, b: string): number;
  /** Whether `a` and `b` are similar enough. */
  isMatch(a: string, b: string, threshold?: number): boolean;
  /** Detailed comparison, to understand and tune a score. */
  compare(a: string, b: string): Comparison;
  /** Grades a guess against one or several accepted answers. */
  check(guess: string, answers: string | readonly string[], options?: MatcherCheckOptions): CheckResult;
  /** The best item for `query`, or `undefined` if none reaches the threshold. */
  closest<T>(query: string, items: readonly T[], ...args: ItemsArgs<T, MatcherListOptions<T>>): Match<T> | undefined;
  /** Items matching `query`, best first. */
  search<T>(query: string, items: readonly T[], ...args: ItemsArgs<T, MatcherListOptions<T>>): Match<T>[];
  /** Removes near-duplicates, keeping the first occurrence of each. */
  dedupe<T>(items: readonly T[], ...args: ItemsArgs<T, Pick<MatcherListOptions<T>, 'threshold' | 'keys'>>): T[];
  /** Groups near-duplicates together. Groups keep the original order. */
  group<T>(items: readonly T[], ...args: ItemsArgs<T, Pick<MatcherListOptions<T>, 'threshold' | 'keys'>>): T[][];
  /** Fuzzy occurrences of `query` inside a longer `text`, with their positions. */
  find(text: string, query: string, options?: { threshold?: number }): Found[];
  /** Splits `text` into pieces, marking the ones that match `query`. */
  highlight(text: string, query: string): Segment[];
  /** Pre-processes a list once, to search it many times. */
  index<T>(items: readonly T[], ...args: ItemsArgs<T, Pick<MatcherListOptions<T>, 'keys'>>): Index<T>;
}

interface Entry<T> {
  item: T;
  index: number;
  texts: readonly string[];
  weights: readonly number[];
  prepared: readonly Prepared[];
  /** Whether the last prepared text joins all the others. */
  joined: boolean;
}

interface ItemTexts {
  texts: string[];
  weights: number[];
}

function toText(value: unknown): string {
  return value == null ? '' : String(value);
}

function pushTexts(out: ItemTexts, value: unknown, weight: number): void {
  if (Array.isArray(value)) for (const v of value) pushTexts(out, v, weight);
  else if (value != null && value !== '') {
    out.texts.push(toText(value));
    out.weights.push(weight);
  }
}

function textGetter<T>(keys: KeysOption<T> | undefined): (item: T) => ItemTexts {
  if (keys === undefined) {
    return (item) => {
      if (item !== null && typeof item === 'object') {
        throw new TypeError(
          '[guess-rater] Items are objects: pass `keys` to say where their text is, e.g. { keys: ["title"] }.',
        );
      }
      return { texts: [toText(item)], weights: [1] };
    };
  }
  if (typeof keys === 'function') {
    return (item) => {
      const out: ItemTexts = { texts: [], weights: [] };
      pushTexts(out, keys(item), 1);
      return out;
    };
  }
  const list = (typeof keys === 'string' ? [keys] : keys) as readonly (string | { name: string; weight?: number })[];
  const fields = list.map((key) =>
    typeof key === 'string' ? { name: key, weight: 1 } : { name: key.name, weight: key.weight ?? 1 },
  );
  return (item) => {
    const out: ItemTexts = { texts: [], weights: [] };
    for (const field of fields) {
      pushTexts(out, (item as Record<string, unknown> | null)?.[field.name], field.weight);
    }
    return out;
  };
}

function buildEntries<T>(items: readonly T[], keys: KeysOption<T> | undefined, engine: Engine): Entry<T>[] {
  if (!Array.isArray(items)) {
    throw new TypeError('[guess-rater] Expected an array of items.');
  }
  const getTexts = textGetter(keys);
  // When matching parts, all texts of an item also count together, so
  // "zep stair" finds { title: 'Stairway to Heaven', artist: 'Led Zeppelin' }.
  const joinTexts = engine.options.partial;
  return items.map((item, index) => {
    const { texts, weights } = getTexts(item);
    if (joinTexts && texts.length > 1) {
      texts.push(texts.join(' '));
      weights.push(Math.max(...weights));
    }
    const joined = joinTexts && texts.length > 2;
    return { item, index, texts, weights, joined, prepared: texts.map((t) => prepare(engine.normalize(t))) };
  });
}

function bestOf<T>(query: Prepared, entry: Entry<T>, engine: Engine, threshold: number): Match<T> | null {
  let best: Match<T> | null = null;
  // One scan of the joined text bounds the scans of every part of it.
  const container = entry.joined ? entry.prepared[entry.prepared.length - 1]! : null;
  if (container && query.text.length < container.text.length) setSearchHint(query, container);
  try {
    for (let i = 0; i < entry.prepared.length; i += 1) {
      const candidate = entry.prepared[i]!;
      const weight = entry.weights[i]!;
      // Skip what cannot reach the threshold, without computing anything.
      if (maxPossibleScore(query, candidate, engine.options) * weight + 0.01 < threshold) continue;
      const floor = weight > 0 ? threshold / weight : Infinity;
      const raw = scorePrepared(query, candidate, engine, undefined, floor, true);
      const score = weight === 1 ? raw : roundScore(raw * weight);
      if (!best || score > best.score) {
        best = { item: entry.item, score, index: entry.index, text: entry.texts[i]! };
      }
    }
  } finally {
    if (container) clearSearchHint();
  }
  return best && best.score >= threshold ? best : null;
}

function rank<T>(
  query: string,
  entries: readonly Entry<T>[],
  engine: Engine,
  threshold: number,
  limit: number,
): Match<T>[] {
  const prepared = prepare(engine.normalize(toText(query)));
  const max = Math.max(0, Math.floor(limit));
  if (max === 0) return [];

  if (!Number.isFinite(limit) || max >= entries.length) {
    const results: Match<T>[] = [];
    for (const entry of entries) {
      const match = bestOf(prepared, entry, engine, threshold);
      if (match) results.push(match);
    }
    return results.sort((x, y) => y.score - x.score || x.index - y.index).slice(0, max || undefined);
  }

  // Top-k: once `max` results are kept, a candidate must beat the worst of
  // them, which lets the cheap bounds skip most of the list.
  const top: Match<T>[] = [];
  let floor = threshold;
  for (const entry of entries) {
    const match = bestOf(prepared, entry, engine, floor);
    if (!match) continue;
    if (top.length === max && match.score <= top[max - 1]!.score) continue;
    let i = top.length;
    while (i > 0 && top[i - 1]!.score < match.score) i -= 1;
    top.splice(i, 0, match);
    if (top.length > max) top.pop();
    if (top.length === max) floor = Math.max(threshold, top[max - 1]!.score + 0.001);
  }
  return top;
}

function grade(
  guess: string,
  answers: string | readonly string[],
  engine: Engine,
  threshold: number,
  closeThreshold: number,
): CheckResult {
  const list = typeof answers === 'string' ? [answers] : Array.from(answers ?? [], toText);
  const prepared = prepare(engine.normalize(toText(guess)));
  let score = 0;
  let answer: string | undefined;

  // An empty guess is never right, even against an empty answer.
  if (prepared.text !== '') {
    for (const candidate of list) {
      const value = scorePrepared(prepared, prepare(engine.normalize(candidate)), engine);
      if (answer === undefined || value > score) {
        score = value;
        answer = candidate;
      }
      if (score === 100) break;
    }
  }

  let verdict: CheckResult['verdict'] =
    score >= threshold ? 'correct' : score >= closeThreshold && score > 0 ? 'close' : 'wrong';

  // A good chunk of the answer ("bohemian" for "Bohemian Rhapsody") is close too.
  if (verdict === 'wrong' && answer !== undefined) {
    const target = prepare(engine.normalize(answer));
    if (prepared.text.length >= 0.4 * target.text.length && prepared.text.length < target.text.length) {
      const part = (1 - partialDistance(prepared.text, target.text) / prepared.text.length) * 100;
      if (part >= threshold) verdict = 'close';
    }
  }
  return {
    verdict,
    correct: verdict === 'correct',
    close: verdict === 'close',
    score,
    answer: answer ?? list[0],
  };
}

function cluster<T>(entries: readonly Entry<T>[], engine: Engine, threshold: number): T[][] {
  const groups: { leader: Entry<T>; members: T[] }[] = [];
  for (const entry of entries) {
    let home: (typeof groups)[number] | undefined;
    outer: for (const group of groups) {
      for (const a of entry.prepared) {
        for (const b of group.leader.prepared) {
          if (maxPossibleScore(a, b, engine.options) + 0.01 < threshold) continue;
          if (scorePrepared(a, b, engine) >= threshold) {
            home = group;
            break outer;
          }
        }
      }
    }
    if (home) home.members.push(entry.item);
    else groups.push({ leader: entry, members: [entry.item] });
  }
  return groups.map((g) => g.members);
}

function compareWith(a: string, b: string, engine: Engine): Comparison {
  const left = prepare(engine.normalize(toText(a)));
  const right = prepare(engine.normalize(toText(b)));
  const scores: Comparison['scores'] = {};
  const score = scorePrepared(left, right, engine, scores);
  return {
    score,
    match: score >= engine.options.threshold,
    threshold: engine.options.threshold,
    algorithm: engine.options.algorithm,
    a: left.text,
    b: right.text,
    scores,
  };
}

function makeIndex<T>(items: readonly T[], keys: KeysOption<T> | undefined, engine: Engine): Index<T> {
  const entries = buildEntries(items, keys, engine);
  const frozen = Object.freeze([...items]);
  return {
    size: frozen.length,
    items: frozen,
    search: (query, options = {}) =>
      rank(query, entries, engine, options.threshold ?? engine.options.threshold, options.limit ?? Infinity),
    closest: (query, options = {}) =>
      rank(query, entries, engine, options.threshold ?? engine.options.threshold, 1)[0],
  };
}

function matcherFrom(engine: Engine): Matcher {
  const { threshold } = engine.options;
  return Object.freeze<Matcher>({
    options: engine.options,
    normalize: (text) => engine.normalize(toText(text)),
    similarity: (a, b) =>
      scorePrepared(prepare(engine.normalize(toText(a))), prepare(engine.normalize(toText(b))), engine),
    isMatch: (a, b, t = threshold) =>
      scorePrepared(prepare(engine.normalize(toText(a))), prepare(engine.normalize(toText(b))), engine) >= t,
    compare: (a, b) => compareWith(a, b, engine),
    check: (guess, answers, options = {}) => {
      const t = options.threshold ?? threshold;
      return grade(guess, answers, engine, t, options.closeThreshold ?? t - 15);
    },
    closest: <T>(query: string, items: readonly T[], options?: MatcherListOptions<T>) =>
      rank(query, buildEntries(items, options?.keys, engine), engine, options?.threshold ?? threshold, 1)[0],
    search: <T>(query: string, items: readonly T[], options?: MatcherListOptions<T>) =>
      rank(
        query,
        buildEntries(items, options?.keys, engine),
        engine,
        options?.threshold ?? threshold,
        options?.limit ?? Infinity,
      ),
    dedupe: <T>(items: readonly T[], options?: MatcherListOptions<T>) =>
      cluster(buildEntries(items, options?.keys, engine), engine, options?.threshold ?? threshold).map(
        (group) => group[0]!,
      ),
    group: <T>(items: readonly T[], options?: MatcherListOptions<T>) =>
      cluster(buildEntries(items, options?.keys, engine), engine, options?.threshold ?? threshold),
    find: (text, query, options = {}) => findIn(toText(text), toText(query), engine, options.threshold ?? threshold),
    highlight: (text, query) => highlightIn(toText(text), toText(query), engine, threshold),
    index: <T>(items: readonly T[], options?: MatcherListOptions<T>) => makeIndex(items, options?.keys, engine),
  } as Matcher);
}

/* ------------------------------------------------------------------------ */
/* Public functions                                                          */
/* ------------------------------------------------------------------------ */

/**
 * Creates a reusable matcher. Options are compiled once, which makes repeated
 * calls faster and keeps a use case's settings in one place.
 *
 * @example
 * const quiz = createMatcher({ preset: 'music', threshold: 85 })
 * quiz.check('bohemian rapsody', 'Bohemian Rhapsody - Remastered 2011').verdict // 'correct'
 *
 * const finder = createMatcher({ preset: 'search' })
 * finder.search('zep', bands, { limit: 5 })
 */
export function createMatcher(options: MatchOptions = {}): Matcher {
  return matcherFrom(compileEngine(options));
}

/**
 * Pre-processes a list once so it can be searched many times, fast.
 *
 * @example
 * const index = createIndex(songs, { keys: ['title', 'artist'], preset: 'search' })
 * index.search('queen')       // every Queen song, best first
 * index.closest('bohemian')   // { item: { title: 'Bohemian Rhapsody', ... }, score: 94.71, ... }
 */
export function createIndex<T>(items: readonly T[], ...args: ItemsArgs<T, ListOptions<T>>): Index<T> {
  const options = args[0] as ListOptions<T> | undefined;
  return makeIndex(items, options?.keys, getEngine(options));
}

/**
 * Similarity score between two texts, from 0 (nothing in common) to 100
 * (identical once normalized).
 *
 * @example
 * similarity('Molière', 'moliere')                 // 100
 * similarity('stairway to heven', 'Stairway to Heaven') // 94.44
 * similarity('Smith John', 'John Smith')           // 100
 */
export function similarity(a: string, b: string, options?: MatchOptions): number {
  const engine = getEngine(options);
  return scorePrepared(prepare(engine.normalize(toText(a))), prepare(engine.normalize(toText(b))), engine);
}

/**
 * Whether two texts are similar enough. Pass a number as a shortcut for the
 * threshold.
 *
 * @example
 * isMatch('Saint-Étienne', 'saint etienne') // true
 * isMatch('color', 'colour', 90)            // false (score 83.33)
 * isMatch('color', 'colour', { threshold: 80 }) // true
 */
export function isMatch(a: string, b: string, thresholdOrOptions?: number | MatchOptions): boolean {
  const options = typeof thresholdOrOptions === 'number' ? undefined : thresholdOrOptions;
  const engine = getEngine(options);
  const threshold = typeof thresholdOrOptions === 'number' ? thresholdOrOptions : engine.options.threshold;
  return similarity(a, b, options) >= threshold;
}

/**
 * Detailed comparison: normalized texts, score of each strategy, threshold.
 * Use it to understand a score and tune your options.
 *
 * @example
 * compare('The Beatles', 'beatles', { preset: 'music' })
 * // { score: 100, match: true, a: 'beatles', b: 'beatles', ... }
 */
export function compare(a: string, b: string, options?: MatchOptions): Comparison {
  return compareWith(a, b, getEngine(options));
}

/**
 * Grades a guess against one or several accepted answers: `correct`, `close`
 * ("almost!") or `wrong`. Built for quizzes, blind tests and form answers.
 *
 * @example
 * check('bohemian rapsody', 'Bohemian Rhapsody')
 * // { verdict: 'correct', correct: true, close: false, score: 94.12, answer: 'Bohemian Rhapsody' }
 *
 * check('the beetles', ['The Beatles', 'Beatles'], { preset: 'music' }).verdict // 'correct'
 * check('bohemian', 'Bohemian Rhapsody').verdict // 'wrong'
 */
export function check(guess: string, answers: string | readonly string[], options?: CheckOptions): CheckResult {
  const engine = getEngine(options);
  const threshold = engine.options.threshold;
  return grade(guess, answers, engine, threshold, options?.closeThreshold ?? threshold - 15);
}

/**
 * The item closest to `query`, or `undefined` if none reaches the threshold.
 * Perfect for "did you mean...?".
 *
 * @example
 * closest('pari', ['Paris', 'Lyon', 'Marseille'])?.item // 'Paris'
 * closest('bohemian', songs, { keys: 'title', partial: true })
 */
export function closest<T>(
  query: string,
  items: readonly T[],
  ...args: ItemsArgs<T, ListOptions<T>>
): Match<T> | undefined {
  const options = args[0] as ListOptions<T> | undefined;
  const engine = getEngine(options);
  return rank(query, buildEntries(items, options?.keys, engine), engine, engine.options.threshold, 1)[0];
}

/**
 * Items matching `query`, best first. Works with strings or objects.
 *
 * @example
 * search('iphone', ['iPhone 15', 'Galaxy S24', 'iphone 14'], { preset: 'search' })
 * // [{ item: 'iPhone 15', score: 96.67, index: 0, text: 'iPhone 15' }, ...]
 *
 * search('queen', songs, { keys: ['title', 'artist'], preset: 'search', limit: 10 })
 */
export function search<T>(query: string, items: readonly T[], ...args: ItemsArgs<T, ListOptions<T>>): Match<T>[] {
  const options = args[0] as ListOptions<T> | undefined;
  const engine = getEngine(options);
  return rank(
    query,
    buildEntries(items, options?.keys, engine),
    engine,
    engine.options.threshold,
    options?.limit ?? Infinity,
  );
}

/**
 * Removes near-duplicates, keeping the first occurrence of each.
 *
 * @example
 * dedupe(['Hey Jude', 'hey jude - Remastered 2015', 'Let It Be'], { preset: 'music' })
 * // ['Hey Jude', 'Let It Be']
 */
export function dedupe<T>(items: readonly T[], ...args: ItemsArgs<T, GroupOptions<T>>): T[] {
  return group(items, ...args).map((g) => g[0]!);
}

/**
 * Groups near-duplicates together, in their original order.
 *
 * @example
 * group(['Jean Dupont', 'Dupont Jean', 'Marie Curie'])
 * // [['Jean Dupont', 'Dupont Jean'], ['Marie Curie']]
 */
export function group<T>(items: readonly T[], ...args: ItemsArgs<T, GroupOptions<T>>): T[][] {
  const options = args[0] as GroupOptions<T> | undefined;
  const engine = getEngine(options);
  return cluster(buildEntries(items, options?.keys, engine), engine, engine.options.threshold);
}

/**
 * Fuzzy occurrences of `query` inside a longer text, with their positions in
 * the original text. Detects a title in a chat message, a name in a paragraph,
 * a product in a review...
 *
 * @example
 * find("je pense que c'est bohemian rapsody de queen", 'Bohemian Rhapsody')
 * // [{ text: 'bohemian rapsody', start: 19, end: 35, score: 94.12 }]
 */
export function find(text: string, query: string, options?: MatchOptions): Found[] {
  const engine = getEngine(options);
  return findIn(toText(text), toText(query), engine, engine.options.threshold);
}

/**
 * Splits `text` into pieces, marking those that match `query`: whole matches
 * and word prefixes, typos included. Join the pieces to get the text back.
 *
 * @example
 * highlight('Bohemian Rhapsody', 'bohem')
 * // [{ text: 'Bohem', match: true }, { text: 'ian Rhapsody', match: false }]
 *
 * // React
 * highlight(song.title, query).map((s, i) => (s.match ? <mark key={i}>{s.text}</mark> : s.text))
 */
export function highlight(text: string, query: string, options?: MatchOptions): Segment[] {
  const engine = getEngine(options);
  return highlightIn(toText(text), toText(query), engine, engine.options.threshold);
}
