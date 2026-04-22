/* ============================================================================
 * guess-rater — TypeScript declarations
 * Goal: Great IDE autocomplete + clear hover docs, without being overwhelming.
 * ========================================================================== */

/**
 * Supported matching algorithms.
 *
 * - `levenshtein`  : character edit distance (good baseline, typo tolerant)
 * - `jaroWinkler`  : great for short strings / names
 * - `tokenSort`    : compares after sorting tokens (word order irrelevant)
 * - `tokenSet`     : compares token overlap (tolerates extra/missing words)
 * - `hybrid`       : weighted combination of multiple strategies
 */
export type Algorithm =
  | 'levenshtein'
  | 'jaroWinkler'
  | 'tokenSort'
  | 'tokenSet'
  | 'hybrid';

/** Base algorithms used by token-based strategies. */
export type BaseAlgorithm = 'levenshtein' | 'jaroWinkler';

/**
 * Text normalization behavior (pure preprocessing).
 *
 * Normalization is applied BEFORE scoring. It is shared across all algorithms.
 * Use it to reduce formatting noise (accents, punctuation, casing, stopwords...).
 */
export interface NormalizeOptions {
  /**
   * Keeps original casing when true.
   * @default false
   */
  caseSensitive?: boolean;

  /**
   * Removes diacritics (é → e).
   * @default true
   */
  removeAccents?: boolean;

  /**
   * Removes punctuation characters.
   * @default true
   */
  removePunctuation?: boolean;

  /**
   * How punctuation is handled.
   * - `space`: replace punctuation by spaces (keeps word boundaries)
   * - `remove`: remove punctuation entirely
   * @default 'space'
   */
  punctuationStrategy?: 'space' | 'remove';

  /**
   * Trims outer whitespace.
   * @default true
   */
  trim?: boolean;

  /**
   * Collapses multiple spaces into a single space.
   * @default true
   */
  collapseWhitespace?: boolean;

  /**
   * Replace substrings before matching (abbreviations, common typos, domain rules).
   *
   * Example:
   * ```js
   * replacements: { nyc: 'new york city', appple: 'apple' }
   * ```
   * @default {}
   */
  replacements?: Record<string, string>;

  /**
   * Remove stop words entirely (articles, noise words, etc.).
   * @default []
   */
  removeWords?: string[];

  /**
   * Sort tokens alphabetically (makes word order irrelevant).
   *
   * Great for names/products, avoid for IDs/codes where order matters.
   * @default false
   */
  sortTokens?: boolean;
}

/** Options for the Jaro-Winkler algorithm. */
export interface JaroWinklerOptions {
  /**
   * Winkler prefix scaling factor.
   * @default 0.1
   */
  prefixScale?: number;

  /**
   * Maximum prefix length considered for the Winkler boost.
   * @default 4
   */
  maxPrefixLength?: number;
}

/** Options for tokenSort algorithm. */
export interface TokenSortOptions {
  /**
   * Base algorithm used after sorting tokens.
   * @default 'levenshtein'
   */
  baseAlgorithm?: BaseAlgorithm;
}

/** Options for tokenSet algorithm. */
export interface TokenSetOptions {
  /**
   * Base algorithm used to compare token-set derived strings.
   * @default 'levenshtein'
   */
  baseAlgorithm?: BaseAlgorithm;
}

/**
 * Hybrid algorithm weights.
 *
 * Notes:
 * - Weights do not have to sum to 1 (they are normalized internally),
 *   but it's recommended for readability.
 * - Do not include `hybrid` as a sub-algorithm.
 */
export interface HybridWeights {
  /** Weight for Levenshtein algorithm */
  levenshtein?: number;

  /** Weight for Jaro-Winkler algorithm */
  jaroWinkler?: number;

  /** Weight for token-sort algorithm */
  tokenSort?: number;

  /** Weight for token-set algorithm */
  tokenSet?: number;
}

/**
 * Similarity scoring configuration.
 *
 * Most users only need:
 * - `algorithm`
 * - `threshold`
 * - `normalize`
 *
 * Enable `explain: true` during tuning/debugging.
 */
