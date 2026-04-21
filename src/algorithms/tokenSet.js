import { validateStringInput } from '../core/validate.js';
import { uniqueTokens } from '../core/helpers.js';
import { getLevenshteinScore } from './levenshtein.js';
import { getJaroWinklerScore } from './jaroWinkler.js';

function compareStrings(a, b, baseAlgorithm, jaroWinklerOptions) {
  if (baseAlgorithm === 'jaroWinkler') {
    return getJaroWinklerScore(a, b, jaroWinklerOptions);
  }

  return getLevenshteinScore(a, b);
}

export function getTokenSetScore(a, b, options = {}) {
    validateStringInput(a, 'a');
    validateStringInput(b, 'b');

    const {
        baseAlgorithm = 'levenshtein',
        jaroWinkler = {}
    } = options;

    const leftTokens = uniqueTokens(a);
    const rightTokens = uniqueTokens(b);

    if (leftTokens.length === 0 && rightTokens.length === 0) {
        return 100;
    }

    const rightSet = new Set(rightTokens);

    const intersection = leftTokens.filter((token) => rightSet.has(token));
    const leftDiff = leftTokens.filter((token) => !rightSet.has(token));
    const leftSet = new Set(leftTokens);
    const rightDiff = rightTokens.filter((token) => !leftSet.has(token));

    const sortedIntersection = [...intersection].sort().join(' ');
    const sortedLeft = [...intersection, ...leftDiff].sort().join(' ');
    const sortedRight = [...intersection, ...rightDiff].sort().join(' ');

    return Math.max(
        compareStrings(sortedIntersection, sortedLeft, baseAlgorithm, jaroWinkler),
        compareStrings(sortedIntersection, sortedRight, baseAlgorithm, jaroWinkler),
        compareStrings(sortedLeft, sortedRight, baseAlgorithm, jaroWinkler)
    );
}