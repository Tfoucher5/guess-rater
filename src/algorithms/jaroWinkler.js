import { clamp, roundScore } from '../core/helpers.js';
import { validateStringInput } from '../core/validate.js';

function getJaroValue(a, b) {
    if (a === b) return 1;

    const lenA = a.length;
    const lenB = b.length;

    if (lenA === 0 || lenB === 0) {
        return 0;
    }

    const matchDistance = Math.max(Math.floor(Math.max(lenA, lenB) / 2) - 1, 0);

    const aMatches = new Array(lenA).fill(false);
    const bMatches = new Array(lenB).fill(false);

    let matches = 0;

    for (let i = 0; i < lenA; i += 1) {
        const start = Math.max(0, i - matchDistance);
        const end = Math.min(i + matchDistance + 1, lenB);

        for (let j = start; j < end; j += 1) {
        if (bMatches[j]) continue;
        if (a[i] !== b[j]) continue;

        aMatches[i] = true;
        bMatches[j] = true;
        matches += 1;
        break;
        }
    }

    if (matches === 0) {
        return 0;
    }

    let transpositions = 0;
    let k = 0;

    for (let i = 0; i < lenA; i += 1) {
        if (!aMatches[i]) continue;

        while (!bMatches[k]) {
        k += 1;
        }

        if (a[i] !== b[k]) {
        transpositions += 1;
        }

        k += 1;
    }

    return (
        (matches / lenA +
        matches / lenB +
        (matches - transpositions / 2) / matches) / 3
    );
    }

    export function getJaroScore(a, b) {
    validateStringInput(a, 'a');
    validateStringInput(b, 'b');

    return roundScore(getJaroValue(a, b) * 100);
    }

    export function getJaroWinklerScore(a, b, options = {}) {
    validateStringInput(a, 'a');
    validateStringInput(b, 'b');

    const {
        prefixScale = 0.1,
        maxPrefixLength = 4
    } = options;

    const jaro = getJaroValue(a, b);

    let prefixLength = 0;
    const maxPrefix = Math.min(maxPrefixLength, a.length, b.length);

    while (prefixLength < maxPrefix && a[prefixLength] === b[prefixLength]) {
        prefixLength += 1;
    }

  const winkler = jaro + prefixLength * prefixScale * (1 - jaro);

  return roundScore(clamp(winkler * 100, 0, 100));
}
