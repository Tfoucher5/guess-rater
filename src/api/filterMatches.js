import { validateStringInput } from '../core/validate.js';
import { rankCandidates } from './rankCandidates.js';

/**
 * Filters candidates that match above a threshold.
 *
 * Default behavior:
 * - returns string[] (values only)
 *
 * Advanced:
 * - pass { return: 'entries' } to return ranked entry objects
 * - pass { return: 'entries', explain: true } to include explain payload per entry
 *
 * Notes:
 * - explain is ignored when return !== 'entries'
 */
export function filterMatches(input, candidates, options = {}) {
    validateStringInput(input, 'input');

    if (!Array.isArray(candidates)) {
        throw new TypeError('[guess-rater] candidates must be an array of strings.');
    }

    // Basic option parsing (simple by default)
    const {
        threshold: rawThreshold,
        explain: rawExplain,
        return: returnMode
    } = options;

    const threshold = typeof rawThreshold === 'number' ? rawThreshold : 80;
    const wantEntries = returnMode === 'entries';
    const explain = wantEntries && rawExplain === true;

    // We pass threshold so that `match` inside explain results is coherent.
    const ranked = rankCandidates(input, candidates, {
        ...options,
        threshold,
        explain
    });

    // Filter by score (simple and consistent everywhere)
    const filtered = ranked.filter((r) => r.score >= threshold);

    if (!wantEntries) {
        return filtered.map((r) => r.value);
    }

    return filtered;
}
