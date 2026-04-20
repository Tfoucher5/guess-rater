// src/index.js

import { normalizeString } from './normalize.js';
import { getLevenshteinDistance } from './levenshtein.js';

/**
 * Vérifie que l'entrée est bien une chaîne de caractères.
 * @param {*} input - La variable à tester.
 * @param {string} paramName - Le nom du paramètre (pour le message d'erreur).
 * @throws {TypeError} Si l'entrée n'est pas une string.
 */
function validateStringInput(input, paramName) {
    if (typeof input !== 'string') {
        throw new TypeError(`[guess-rater] Erreur : Le paramètre '${paramName}' doit être une chaîne de caractères. Type reçu : ${typeof input}.`);
    }
}

export function getSimilarityScore(expected, input, options = {}) {
    // --- NOUVEAU : On valide les entrées avant de faire quoi que ce soit ---
    validateStringInput(expected, 'expected');
    validateStringInput(input, 'input');

    const normExpected = normalizeString(expected, options);
    const normInput = normalizeString(input, options);

    if (normExpected.length === 0 && normInput.length === 0) return 100;
    if (normExpected.length === 0 || normInput.length === 0) return 0;

    const distance = getLevenshteinDistance(normExpected, normInput);
    const maxLength = Math.max(normExpected.length, normInput.length);
    
    const similarity = ((maxLength - distance) / maxLength) * 100;
    return Math.round(similarity * 100) / 100;
    }

    export function isMatch(expected, input, threshold = 80, options = {}) {
    // On s'assure aussi que le seuil est bien un nombre valide
    if (typeof threshold !== 'number' || threshold < 0 || threshold > 100) {
        throw new RangeError(`[guess-rater] Erreur : Le 'threshold' (seuil) doit être un nombre entre 0 et 100. Reçu : ${threshold}`);
    }

    const score = getSimilarityScore(expected, input, options);
    return score >= threshold;
}

export { normalizeString, getLevenshteinDistance };