export interface RateOptions {
  /**
   * Matching algorithm to use.
   * @default 'levenshtein'
   */
  algorithm?: Algorithm;

  /**
   * Minimum score required to consider a match (used in explain output).
   * @default 80
   */
  threshold?: number;

  /**
   * Enables detailed output (score + normalized strings + breakdown).
   * @default false
   */
  explain?: boolean;

  /**
   * Space-insensitive scoring (opt-in).
   *
   * If true, Guess‑Rater performs an additional comparison pass where ALL
   * whitespace is removed from both normalized strings, then keeps the best
   * score between:
   * 1) standard comparison (whitespace preserved)
   * 2) compact comparison (whitespace removed)
   *
   * ✅ Applies ONLY to character-based algorithms:
   * - levenshtein
   * - jaroWinkler
   *
   * ❌ Does NOT affect token-based algorithms:
   * - tokenSort
   * - tokenSet
   *
   * @default false
   * @example
   * rate('stairwaytoheaven', 'stairway to heaven', {
   *   algorithm: 'levenshtein',
   *   spaceInsensitive: true
   * })
   */
  spaceInsensitive?: boolean;

  /**
   * Normalization behavior (pure preprocessing).
   */
  normalize?: NormalizeOptions;

  /**
   * Jaro-Winkler tuning options.
   */
  jaroWinkler?: JaroWinklerOptions;

  /**
   * tokenSort tuning options.
   */
  tokenSort?: TokenSortOptions;

  /**
   * tokenSet tuning options.
   */
  tokenSet?: TokenSetOptions;

  /**
   * Hybrid algorithm weights.
   */
  hybrid?: HybridWeights;
}

/**
 * Explain data for the space-insensitive comparison pass.
 */
export interface SpaceInsensitiveExplain {
  /** true when the feature was enabled in options */
  enabled: boolean;

  /**
   * true when the compact pass was actually applied to that algorithm.
   * tokenSort/tokenSet typically set this to false.
   */
  applied: boolean;

  /** which score was selected */
  chosen?: 'standard' | 'compact';

  /** standard score (whitespace preserved) */
  standardScore?: number;

  /** compact score (whitespace removed) */
  compactScore?: number;

  /** normalizedLeft with all whitespace removed */
  compactLeft?: string;

  /** normalizedRight with all whitespace removed */
  compactRight?: string;

  /** optional explanation when not applied */
  reason?: string;
}

/**
 * Detailed similarity result (when explain: true).
 */
export interface RateExplainResult {
  /** final score (0..100) */
  score: number;

  /** score >= threshold */
  match: boolean;

  /** threshold used to compute match */
  threshold: number;

  /** algorithm used */
  algorithm: Algorithm;

  /** original left input */
  input: string;

  /** original right input */
  target: string;

  /** normalized left string (standard normalization) */
  normalizedLeft: string;

  /** normalized right string (standard normalization) */
  normalizedRight: string;

  details: {
    /** normalization options used */
    normalize: NormalizeOptions;

    /**
     * hybrid breakdown (score + weight per sub-algorithm)
     * only present when algorithm === 'hybrid'
     */
    hybrid?: Record<string, { score: number; weight: number }>;

    /**
     * spaceInsensitive details.
     * Typically keyed by algorithm name (useful for hybrid).
     * Present only when spaceInsensitive === true.
     */
    spaceInsensitive?: Record<string, SpaceInsensitiveExplain> | SpaceInsensitiveExplain;
  };
}

/**
 * Ranked string candidate (base form, without explain).
 */
export interface RankedCandidate {
  value: string;
  score: number;
  index: number;
}

/**
 * Ranked candidate when explain: true is used.
 * Includes all RateExplainResult fields + {value, index}.
 */
export type RankedCandidateExplain = RankedCandidate & RateExplainResult;

/**
 * Reusable matcher instance.
 */
export interface Matcher {
  /**
   * Computes similarity score.
   * - returns a number by default
   * - returns a detailed object when explain: true
   */
  rate(
    leftInput: string,
    rightInput: string,
    options?: RateOptions
  ): number | RateExplainResult;

