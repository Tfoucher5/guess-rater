import { deepMerge } from './helpers.js';

export const DEFAULT_NORMALIZE_OPTIONS = Object.freeze({
    caseSensitive: false,
    removeAccents: true,
    removePunctuation: true,
    punctuationStrategy: 'space', // "space" | "remove"
    trim: true,
    collapseWhitespace: true,
    replacements: {},
    removeWords: [],
    sortTokens: false
});

export const DEFAULT_RATE_OPTIONS = Object.freeze({
    algorithm: 'levenshtein', // "levenshtein" | "jaroWinkler" | "tokenSort" | "tokenSet" | "hybrid"
    threshold: 80,
    explain: false,
    spaceInsensitive: false,
    normalize: DEFAULT_NORMALIZE_OPTIONS,
    jaroWinkler: {
    prefixScale: 0.1,
    maxPrefixLength: 4
    },
    tokenSort: {
        baseAlgorithm: 'levenshtein' // "levenshtein" | "jaroWinkler"
    },
    tokenSet: {
        baseAlgorithm: 'levenshtein' // "levenshtein" | "jaroWinkler"
    },
    hybrid: {
        levenshtein: 0.4,
        jaroWinkler: 0.3,
        tokenSet: 0.3
    }
});

export function resolveRateOptions(options = {}) {
  return deepMerge(DEFAULT_RATE_OPTIONS, options);
}