import { resolveRateOptions } from '../core/defaults.js';
import { roundScore } from '../core/helpers.js';
import { validateAlgorithm, validateStringInput } from '../core/validate.js';
import { normalize } from '../normalize/normalize.js';
import { getLevenshteinScore } from '../algorithms/levenshtein.js';
import { getJaroWinklerScore } from '../algorithms/jaroWinkler.js';
import { getTokenSortScore } from '../algorithms/tokenSort.js';
import { getTokenSetScore } from '../algorithms/tokenSet.js';

function stripWhitespace(str) {
  return str.replace(/\s+/g, '');
}

function maxScoreWithSpaceInsensitive(left, right, enabled, scorer) {
	const standardScore = scorer(left, right);

	if (!enabled) {
			return { score: standardScore };
	}

	const compactLeft = stripWhitespace(left);
	const compactRight = stripWhitespace(right);
	const compactScore = scorer(compactLeft, compactRight);

	if (compactScore >= standardScore) {
			return {
			score: compactScore,
			details: {
					enabled: true,
					applied: true,
					chosen: 'compact',
					standardScore,
					compactScore,
					compactLeft,
					compactRight
			}
			};
	}

	return {
			score: standardScore,
			details: {
			enabled: true,
			applied: true,
			chosen: 'standard',
			standardScore,
			compactScore,
			compactLeft,
			compactRight
			}
	};
}

function computeSingleAlgorithmScore(algorithm, left, right, options, spaceCollector) {
    switch (algorithm) {
        
		case 'levenshtein': {
		const res = maxScoreWithSpaceInsensitive(
			left,
			right,
			options.spaceInsensitive === true,
			(a, b) => getLevenshteinScore(a, b)
		);

		if (spaceCollector && res.details) {
			spaceCollector.levenshtein = res.details;
		} else if (spaceCollector && options.spaceInsensitive === true) {
			spaceCollector.levenshtein = { enabled: true, applied: true, chosen: 'standard', standardScore: res.score, compactScore: res.score, compactLeft: stripWhitespace(left), compactRight: stripWhitespace(right) };
		}

		return res.score;
		}


        case 'jaroWinkler': {
		const res = maxScoreWithSpaceInsensitive(
			left,
			right,
			options.spaceInsensitive === true,
			(a, b) => getJaroWinklerScore(a, b, options.jaroWinkler)
		);

		if (spaceCollector && res.details) {
			spaceCollector.jaroWinkler = res.details;
		}

		return res.score;
		}

        
		case 'tokenSort': {
		if (spaceCollector && options.spaceInsensitive === true) {
			spaceCollector.tokenSort = { enabled: true, applied: false, reason: 'token-based algorithm' };
		}
		return getTokenSortScore(
		left, right, {
                ...options.tokenSort,
                jaroWinkler: options.jaroWinkler
            });
		}

        case 'tokenSet': {
		if (spaceCollector && options.spaceInsensitive === true) {
			spaceCollector.tokenSort = { enabled: true, applied: false, reason: 'token-based algorithm' };
		}
		return getTokenSetScore(left, right, {
				...options.tokenSet,
				jaroWinkler: options.jaroWinkler
			});
		}

        default:
            throw new Error(`[guess-rater] Algorithme non géré : "${algorithm}".`);
    }
}

function computeHybridScore(left, right, options, spaceCollector) {
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

        const score = computeSingleAlgorithmScore(algorithm, left, right, options, spaceCollector);

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
	const spaceInsensitiveDetails = config.spaceInsensitive === true ? {} : null;

    let score;
    let breakdown;

    if (config.algorithm === 'hybrid') {
        const hybridResult = computeHybridScore(normalizedLeft, normalizedRight, config, config.explain ? spaceInsensitiveDetails : null);
        score = hybridResult.score;
        breakdown = hybridResult.breakdown;
    } else {
        score = computeSingleAlgorithmScore(
            config.algorithm,
            normalizedLeft,
            normalizedRight,
            config,
			config.explain ? spaceInsensitiveDetails : null
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
            ...(breakdown ? { hybrid: breakdown } : {}),
			...(spaceInsensitiveDetails ? { spaceInsensitive: spaceInsensitiveDetails } : {})
        }
    };
}

export function getSimilarityScore(leftInput, rightInput, options = {}) {
    return rate(leftInput, rightInput, options);
}
