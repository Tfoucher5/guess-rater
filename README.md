# Guess‑Rater

[![npm version](https://img.shields.io/npm/v/guess-rater?logo=npm)](https://www.npmjs.com/package/guess-rater)
[![npm downloads](https://img.shields.io/npm/dm/guess-rater?logo=npm)](https://www.npmjs.com/package/guess-rater)
[![CI](https://img.shields.io/github/actions/workflow/status/Tfoucher5/guess-rater/ci.yml?branch=master&label=CI)](https://github.com/Tfoucher5/guess-rater/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![module: ESM](https://img.shields.io/badge/module-ESM-1f6feb)](./package.json)

Fuzzy string matching for JavaScript. Handles typos, word order, accents, and punctuation — with five algorithms, a normalization pipeline, and full TypeScript support.

## Install

```sh
npm install guess-rater
```

ESM only. Requires `"type": "module"` in your `package.json`.

## Usage

```js
import { rate, isMatch, findBestMatch, filterMatches, extract, createMatcher } from 'guess-rater'

rate('Molière', 'moliere')              // 100
rate('levenshtein', 'levenstein')       // ~88
rate('John Smith', 'Smith John', { algorithm: 'tokenSort' }) // 100

isMatch('Saint-Nazaire', 'saint nazaire', 85) // true

findBestMatch('peugeot', ['Renault Clio', 'Peugeot 208', 'BMW'])
// { value: 'Peugeot 208', score: 82, index: 1 }

filterMatches('iPhone', ['iPhone 15', 'Samsung S24', 'iPhone 14'], { threshold: 70 })
// ['iPhone 15', 'iPhone 14']

extract('apple', ['Apple Watch', 'Apple TV', 'Samsung TV'], { limit: 2 })
// ['Apple Watch', 'Apple TV']
```

Reuse a configuration with `createMatcher()`:

```js
const matcher = createMatcher({
  algorithm: 'hybrid',
  normalize: { removeAccents: true, sortTokens: true }
})

matcher.rate('Jean-Paul', 'jean paul')       // 100
matcher.isMatch('Café de Paris', 'cafe de paris') // true
matcher.filterMatches('iphone', catalog)
```

## Documentation

**[tfoucher5.github.io/guess-rater](https://tfoucher5.github.io/guess-rater/)**

- [Quickstart](https://tfoucher5.github.io/guess-rater/guide/quickstart)
- [Algorithms](https://tfoucher5.github.io/guess-rater/guide/algorithms) — levenshtein, jaroWinkler, tokenSort, tokenSet, hybrid
- [Normalization](https://tfoucher5.github.io/guess-rater/guide/normalization) — accents, casing, stop words, replacements
- [List helpers](https://tfoucher5.github.io/guess-rater/guide/ranking) — rankCandidates, findBestMatch, filterMatches, extract
- [API reference](https://tfoucher5.github.io/guess-rater/api/exports)

## License

MIT
