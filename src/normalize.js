/**
 * Nettoie et normalise une chaîne de caractères.
 * @param {string} str - La chaîne à normaliser.
 * @param {Object} [options={}] - Options de normalisation.
 * @param {boolean} [options.removePunctuation=true] - Si true, supprime la ponctuation ou la remplace.
 * @param {boolean} [options.replaceWithSpace=true] - Si true, remplace la ponctuation par des espaces au lieu de la supprimer.
 * @returns {string} La chaîne nettoyée.
 */
export function normalizeString(str, options = {}) {
    if (typeof str !== 'string') return '';

    const config = {
        removePunctuation: true,
        replaceWithSpace: true,
        ...options
    };

    let result = str
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (config.removePunctuation) {
        if (config.replaceWithSpace) {
        result = result.replace(/[^\w\s]/gi, ' ');
        } else {
        result = result.replace(/[^\w\s]/gi, '');
        }
    }

    return result.replace(/\s+/g, ' ').trim();
}