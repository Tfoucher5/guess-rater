export type Algorithm =
  | 'levenshtein'
  | 'jaroWinkler'
  | 'tokenSort'
  | 'tokenSet'
  | 'hybrid';

/**
 * Text normalization behavior
 */
export interface NormalizeOptions {

  /** Keeps original casing */
  caseSensitive?: boolean;

  /** Removes diacritics (é → e) */
  removeAccents?: boolean;

  /** Removes punctuation */
  removePunctuation?: boolean;

  /** How punctuation is handled */
  punctuationStrategy?: 'space' | 'remove';

  /** Trims outer whitespace */
  trim?: boolean;

  /** Collapses multiple spaces */
  collapseWhitespace?: boolean;

  /** Replace substrings before matching */
  replacements?: Record<string, string>;

  /** Remove stop words */
  removeWords?: string[];

  /** Sort tokens alphabetically */
  sortTokens?: boolean;
}

/**
 * Hybrid algorithm weights
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
 * Similarity scoring configuration
 */
export interface RateOptions {

  /**
   * Matching algorithm to use
   * @default 'levenshtein'
   */
  algorithm?: Algorithm;

  /**
   * Minimum score required to consider a match
   * @default 80
   */
  threshold?: number;

  /**
   * Enables detailed output
   */
  explain?: boolean;

  /**
   * Also evaluates without spaces and picks the best result
   */
  spaceInsensitive?: boolean;

  /**
   * Normalization behavior
   */
  normalize?: NormalizeOptions;

  /**
   * Hybrid algorithm weights
   */
  hybrid?: HybridWeights;
}

/**
 * Detailed similarity result
 */
export interface RateExplainResult {
  score: number;
  match: boolean;
  threshold: number;
  algorithm: Algorithm;
  input: string;
  target: string;
  normalizedLeft: string;
  normalizedRight: string;
  details: {
    normalize: NormalizeOptions;
    hybrid?: Record<string, { score: number; weight: number }>;
  };
}

/**
 * Ranked string candidate (base form, without explain)
 */
export interface RankedCandidate {
  value: string;
  score: number;
  index: number;
}

/**
 * Ranked string candidate when explain: true is passed
 */
export type RankedCandidateExplain = RankedCandidate & RateExplainResult;

/**
 * Reusable matcher instance
 */
export interface Matcher {

  /**
   * Computes similarity score
   */
  rate(
    leftInput: string,
    rightInput: string,
    options?: RateOptions
  ): number | RateExplainResult;

  /**
   * Boolean similarity check
   */
  isMatch(
    leftInput: string,
    rightInput: string,
    thresholdOrOptions?: number | RateOptions
  ): boolean;

  /**
   * Ranks candidates by similarity
   */
  rankCandidates(
    input: string,
    candidates: string[],
    options?: RateOptions
  ): RankedCandidate[] | RankedCandidateExplain[];

  /**
   * Returns best match
   */
  findBestMatch(
    input: string,
    candidates: string[],
    options?: RateOptions
  ): RankedCandidate | RankedCandidateExplain | null;

  /**
   * Normalizes text input
   */
  normalize(
    input: string,
    options?: NormalizeOptions
  ): string;
}

/**
 * Computes similarity score
 */
export function rate(
  leftInput: string,
  rightInput: string,
  options?: RateOptions
): number | RateExplainResult;

/** Alias of rate — rétrocompatibilité */
export function getSimilarityScore(
  leftInput: string,
  rightInput: string,
  options?: RateOptions
): number | RateExplainResult;

/**
 * Boolean similarity check
 */
export function isMatch(
  leftInput: string,
  rightInput: string,
  thresholdOrOptions?: number | RateOptions
): boolean;

/**
 * Ranks candidates
 */
export function rankCandidates(
  input: string,
  candidates: string[],
  options?: RateOptions
): RankedCandidate[] | RankedCandidateExplain[];

/**
 * Returns best match
 */
export function findBestMatch(
  input: string,
  candidates: string[],
  options?: RateOptions
): RankedCandidate | RankedCandidateExplain | null;

/**
 * Normalizes input text
 */
export function normalize(
  input: string,
  options?: NormalizeOptions
): string;

/** Alias of normalize — rétrocompatibilité */
export function normalizeString(
  input: string,
  options?: NormalizeOptions
): string;

/**
 * Creates reusable matcher
 */
export function createMatcher(
  baseOptions?: RateOptions
): Matcher;

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
  options?: { prefixScale?: number; maxPrefixLength?: number }
): number;

/** Computes token-sort similarity score (0-100) */
export function getTokenSortScore(
  a: string,
  b: string,
  options?: { baseAlgorithm?: 'levenshtein' | 'jaroWinkler'; jaroWinkler?: object }
): number;

/** Computes token-set similarity score (0-100) */
export function getTokenSetScore(
  a: string,
  b: string,
  options?: { baseAlgorithm?: 'levenshtein' | 'jaroWinkler'; jaroWinkler?: object }
): number;
