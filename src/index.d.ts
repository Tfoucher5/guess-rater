export type Algorithm =
    | 'levenshtein'
    | 'jaroWinkler'
    | 'tokenSort'
    | 'tokenSet'
    | 'hybrid';

export interface NormalizeOptions {
    caseSensitive?: boolean;
    removeAccents?: boolean;
    removePunctuation?: boolean;
    punctuationStrategy?: 'space' | 'remove';
    trim?: boolean;
    collapseWhitespace?: boolean;
    replacements?: Record<string, string>;
    removeWords?: string[];
    sortTokens?: boolean;
}

export interface HybridWeights {
    levenshtein?: number;
    jaroWinkler?: number;
    tokenSet?: number;
}

export interface RateOptions {
    algorithm?: Algorithm;
    threshold?: number;
    explain?: boolean;
    normalize?: NormalizeOptions;
    hybrid?: HybridWeights;
}

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
        hybrid?: Record<
        string,
        {
            score: number;
            weight: number;
        }
        >;
    };
}

export interface RankedCandidate {
    value: string;
    score: number;
    index: number;
}

export interface Matcher {
    rate(
        leftInput: string,
        rightInput: string,
        options?: RateOptions
    ): number | RateExplainResult;

    isMatch(
        leftInput: string,
        rightInput: string,
        thresholdOrOptions?: number | RateOptions
    ): boolean;

    rankCandidates(
        input: string,
        candidates: string[],
        options?: RateOptions
    ): RankedCandidate[];

    findBestMatch(
        input: string,
        candidates: string[],
        options?: RateOptions
    ): RankedCandidate | null;

    normalize(
        input: string,
        options?: NormalizeOptions
    ): string;
}

export function rate(
    leftInput: string,
    rightInput: string,
    options?: RateOptions
): number | RateExplainResult;

export function isMatch(
    leftInput: string,
    rightInput: string,
    thresholdOrOptions?: number | RateOptions
): boolean;

export function rankCandidates(
    input: string,
    candidates: string[],
    options?: RateOptions
): RankedCandidate[];

export function findBestMatch(
    input: string,
    candidates: string[],
    options?: RateOptions
): RankedCandidate | null;

export function normalize(
    input: string,
    options?: NormalizeOptions
): string;

export function createMatcher(
    baseOptions?: RateOptions
): Matcher;