import test from 'node:test';
import assert from 'node:assert/strict';

import { filterMatches } from '../src/api/filterMatches.js';

test('filterMatches returns string[] by default (values only)', () => {
    const res = filterMatches('hello', ['hello', 'world'], {
        algorithm: 'levenshtein',
        threshold: 100
    });

    assert.deepEqual(res, ['hello']);
});

test('filterMatches supports return:"entries"', () => {
    const res = filterMatches('hello', ['hello', 'world'], {
        algorithm: 'levenshtein',
        threshold: 100,
        return: 'entries'
    });

    assert.equal(Array.isArray(res), true);
    assert.equal(res.length, 1);
    assert.equal(res[0].value, 'hello');
    assert.equal(res[0].index, 0);
    assert.equal(res[0].score, 100);
});

test('filterMatches supports return:"entries" + explain:true', () => {
    const res = filterMatches('hello', ['hello', 'world'], {
        algorithm: 'levenshtein',
        threshold: 100,
        return: 'entries',
        explain: true
    });

    assert.equal(res.length, 1);
    assert.equal(res[0].value, 'hello');
    assert.equal(res[0].score, 100);

  // Explain payload fields (from RateExplainResult)
    assert.ok('match' in res[0]);
    assert.ok('normalizedLeft' in res[0]);
    assert.ok('normalizedRight' in res[0]);
    assert.ok('details' in res[0]);
    });

test('filterMatches ignores explain when return is values (default)', () => {
    const res = filterMatches('hello', ['hello', 'world'], {
        algorithm: 'levenshtein',
        threshold: 100,
        explain: true // should be ignored because return !== 'entries'
    });

    // Still string[]
    assert.deepEqual(res, ['hello']);
});