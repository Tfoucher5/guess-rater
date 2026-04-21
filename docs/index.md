---
layout: home

hero:
  name: Guess‑Rater
  text: Flexible fuzzy matching for JavaScript
  tagline: Match strings even with typos, order changes, or formatting differences
  actions:
    - theme: brand
      text: Get Started
      link: /guide/installation
    - theme: alt
      text: API Reference
      link: /api/rate

features:
  - title: 🧠 Tolerant matching
    details: Handles typos, reordered words, punctuation, noise and casing differences.

  - title: 🧬 Normalization pipeline
    details: Remove accents, stopwords or punctuation, and correct substrings before matching.

  - title: ⚖️ Hybrid scoring
    details: Combine Levenshtein, Jaro‑Winkler and TokenSet with configurable weights.

  - title: 🚀 Ranking & batch matching
    details: Find the closest match in a list or rank candidates automatically.

  - title: 🛠 Reusable matcher instances
    details: Preconfigure normalization and scoring once for repeated comparisons.
---

## Install

::: code-group

```bash
npm install guess-rater
```

:::

---

## Basic usage

::: code-group

```js
import { rate } from 'guess-rater'

rate('Peugeot 208', '208 Peugeot')
```

:::

---

## With normalization

::: code-group

```js
import { rate } from 'guess-rater'

rate('la-Peugeot-nwar', 'le peugeot-noire', {
  algorithm: 'hybrid',
  normalize: {
    removeWords: ['la', 'le'],
    replacements: { nwar: 'noire' },
    sortTokens: true
  }
})
```

:::

---

## Find best match

::: code-group

```js
import { findBestMatch } from 'guess-rater'

findBestMatch(
  'theo foucher',
  ['fouché', 'Foucher Theo', 'THEO-FOUCHER']
)
```

:::