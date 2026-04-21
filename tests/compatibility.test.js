import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getSimilarityScore,
    isMatch
    } from '../src/index.js';

    test('getSimilarityScore reste compatible avec l’ancienne API', () => {
    const score = getSimilarityScore('Jean-Baptiste Poquelin', 'jean baptiste poquelin');
    assert.equal(score, 100);
    });

    test('isMatch reste compatible avec threshold en 3e argument', () => {
    const result = isMatch('Molière', 'Moliere', 85);
    assert.equal(result, true);
});