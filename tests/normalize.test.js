import test from 'node:test';
import assert from 'node:assert/strict';

import { normalize } from '../src/index.js';

test('normalize supprime accents, ponctuation et casse par défaut', () => {
    const result = normalize('Jean-Baptiste Poquelin');
    assert.equal(result, 'jean baptiste poquelin');
});

test('normalize supporte les remplacements', () => {
    const result = normalize('R&D', {
        replacements: {
        '&': ' and '
        }
    });

    assert.equal(result, 'r and d');
});

test('normalize supporte removeWords', () => {
    const result = normalize('la ville de saint nazaire', {
        removeWords: ['la', 'de']
    });

    assert.equal(result, 'ville saint nazaire');
});

test('normalize supporte sortTokens', () => {
    const result = normalize('208 peugeot active', {
        sortTokens: true
    });

    assert.equal(result, '208 active peugeot');
});

test('normalize supporte punctuationStrategy: remove', () => {
    const result = normalize('Jean-Baptiste', {
        punctuationStrategy: 'remove'
    });

    assert.equal(result, 'jeanbaptiste');
});

test('normalize retourne une chaîne vide si l’entrée n’est pas une string', () => {
    const result = normalize(null);
    assert.equal(result, '');
});