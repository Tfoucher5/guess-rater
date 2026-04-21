export { rate, getSimilarityScore } from './api/rate.js';
export { isMatch } from './api/isMatch.js';
export { rankCandidates } from './api/rankCandidates.js';
export { findBestMatch } from './api/findBestMatch.js';
export { createMatcher } from './api/createMatcher.js';

export { normalize, normalizeString } from './normalize/normalize.js';

export {
    getLevenshteinDistance,
    getLevenshteinScore
} from './algorithms/levenshtein.js';

export {
    getJaroScore,
    getJaroWinklerScore
} from './algorithms/jaroWinkler.js';

export { getTokenSortScore } from './algorithms/tokenSort.js';
export { getTokenSetScore } from './algorithms/tokenSet.js';