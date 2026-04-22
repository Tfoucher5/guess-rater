import test from 'node:test';
import assert from 'node:assert/strict';

import { extract } from '../src/api/extract.js';

test('extract returns string[] by default (values only)', () => {
    const res = extract('hello', ['hello', 'world'], {
        algorithm: 'levenshtein',
        threshold: 100
    });

    assert.deepEqual(res, ['hello']);
});

test('extract respects limit', () => {
    const res = extract('a', ['a', 'aa', 'aaa'], {
        algorithm: 'levenshtein',
        threshold: 0,
        limit: 2
    });

    assert.equal(res.length, 2);
});

test('extract supports return:"entries"', () => {
    const res = extract('hello', ['hello', 'world'], {
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

test('extract supports return:"entries" + explain:true', () => {
    const res = extract('hello', ['hello', 'world'], {
        algorithm: 'levenshtein',
        threshold: 100,
        return: 'entries',
        explain: true
    });

    assert.equal(res.length, 1);
    assert.equal(res[0].value, 'hello');
    assert.equal(res[0].score, 100);

    assert.ok('match' in res[0]);
    assert.ok('normalizedLeft' in res[0]);
    assert.ok('normalizedRight' in res[0]);
    assert.ok('details' in res[0]);
});