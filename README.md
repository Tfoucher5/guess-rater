# 🎯 Guess-Rater

[![npm version](https://img.shields.io/npm/v/guess-rater?logo=npm)](https://www.npmjs.com/package/guess-rater)
[![npm downloads](https://img.shields.io/npm/dm/guess-rater?logo=npm)](https://www.npmjs.com/package/guess-rater)
[![CI](https://img.shields.io/github/actions/workflow/status/Tfoucher5/guess-rater/ci.yml?branch=master&label=CI)](https://github.com/Tfoucher5/guess-rater/actions/workflows/ci.yml)
[![publish](https://img.shields.io/github/actions/workflow/status/Tfoucher5/guess-rater/publish.yml?branch=master&label=publish)](https://github.com/Tfoucher5/guess-rater/actions/workflows/publish.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![module: ESM](https://img.shields.io/badge/module-ESM-1f6feb)](./package.json)
[![GitHub stars](https://img.shields.io/github/stars/Tfoucher5/guess-rater?style=social)](https://github.com/Tfoucher5/guess-rater)
[![issues](https://img.shields.io/github/issues/Tfoucher5/guess-rater)](https://github.com/Tfoucher5/guess-rater/issues)

`guess-rater` is a lightweight, dependency‑free and highly configurable
string similarity engine for JavaScript.

It can be used to:

- normalize strings
- compute similarity scores
- validate matches with thresholds
- rank multiple candidates
- find the best match in a list
- combine multiple matching strategies

📘 **Full documentation:**  
https://tfoucher5.github.io/guess-rater/

---

## ✨ Why Guess‑Rater?

- **Lightweight** — zero external dependencies
- **Flexible** — multiple algorithms depending on your use‑case
- **Practical** — simple API for common cases, powerful options for advanced ones
- **Versatile** — fuzzy search, quizzes, form validation, deduplication, product matching
- **Backward compatible** — legacy APIs like `getSimilarityScore()` are still supported

---

## 📦 Installation

```bash
npm install guess-rater
```

---

## 🚀 Quick start

```js
import { rate, isMatch } from 'guess-rater';

const score = rate('Molière', 'Moliere');
console.log(score); // 100

console.log(isMatch('Saint-Nazaire', 'saint nazaire', 85)); // true
```

---

## 📚 API overview

### rate(a, b, options?)

Compute a similarity score between two strings.

```js
import { rate } from 'guess-rater';

const score = rate('Molière', 'Moliere');
console.log(score); // 100
```

---

### getSimilarityScore(a, b, options?)

Backward‑compatible alias of `rate()`.

---

### isMatch(a, b, thresholdOrOptions?)

Return a boolean indicating whether two strings match.

```js
import { isMatch } from 'guess-rater';

console.log(isMatch('Molière', 'Moliere', 85)); // true
```

---

### rankCandidates(input, candidates, options?)

Rank multiple candidates from best to worst.

```js
import { rankCandidates } from 'guess-rater';

const results = rankCandidates(
  'peugeot 208',
  ['Peugeot 308', '208 Peugeot', 'Renault Clio'],
  { algorithm: 'tokenSort' }
);

console.log(results);
```

---

### findBestMatch(input, candidates, options?)

Return only the best matching candidate.

```js
import { findBestMatch } from 'guess-rater';

const best = findBestMatch(
  'moliere',
  ['Voltaire', 'Moliere', 'Victor Hugo']
);

console.log(best);
```

---

### createMatcher(baseOptions)

Create a reusable, preconfigured matcher instance.

```js
import { createMatcher } from 'guess-rater';

const matcher = createMatcher({
  algorithm: 'jaroWinkler',
  threshold: 88,
  normalize: {
    removeAccents: true,
    removePunctuation: true
  }
});

console.log(matcher.rate('Molière', 'Moliere'));
console.log(matcher.isMatch('Saint-Nazaire', 'st nazaire'));
```

---

## 🧹 Normalization

```js
import { normalize } from 'guess-rater';

const result = normalize('Jean-Baptiste Poquelin');
console.log(result); // "jean baptiste poquelin"
```

Supported normalization options include:

- case sensitivity
- accent removal
- punctuation handling
- whitespace normalization
- word removal
- token sorting
- custom replacements

---

## 🔍 Algorithms

Available algorithms:

- **levenshtein** — character‑level distance
- **jaroWinkler** — great for names
- **tokenSort** — ignores word order
- **tokenSet** — handles extra or missing words
- **hybrid** — weighted combination of multiple strategies

---

## ⚙️ Advanced example (hybrid + explain)

```js
import { rate } from 'guess-rater';

const result = rate('peugeot 208 active', '208 peugeot active', {
  algorithm: 'hybrid',
  explain: true,
  hybrid: {
    levenshtein: 0.2,
    jaroWinkler: 0.2,
    tokenSet: 0.6
  }
});

console.log(result);
```

---

## 💡 Use cases

Guess‑Rater is commonly used for:

- fuzzy search
- form validation
- quiz answer validation
- person name matching
- product title matching
- data cleaning and deduplication
- CSV imports
- bots and assistants

---

## 🤝 Contributing

Guess‑Rater is open‑source.

You can:
- fork the repository
- propose improvements via pull requests
- suggest ideas or report issues

All pull requests are reviewed carefully before being accepted.

---

## 📄 License

MIT