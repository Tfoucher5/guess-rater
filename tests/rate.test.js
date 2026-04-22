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

test('spaceInsensitive boosts levenshtein when spaces are missing', () => {
    const score = rate('stairwaytoheaven', 'stairway to heaven', {
        algorithm: 'levenshtein',
        spaceInsensitive: true
    });
    assert.equal(score, 100);
});

test('spaceInsensitive boosts jaroWinkler when spaces are missing', () => {
    const score = rate('nomoresorrow', 'no more sorrow', {
        algorithm: 'jaroWinkler',
        spaceInsensitive: true
    });
    assert.equal(score, 100);
});

test('spaceInsensitive does not change tokenSet behavior', () => {
    const a = rate('iphone14pro', 'iphone 14 pro', { algorithm: 'tokenSet' });
    const b = rate('iphone14pro', 'iphone 14 pro', { algorithm: 'tokenSet', spaceInsensitive: true });
    assert.equal(a, b);
});

test('spaceInsensitive can improve hybrid for compact inputs', () => {
    const noSI = rate('stairwaytoheaven', 'stairway to heaven', { algorithm: 'hybrid' });
    const withSI = rate('stairwaytoheaven', 'stairway to heaven', { algorithm: 'hybrid', spaceInsensitive: true });
    assert.ok(withSI >= noSI);
});

test('spaceInsensitive is explainable for char-based algorithms', () => {
    const result = rate('nomoresorrow', 'no more sorrow', {
        algorithm: 'levenshtein',
        spaceInsensitive: true,
        explain: true
    });
    assert.equal(result.details.spaceInsensitive.levenshtein.enabled, true);
    assert.equal(result.details.spaceInsensitive.levenshtein.applied, true);
});

test('spaceInsensitive explain for hybrid contains both tokenSort and tokenSet keys', () => {
    const result = rate('stairwaytoheaven', 'stairway to heaven', {
        algorithm: 'hybrid',
        hybrid: { tokenSort: 0.5, tokenSet: 0.5 },
        spaceInsensitive: true,
        explain: true
    });
    assert.ok('tokenSort' in result.details.spaceInsensitive, 'tokenSort key manquant');
    assert.ok('tokenSet' in result.details.spaceInsensitive, 'tokenSet key manquant');
});
