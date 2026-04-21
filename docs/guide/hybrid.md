# Hybrid scoring

The `hybrid` algorithm is the most powerful option in Guess‑Rater.

Instead of relying on a single strategy, it combines multiple algorithms
to produce a more robust similarity score.

---

## What is hybrid?

Hybrid computes several scores using different algorithms and combines them
using **weights**.

By default, it combines:

- Levenshtein
- Jaro‑Winkler
- TokenSet

Each algorithm contributes a portion of the final score.

---

## Default weights

The default hybrid configuration is:

```
levenshtein: 0.4
jaroWinkler: 0.3
tokenSet: 0.3
```

The final score is a weighted average of all sub‑scores.

---

## Basic hybrid usage

```js
import { rate } from 'guess-rater'

const score = rate('John Smith', 'Smith John', {
  algorithm: 'hybrid'
})

console.log(score)
```

Hybrid works well even without tuning and is the recommended default
for unknown or mixed use‑cases.

---

## Custom hybrid weights

You can customize the contribution of each algorithm.

```js
import { rate } from 'guess-rater'

const result = rate('Apple iPhone 13 Pro', 'iPhone 13', {
  algorithm: 'hybrid',
  explain: true,
  hybrid: {
    levenshtein: 0.2,
    jaroWinkler: 0.2,
    tokenSet: 0.6
  }
})

console.log(result.score)
console.log(result.details.hybrid)
```

This is useful when one algorithm is too strict or too tolerant
for your specific domain.

---

## Interpreting hybrid results

With `explain: true`, the hybrid breakdown shows:

- individual algorithm scores
- applied weights
- how each algorithm influenced the final score

This helps you understand *why* a string matches or does not match.

---

## When to use hybrid

Hybrid is recommended when:

- you do not know the structure of your input
- strings may contain noise or extra words
- word order is inconsistent
- both strictness and tolerance are needed

Typical use‑cases:

- person name matching
- product title matching
- fuzzy search
- data reconciliation
- user input validation

---

## When not to use hybrid

Hybrid may be unnecessary when:

- you only care about character‑level typos → use `levenshtein`
- you only match short names → use `jaroWinkler`
- word order never matters → use `tokenSort`

Hybrid trades simplicity for robustness.

---

## Weight tuning guidelines

General tips:

- increase `tokenSet` weight when extra words are common
- increase `jaroWinkler` weight for names
- increase `levenshtein` weight for strict typo detection

Weights do not need to sum to 1, but doing so makes interpretation easier.

---

## Key idea

Hybrid is not magic.

It is a **tool to balance multiple perspectives on similarity**.

The best configuration always depends on your data and your tolerance
for false positives vs false negatives.