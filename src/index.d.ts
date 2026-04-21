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
 * Ranked string candidate
 */
export interface RankedCandidate {
  value: string;
  score: number;
  index: number;
}

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
  ): RankedCandidate[];

  /**
   * Returns best match
   */
  findBestMatch(
    input: string,
    candidates: string[],
    options?: RateOptions
  ): RankedCandidate | null;

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
): RankedCandidate[];

/**
 * Returns best match
 */
export function findBestMatch(
  input: string,
  candidates: string[],
  options?: RateOptions
): RankedCandidate | null;

/**
 * Normalizes input text
 */
export function normalize(
  input: string,
  options?: NormalizeOptions
): string;

/**
 * Creates reusable matcher
 */
export function createMatcher(
  baseOptions?: RateOptions
): Matcher;