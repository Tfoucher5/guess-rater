import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getLevenshteinDistance,
    getLevenshteinScore,
    getJaroScore,
    getJaroWinklerScore,
    getTokenSortScore,
    getTokenSetScore,
    rate,
    isMatch,
    createMatcher
} from '../src/index.js';

// --- getLevenshteinDistance ---

test('getLevenshteinDistance retourne 0 pour deux chaines identiques', () => {
    assert.equal(getLevenshteinDistance('chat', 'chat'), 0);
});

test('getLevenshteinDistance retourne la longueur quand une chaine est vide', () => {
    assert.equal(getLevenshteinDistance('', 'abc'), 3);
    assert.equal(getLevenshteinDistance('abc', ''), 3);
});

test('getLevenshteinDistance calcule correctement une substitution', () => {
    assert.equal(getLevenshteinDistance('chat', 'chap'), 1);
});

// --- getLevenshteinScore ---

test('getLevenshteinScore retourne 100 pour deux chaines vides', () => {
    assert.equal(getLevenshteinScore('', ''), 100);
});

test('getLevenshteinScore retourne 0 quand un seul cote est vide', () => {
    assert.equal(getLevenshteinScore('', 'hello'), 0);
    assert.equal(getLevenshteinScore('hello', ''), 0);
});

// --- getJaroScore ---

test('getJaroScore retourne 100 pour des chaines identiques', () => {
    assert.equal(getJaroScore('test', 'test'), 100);
});

test('getJaroScore retourne 0 quand une chaine est vide', () => {
    assert.equal(getJaroScore('', 'abc'), 0);
});

test('getJaroScore leve une TypeError si argument invalide', () => {
    assert.throws(() => getJaroScore(42, 'test'), TypeError);
});

// --- getJaroWinklerScore ---

test('getJaroWinklerScore retourne 100 pour des chaines identiques', () => {
    assert.equal(getJaroWinklerScore('hello', 'hello'), 100);
});

test('getJaroWinklerScore favorise les prefixes communs', () => {
    const withPrefix = getJaroWinklerScore('MARTHA', 'MARHTA');
    const jaro = getJaroScore('MARTHA', 'MARHTA');
    assert.ok(withPrefix >= jaro);
});

// --- getTokenSortScore ---

test('getTokenSortScore retourne 100 pour des tokens inverses', () => {
    assert.equal(getTokenSortScore('b a', 'a b'), 100);
});

test('getTokenSortScore fonctionne avec baseAlgorithm jaroWinkler', () => {
    const score = getTokenSortScore('b a', 'a b', { baseAlgorithm: 'jaroWinkler' });
    assert.equal(score, 100);
});

// --- getTokenSetScore ---

test('getTokenSetScore retourne 0 quand un seul cote est vide', () => {
    assert.equal(getTokenSetScore('', 'hello world'), 0);
    assert.equal(getTokenSetScore('hello world', ''), 0);
});

test('getTokenSetScore retourne 100 quand les deux sont vides', () => {
    assert.equal(getTokenSetScore('', ''), 100);
});

test('getTokenSetScore tolere les tokens communs dans un ordre different', () => {
    const score = getTokenSetScore('new york mets vs atlanta braves', 'atlanta braves vs new york mets');
    assert.equal(score, 100);
});

// --- mode hybrid ---

test('rate hybrid calcule un score pondere', () => {
    const score = rate('hello', 'hello', {
        algorithm: 'hybrid',
        hybrid: { levenshtein: 1, jaroWinkler: 1 }
    });
    assert.equal(score, 100);
});

test('rate hybrid leve une erreur si hybrid est sous-algorithme', () => {
    assert.throws(
        () => rate('a', 'b', { algorithm: 'hybrid', hybrid: { hybrid: 1 } }),
        /ne peut pas/
    );
});

test('rate hybrid retourne 0 si tous les poids sont a zero', () => {
    const score = rate('hello', 'world', {
        algorithm: 'hybrid',
        hybrid: { levenshtein: 0, jaroWinkler: 0, tokenSet: 0 }
    });
    assert.equal(score, 0);
});

// --- isMatch avec options ---

test('isMatch accepte un objet options', () => {
    const result = isMatch('hello', 'hello', { threshold: 90 });
    assert.equal(result, true);
});

test('isMatch retourne false si le score est sous le seuil', () => {
    const result = isMatch('abc', 'xyz', { threshold: 50 });
    assert.equal(result, false);
});

// --- createMatcher ---

test('createMatcher cree un matcher avec des options de base', () => {
    const matcher = createMatcher({ algorithm: 'jaroWinkler' });
    const score = matcher.rate('hello', 'hello');
    assert.equal(score, 100);
});

test('createMatcher.isMatch utilise les options de base', () => {
    const matcher = createMatcher({ threshold: 90 });
    assert.equal(matcher.isMatch('hello', 'hello'), true);
    assert.equal(matcher.isMatch('abc', 'xyz'), false);
});

test('createMatcher.rankCandidates trie correctement', () => {
    const matcher = createMatcher();
    const ranked = matcher.rankCandidates('chat', ['chien', 'chat', 'vache']);
    assert.equal(ranked[0].value, 'chat');
});

test('createMatcher.findBestMatch retourne null si aucun candidat', () => {
    const matcher = createMatcher();
    const best = matcher.findBestMatch('test', []);
    assert.equal(best, null);
});

// --- cas d'erreur ---

test('rate leve une TypeError si leftInput est invalide', () => {
    assert.throws(() => rate(42, 'hello'), TypeError);
});

test('rate leve une Error pour un algorithme inconnu', () => {
    assert.throws(
        () => rate('a', 'b', { algorithm: 'unknown' }),
        /Algorithme non support/
    );
});
