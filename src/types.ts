/**
 * Scoring strategy.
 *
 * - `smart` *(default)*: typo-tolerant (Damerau), ignores word order and
 *   missing spaces. Right for most uses.
 * - `levenshtein`: plain character edit distance.
 * - `damerau`: edit distance where swapped letters (`teh` / `the`) count once.
 * - `jaroWinkler`: favors a shared prefix, good for short names.
 * - `tokenSort`: compares words after sorting them.
 * - `tokenSet`: compares shared words; a subset scores 100.
 */
export type Algorithm =
  | 'smart'
  | 'levenshtein'
  | 'damerau'
  | 'jaroWinkler'
  | 'tokenSort'
  | 'tokenSet';

/**
 * Ready-made configurations. Your own options always win over the preset.
 *
 * - `music`: song titles and artists. Drops `(feat. X)`, `- Remastered 2011`,
 *   bracketed info and leading articles (`The`, `Les`...), reads `&` and `n` as `and`.
 * - `search`: search-as-you-type. Matches prefixes and parts of the text
 *   (`partial: true`), threshold 70, numbers left as written.
 * - `strict`: word order and spaces matter, threshold 90.
 */
export type Preset = 'music' | 'search' | 'strict';

/**
 * Noise that can be removed before comparing.
 *
 * - `brackets`: anything in `( )`, `[ ]` or `{ }`.
 * - `featuring`: `feat. X`, `ft. X`, `featuring X` until the end, and `(with X)`.
 * - `version`: `- Remastered 2011`, `(Live)`, `- Radio Edit`, `(Acoustic)`...
 * - `articles`: a leading article (`the`, `a`, `le`, `la`, `les`, `l'`, `el`, `die`...).
 */
export type StripRule = 'brackets' | 'featuring' | 'version' | 'articles';

/** How text is cleaned up before being compared. */
export interface NormalizeOptions {
  /**
   * Treat `A` and `a` as different characters.
   * @default false
   */
  caseSensitive?: boolean;

  /**
   * Treat `é` and `e` as different characters. Ligatures (`œ`, `æ`, `ß`) are
   * expanded unless this is true.
   * @default false
   */
  accentSensitive?: boolean;

  /**
   * What to do with punctuation. Apostrophes are always removed outright
   * (`don't` → `dont`) unless `keep` is used.
   * - `space`: replace it with a space (`saint-nazaire` → `saint nazaire`)
   * - `remove`: delete it (`saint-nazaire` → `saintnazaire`)
   * - `keep`: leave it untouched
   * @default 'space'
   */
  punctuation?: 'space' | 'remove' | 'keep';

  /**
   * Noise to remove before comparing.
   * @example
   * strip: ['featuring', 'version'] // "Song (feat. X) - Remastered" → "song"
   */
  strip?: readonly StripRule[];

  /**
   * Whole words to ignore, such as stop words.
   * @example
   * ignoreWords: ['inc', 'ltd', 'sa']
   */
  ignoreWords?: readonly string[];

  /**
   * Whole-word replacements applied before comparing: abbreviations,
   * synonyms, common misspellings. Keys are matched without case or accents.
   * @example
   * replace: { st: 'saint', '&': 'and', nyc: 'new york city' }
   */
  replace?: Readonly<Record<string, string>>;

  /**
   * Read numbers written in words (English and French) and roman numerals as
   * digits: `two` = `deux` = `II` = `2`, `twenty one` = `vingt et un` = `21`,
   * `first` = `1st`. Single letters (`I`, `V`, `X`) are left alone.
   * @default true (false with the `search` preset, so prefixes keep working)
   */
  numbers?: boolean;
}

/** Everything that controls a comparison. All fields are optional. */
export interface MatchOptions extends NormalizeOptions {
  /**
   * Start from a ready-made configuration.
   * @see Preset
   */
  preset?: Preset;

  /**
   * Minimum score (0 to 100) for two texts to match.
   * @default 80
   */
  threshold?: number;

  /**
   * Scoring strategy. Leave it to `smart` unless you have a reason.
   * @default 'smart'
   */
  algorithm?: Algorithm;

  /**
   * `smart` only: `john smith` matches `smith john`.
   * @default true
   */
  ignoreWordOrder?: boolean;

  /**
   * `smart` only: `stairwaytoheaven` matches `stairway to heaven`.
   * @default true
   */
  ignoreSpaces?: boolean;

  /**
   * `smart` only: the shorter text may match just a part of the longer one,
   * prefixes included (`stair` matches `Stairway to Heaven`). Ideal for search.
   * A full match always scores higher than a partial one.
   * @default false (true with the `search` preset)
   */
  partial?: boolean;
}

