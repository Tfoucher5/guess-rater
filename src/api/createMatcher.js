import { DEFAULT_RATE_OPTIONS } from '../core/defaults.js';
import { deepMerge } from '../core/helpers.js';
import { normalize } from '../normalize/normalize.js';
import { findBestMatch } from './findBestMatch.js';
import { isMatch } from './isMatch.js';
import { rankCandidates } from './rankCandidates.js';
import { rate } from './rate.js';

export function createMatcher(baseOptions = {}) {
    const resolvedBaseOptions = deepMerge(DEFAULT_RATE_OPTIONS, baseOptions);

    return {
        options: resolvedBaseOptions,

        rate(leftInput, rightInput, options = {}) {
        return rate(leftInput, rightInput, deepMerge(resolvedBaseOptions, options));
        },

        isMatch(leftInput, rightInput, thresholdOrOptions = {}, maybeOptions = {}) {
        if (typeof thresholdOrOptions === 'number') {
            return isMatch(
            leftInput,
            rightInput,
            thresholdOrOptions,
            deepMerge(resolvedBaseOptions, maybeOptions)
            );
        }

        return isMatch(
            leftInput,
            rightInput,
            deepMerge(resolvedBaseOptions, thresholdOrOptions || {})
        );
        },

        rankCandidates(input, candidates, options = {}) {
        return rankCandidates(input, candidates, deepMerge(resolvedBaseOptions, options));
        },

        findBestMatch(input, candidates, options = {}) {
        return findBestMatch(input, candidates, deepMerge(resolvedBaseOptions, options));
        },

        normalize(input, normalizeOptions = {}) {
        return normalize(
            input,
            deepMerge(resolvedBaseOptions.normalize, normalizeOptions)
        );
        }
    };
}