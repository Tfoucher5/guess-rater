import { rankCandidates } from './rankCandidates.js';

export function findBestMatch(input, candidates, options = {}) {
    const ranked = rankCandidates(input, candidates, options);
    return ranked[0] || null;
}