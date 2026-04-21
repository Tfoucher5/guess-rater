import { roundScore, clamp } from '../core/helpers.js';
import { validateStringInput } from '../core/validate.js';

export function getLevenshteinDistance(a, b) {
    validateStringInput(a, 'a');
    validateStringInput(b, 'b');

    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    let left = a;
    let right = b;

    if (left.length > right.length) {
        [left, right] = [right, left];
    }

    let previousRow = Array.from({ length: left.length + 1 }, (_, i) => i);
    let currentRow = new Array(left.length + 1);

    for (let i = 1; i <= right.length; i += 1) {
        currentRow[0] = i;
        const rightChar = right.charAt(i - 1);

        for (let j = 1; j <= left.length; j += 1) {
            const cost = left.charAt(j - 1) === rightChar ? 0 : 1;

            currentRow[j] = Math.min(
                currentRow[j - 1] + 1,
                previousRow[j] + 1,
                previousRow[j - 1] + cost
            );
        }

        [previousRow, currentRow] = [currentRow, previousRow];
    }

    return previousRow[left.length];
}

export function getLevenshteinScore(a, b) {
    const maxLen = Math.max(a.length, b.length);

    if (maxLen === 0) {
        return 100;
    }

    const distance = getLevenshteinDistance(a, b);
    const score = (1 - distance / maxLen) * 100;

    return roundScore(clamp(score, 0, 100));
}
