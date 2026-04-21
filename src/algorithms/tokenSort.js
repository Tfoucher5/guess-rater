import { validateStringInput } from '../core/validate.js';
import { sortTokens } from '../core/helpers.js';
import { getLevenshteinScore } from './levenshtein.js';
import { getJaroWinklerScore } from './jaroWinkler.js';

export function getTokenSortScore(a, b, options = {}) {
    validateStringInput(a, 'a');
    validateStringInput(b, 'b');

    const {
        baseAlgorithm = 'levenshtein',
        jaroWinkler = {}
    } = options;

    const left = sortTokens(a);
    const right = sortTokens(b);

    if (baseAlgorithm === 'jaroWinkler') {
        return getJaroWinklerScore(left, right, jaroWinkler);
    }

    return getLevenshteinScore(left, right);
}