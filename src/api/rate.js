import { resolveRateOptions } from '../core/defaults.js';
import { roundScore } from '../core/helpers.js';
import { validateAlgorithm, validateStringInput } from '../core/validate.js';
import { normalize } from '../normalize/normalize.js';
import { getLevenshteinScore } from '../algorithms/levenshtein.js';
import { getJaroWinklerScore } from '../algorithms/jaroWinkler.js';
import { getTokenSortScore } from '../algorithms/tokenSort.js';
import { getTokenSetScore } from '../algorithms/tokenSet.js';

function computeSingleAlgorithmScore(algorithm, left, right, options) {
    switch (algorithm) {
        case 'levenshtein':
        return getLevenshteinScore(left, right);

        case 'jaroWinkler':
        return getJaroWinklerScore(left, right, options.jaroWinkler);

        case 'tokenSort':
        return getTokenSortScore(left, right, {
            ...options.tokenSort,
            jaroWinkler: options.jaroWinkler
        });

        case 'tokenSet':
        return getTokenSetScore(left, right, {
            ...options.tokenSet,
            jaroWinkler: options.jaroWinkler
        });

        default:
        throw new Error(`[guess-rater] Algorithme non géré : "${algorithm}".`);
    }
    }

    function computeHybridScore(left, right, options) {
    const validEntries = Object.entries(options.hybrid || {}).filter(
        ([, weight]) => typeof weight === 'number' && weight > 0
    );

    if (validEntries.length === 0) {
        return {
        score: 0,
        breakdown: {}
        };
    }

    const totalWeight = validEntries.reduce((sum, [, weight]) => sum + weight, 0);
    const breakdown = {};
    let weightedScore = 0;

    for (const [algorithm, weight] of validEntries) {
        if (algorithm === 'hybrid') {
            throw new Error(
                '[guess-rater] "hybrid" ne peut pas être utilisé comme sous-algorithme dans les poids hybrides.'
            );
        }

        validateAlgorithm(algorithm);

        const score = computeSingleAlgorithmScore(algorithm, left, right, options);

        breakdown[algorithm] = {
        score,
        weight
        };

        weightedScore += score * weight;
    }

    return {
        score: roundScore(weightedScore / totalWeight),
        breakdown
    };
    }

    export function rate(leftInput, rightInput, options = {}) {
    validateStringInput(leftInput, 'leftInput');
    validateStringInput(rightInput, 'rightInput');

    const config = resolveRateOptions(options);
    validateAlgorithm(config.algorithm);

    const normalizedLeft = normalize(leftInput, config.normalize);
    const normalizedRight = normalize(rightInput, config.normalize);

    let score;
    let breakdown;

    if (config.algorithm === 'hybrid') {
        const hybridResult = computeHybridScore(normalizedLeft, normalizedRight, config);
        score = hybridResult.score;
        breakdown = hybridResult.breakdown;
    } else {
        score = computeSingleAlgorithmScore(
        config.algorithm,
        normalizedLeft,
        normalizedRight,
        config
        );
    }

    if (!config.explain) {
        return score;
    }

    return {
        score,
        match: score >= config.threshold,
        threshold: config.threshold,
        algorithm: config.algorithm,
        input: leftInput,
        target: rightInput,
        normalizedLeft,
        normalizedRight,
        details: {
        normalize: config.normalize,
        ...(breakdown ? { hybrid: breakdown } : {})
        }
    };
}

// Alias rétrocompatible
export function getSimilarityScore(leftInput, rightInput, options = {}) {
    return rate(leftInput, rightInput, options);
}