  /**
   * Boolean similarity check.
   *
   * Note: In the current runtime, isMatch() always returns boolean.
   * If you need details, use rate(..., { explain:true }).
   */
  isMatch(
    leftInput: string,
    rightInput: string,
    thresholdOrOptions?: number | RateOptions
  ): boolean;

  /**
   * Ranks candidates by similarity.
   * Returns RankedCandidate[] or RankedCandidateExplain[] depending on explain.
   */
  rankCandidates(
    input: string,
    candidates: string[],
    options?: RateOptions
  ): RankedCandidate[] | RankedCandidateExplain[];

  /**
   * Returns best match (or null).
   */
  findBestMatch(
    input: string,
    candidates: string[],
    options?: RateOptions
  ): RankedCandidate | RankedCandidateExplain | null;

  /**
   * Normalizes text input (pure preprocessing).
   */
  normalize(
    input: string,
    options?: NormalizeOptions
  ): string;
}

/* ============================================================================
 * Top-level API exports
 * ========================================================================== */

/** rate() overloads (best DX): explain true => RateExplainResult, else => number */
export function rate(
  leftInput: string,
  rightInput: string,
  options?: RateOptions & { explain?: false }
): number;

export function rate(
  leftInput: string,
  rightInput: string,
  options: RateOptions & { explain: true }
): RateExplainResult;

/** Alias of rate — backward compatibility */
export function getSimilarityScore(
  leftInput: string,
  rightInput: string,
  options?: RateOptions & { explain?: false }
): number;

export function getSimilarityScore(
  leftInput: string,
  rightInput: string,
  options: RateOptions & { explain: true }
): RateExplainResult;

/**
 * Boolean similarity check.
 *
 * Supports:
 * - isMatch(a, b, 85)
 * - isMatch(a, b, { threshold: 85, normalize: {...} })
 *
 * Note: returns boolean only (explain ignored).
 */
export function isMatch(
  leftInput: string,
  rightInput: string,
  thresholdOrOptions?: number | RateOptions
): boolean;

/** rankCandidates overloads */
export function rankCandidates(
  input: string,
  candidates: string[],
  options?: RateOptions & { explain?: false }
): RankedCandidate[];

export function rankCandidates(
  input: string,
  candidates: string[],
  options: RateOptions & { explain: true }
): RankedCandidateExplain[];

/** findBestMatch overloads */
export function findBestMatch(
  input: string,
  candidates: string[],
  options?: RateOptions & { explain?: false }
): RankedCandidate | null;

export function findBestMatch(
  input: string,
  candidates: string[],
  options: RateOptions & { explain: true }
): RankedCandidateExplain | null;

/**
 * Normalizes input text (pure preprocessing).
 */
export function normalize(
  input: string,
  options?: NormalizeOptions
): string;

/** Alias of normalize — backward compatibility */
export function normalizeString(
  input: string,
  options?: NormalizeOptions
): string;

/**
 * Creates a reusable matcher instance.
 */
export function createMatcher(
  baseOptions?: RateOptions
): Matcher;

/* ============================================================================
 * Low-level algorithm helpers
 * ========================================================================== */

/** Computes Levenshtein edit distance */
export function getLevenshteinDistance(a: string, b: string): number;

/** Converts Levenshtein distance to a 0-100 similarity score */
export function getLevenshteinScore(a: string, b: string): number;

/** Computes Jaro similarity score (0-100) */
export function getJaroScore(a: string, b: string): number;

/** Computes Jaro-Winkler similarity score (0-100) */
export function getJaroWinklerScore(
  a: string,
  b: string,
  options?: JaroWinklerOptions
): number;

/** Computes token-sort similarity score (0-100) */
export function getTokenSortScore(
  a: string,
  b: string,
  options?: TokenSortOptions & { jaroWinkler?: JaroWinklerOptions }
): number;

/** Computes token-set similarity score (0-100) */
export function getTokenSetScore(
  a: string,
  b: string,
  options?: TokenSetOptions & { jaroWinkler?: JaroWinklerOptions }
): number;