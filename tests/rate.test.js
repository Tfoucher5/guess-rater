import test from 'node:test';
import assert from 'node:assert/strict';

import {
    rate,
    rankCandidates,
    findBestMatch
    } from '../src/index.js';

    test('rate retourne 100 sur deux chaînes identiques après normalisation', () => {
    const score = rate('Molière', 'Moliere');
    assert.equal(score, 100);
    });

    test('rate avec tokenSort gère les mots inversés', () => {
    const score = rate('peugeot 208 active', '208 peugeot active', {
        algorithm: 'tokenSort'
    });

    assert.equal(score, 100);
    });

    test('rate avec explain retourne un objet détaillé', () => {
    const result = rate('Saint-Nazaire', 'saint nazaire', {
        explain: true
    });

    assert.equal(typeof result, 'object');
    assert.equal(result.score, 100);
    assert.equal(result.match, true);
    });

    test('rankCandidates trie du meilleur au moins bon', () => {
    const ranked = rankCandidates('moliere', [
        'Voltaire',
        'Moliere',
        'Victor Hugo'
    ]);

    assert.equal(ranked[0].value, 'Moliere');
    });

    test('findBestMatch retourne la meilleure correspondance', () => {
    const best = findBestMatch('peugeot 208', [
        'Renault Clio',
        'Peugeot 308',
        '208 Peugeot'
    ], {
        algorithm: 'tokenSort'
    });

    assert.equal(best.value, '208 Peugeot');
});