/** Options of {@link check}. */
export interface CheckOptions extends MatchOptions {
  /**
   * Minimum score for a guess to count as `close` ("almost!").
   * @default threshold - 15
   */
  closeThreshold?: number;
}

/** Names of the properties of `T` that hold text. */
export type TextKey<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends string | readonly string[] ? K : never;
}[keyof T] &
  string;

/**
 * A property that counts less (or more) than others. Matches on it score
 * `score × weight`.
 * @example
 * keys: ['title', { name: 'artist', weight: 0.8 }]
 */
export interface WeightedKey<T> {
  /** Property holding text. */
  name: TextKey<T>;
  /**
   * Multiplier applied to scores on this property, usually between 0 and 1.
   * @default 1
   */
  weight: number;
}

/**
 * Where to find the text of an item: a property name, several property names
 * (optionally weighted), or a function. Each item may provide several texts;
 * the best one wins.
 */
export type KeysOption<T> =
  | TextKey<T>
  | readonly (TextKey<T> | WeightedKey<T>)[]
  | ((item: T) => string | readonly string[] | null | undefined);

/** Options of list functions ({@link search}, {@link closest}). */
export interface ListOptions<T> extends MatchOptions {
  /**
   * Maximum number of results.
   * @default Infinity
   */
  limit?: number;

  /**
   * Where to read the text of each item. Required when items are objects.
   * @example
   * search('queen', songs, { keys: ['title', 'artist'] })
   * search('queen', songs, { keys: (song) => song.artist.name })
   */
  keys?: KeysOption<T>;
}

/** Options of {@link dedupe} and {@link group}. */
export interface GroupOptions<T> extends MatchOptions {
  /** Where to read the text of each item. Required when items are objects. */
  keys?: KeysOption<T>;
}

/** Same as `O`, but `keys` is required unless items are strings. */
export type WithKeys<T, O extends { keys?: unknown }> = T extends string
  ? O
  : O & { keys: KeysOption<T> };

/** One result of a list function. */
export interface Match<T> {
  /** The original item. */
  item: T;
  /** Similarity score, from 0 to 100. */
  score: number;
  /** Position of the item in the original list. */
  index: number;
  /** The text of the item that produced the score. */
  text: string;
}

/** Outcome of {@link check}. */
export type Verdict = 'correct' | 'close' | 'wrong';

/** Result of {@link check}. */
export interface CheckResult {
  /** `correct`, `close` ("almost!") or `wrong`. */
  verdict: Verdict;
  /** Shortcut for `verdict === 'correct'`. */
  correct: boolean;
  /** Shortcut for `verdict === 'close'`. */
  close: boolean;
  /** Best score among the accepted answers, from 0 to 100. */
  score: number;
  /** The accepted answer closest to the guess, if any. */
  answer: string | undefined;
}

/** Detailed result of {@link compare}, useful to tune options. */
export interface Comparison {
  /** Similarity score, from 0 to 100. */
  score: number;
  /** Whether `score >= threshold`. */
  match: boolean;
  /** Threshold used. */
  threshold: number;
  /** Algorithm used. */
  algorithm: Algorithm;
  /** `a` after normalization. */
  a: string;
  /** `b` after normalization. */
  b: string;
  /**
   * Score of each strategy tried. With `smart`, the final score is the best
   * of them.
   */
  scores: Partial<Record<'characters' | 'wordOrder' | 'spaces' | 'partial' | Algorithm, number>>;
}

/** Result of {@link checkAll}: one verdict per part of the answer. */
export interface MultiCheckResult<K extends string> {
  /** Whether every part was found in the guess. */
  correct: boolean;
  /** Parts found in the guess, in the order they were given. */
  found: K[];
  /** Parts not found (`close` or `wrong`). */
  missing: K[];
  /** The detailed result of each part. */
  parts: Record<K, CheckResult>;
}

/** Options of {@link join}. */
export interface JoinOptions<L, R> extends MatchOptions {
  /** Where to read the text of left items. Required when they are objects. */
  left?: KeysOption<L>;
  /** Where to read the text of right items. Required when they are objects. */
  right?: KeysOption<R>;
  /**
   * Use each right item at most once: when two left items want the same one,
   * the better match gets it and the other takes its next best choice.
   * @default false
   */
  unique?: boolean;
}

/** One row of {@link join}: a left item and its best match on the right, if any. */
export interface JoinRow<L, R> {
  /** The left item. */
  item: L;
  /** Position of the left item in its list. */
  index: number;
  /** The best right item, or `undefined` if none reaches the threshold. */
  match: Match<R> | undefined;
}
