export function validateStringInput(input, paramName = 'input') {
    if (typeof input !== 'string') {
        throw new TypeError(
        `[guess-rater] "${paramName}" doit être une chaîne de caractères. Type reçu : ${typeof input}.`
        );
    }
}

export function validateCandidatesArray(candidates, paramName = 'candidates') {
if (!Array.isArray(candidates)) {
    throw new TypeError(
    `[guess-rater] "${paramName}" doit être un tableau de chaînes de caractères.`
    );
}

for (let i = 0; i < candidates.length; i += 1) {
    if (typeof candidates[i] !== 'string') {
    throw new TypeError(
        `[guess-rater] "${paramName}[${i}]" doit être une chaîne de caractères. Type reçu : ${typeof candidates[i]}.`
    );
    }
}
}

export function validateAlgorithm(algorithm) {
    const supported = [
        'levenshtein',
        'jaroWinkler',
        'tokenSort',
        'tokenSet',
        'hybrid'
    ];

    if (!supported.includes(algorithm)) {
        throw new Error(
        `[guess-rater] Algorithme non supporté : "${algorithm}". Algorithmes disponibles : ${supported.join(', ')}.`
        );
    }
}