import { DEFAULT_NORMALIZE_OPTIONS } from '../core/defaults.js';
import { escapeRegExp } from '../core/helpers.js';

export function normalize(input, options = {}) {
    if (typeof input !== 'string') {
        return '';
    }

    const config = {
        ...DEFAULT_NORMALIZE_OPTIONS,
        ...options,
        replacements: {
        ...DEFAULT_NORMALIZE_OPTIONS.replacements,
        ...(options.replacements || {})
        },
        removeWords: Array.isArray(options.removeWords)
        ? [...options.removeWords]
        : [...DEFAULT_NORMALIZE_OPTIONS.removeWords]
    };

    let result = input;

    if (!config.caseSensitive) {
        result = result.toLowerCase();
    }

    if (config.removeAccents) {
        result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    for (const [from, to] of Object.entries(config.replacements)) {
        if (!from) continue;

        const source = config.caseSensitive ? from : from.toLowerCase();
        result = result.replace(new RegExp(escapeRegExp(source), 'g'), to);
    }

    if (config.removePunctuation) {
        const replacement = config.punctuationStrategy === 'remove' ? '' : ' ';
        result = result.replace(/[^\p{L}\p{N}\s]/gu, replacement);
    }

    if (config.collapseWhitespace) {
        result = result.replace(/\s+/g, ' ');
    }

    if (config.trim) {
        result = result.trim();
    }

    if (config.removeWords.length > 0) {
        const wordsToRemove = new Set(
        config.removeWords.map((word) =>
            config.caseSensitive ? String(word) : String(word).toLowerCase()
        )
        );

        result = result
        .split(/\s+/)
        .filter(Boolean)
        .filter((token) => !wordsToRemove.has(token))
        .join(' ');
    }

    if (config.sortTokens) {
        result = result
        .split(/\s+/)
        .filter(Boolean)
        .sort()
        .join(' ');
    }

    return result;
}

export const normalizeString = normalize;