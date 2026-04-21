# Quickstart

This page shows the most common ways to use Guess‑Rater.

---

## Compute a similarity score

Use `rate()` to compute a similarity score between two strings.

```js
import { rate } from 'guess-rater'

const score = rate('Molière', 'Moliere')
console.log(score)
```

The result is a number between **0** and **100**.

---

## Boolean match check

Use `isMatch()` when you only need a yes / no answer.

```js
import { isMatch } from 'guess-rater'

const ok = isMatch('Saint-Nazaire', 'saint nazaire', 85)
console.log(ok)
```

Internally, this compares the score to a threshold.

---

## Find the best match in a list

Use `findBestMatch()` to compare one input against a list of candidates.

```js
import { findBestMatch } from 'guess-rater'

const best = findBestMatch(
  'theo foucher',
  ['fouché', 'Foucher Theo', 'THEO-FOUCHER']
)

console.log(best)
```

The returned object contains:

- `value` — the best matching string
- `score` — similarity score
- `index` — index of the candidate in the original array

---

## Using normalization

Normalization makes matching more tolerant to formatting differences.

```js
import { rate } from 'guess-rater'

const result = rate('la-Peugeot-nwar', 'le peugeot-noire', {
  algorithm: 'hybrid',
  normalize: {
    removeWords: ['la', 'le'],
    replacements: { nwar: 'noire' },
    sortTokens: true
  }
})

console.log(result)
```

---

## Which function should I use?

- Use `rate()` if you need a numeric score
- Use `isMatch()` for validation or boolean checks
- Use `findBestMatch()` when matching against a list
- Use `rankCandidates()` when you need a full ranking
``