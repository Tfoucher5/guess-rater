import { validateStringInput } from '../core/validate.js';
import { rankCandidates } from './rankCandidates.js';

/**
 * Extracts the top matches from a candidate list.
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
export function extract(input, candidates, options = {}) {
    validateStringInput(input, 'input');

    if (!Array.isArray(candidates)) {
        throw new TypeError('[guess-rater] candidates must be an array of strings.');
    }

    const {
        limit: rawLimit,
        threshold: rawThreshold,
        explain: rawExplain,
        return: returnMode
    } = options;

    const threshold = typeof rawThreshold === 'number' ? rawThreshold : 80;
    const limit = typeof rawLimit === 'number' ? rawLimit : 5;

    if (!Number.isFinite(limit) || limit < 0) {
        throw new TypeError('[guess-rater] limit must be a finite number >= 0.');
    }

    const wantEntries = returnMode === 'entries';
    const explain = wantEntries && rawExplain === true;

    const ranked = rankCandidates(input, candidates, {
        ...options,
        threshold,
        explain
    });

    const filtered = ranked.filter((r) => r.score >= threshold);
    const sliced = filtered.slice(0, limit);

    if (!wantEntries) {
        return sliced.map((r) => r.value);
    }

    return sliced;
}