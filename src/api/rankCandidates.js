import { validateCandidatesArray, validateStringInput } from '../core/validate.js';
import { rate } from './rate.js';

export function rankCandidates(input, candidates, options = {}) {
    validateStringInput(input, 'input');
    validateCandidatesArray(candidates, 'candidates');

    return candidates
        .map((candidate, index) => {
        const result = rate(input, candidate, options);

        if (typeof result === 'number') {
            return {
            value: candidate,
            score: result,
            index
            };
        }

        return {
            value: candidate,
            index,
            ...result
        };
        })
        .sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }

        return a.index - b.index;
        });
}