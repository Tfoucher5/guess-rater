# Product title matching

This recipe shows how to match **product titles** in a tolerant way.

Product titles often vary because of:
- word order
- extra or missing words
- punctuation
- casing
- partial queries

Guess‑Rater handles these variations well when configured properly.

---

## Basic example

```js
import { rate } from 'guess-rater'

const score = rate('Apple iPhone 13 Pro', 'iPhone 13')
console.log(score)
```

Without normalization, extra words may reduce the score.

---

## Recommended configuration

For product titles, use:

- punctuation removal
- token sorting
- token‑aware algorithms
- hybrid or tokenSet

```js
import { rate } from 'guess-rater'

const score = rate('Apple iPhone 13 Pro', 'iPhone 13', {
  algorithm: 'hybrid',
  normalize: {
    removePunctuation: true,
    sortTokens: true
  }
})

console.log(score)
```

This treats both inputs as describing the same product.

---

## Handling extra words

Product titles often include marketing terms or variants.

```js
rate('Samsung Galaxy S21 Ultra 5G', 'Galaxy S21', {
  algorithm: 'tokenSet',
  normalize: {
    removePunctuation: true,
    sortTokens: true
  }
})
```

`tokenSet` handles extra words better than strict algorithms.

---

## Handling reordered words

```js
rate('Wireless Mouse Logitech', 'Logitech Wireless Mouse', {
  algorithm: 'tokenSort',
  normalize: {
    removePunctuation: true,
    sortTokens: true
  }
})
```

Word order becomes irrelevant.

---

## Finding the best product match

```js
import { findBestMatch } from 'guess-rater'

const best = findBestMatch(
  'iphone 13',
  [
    'Apple iPhone 12',
    'Apple iPhone 13 Pro',
    'Samsung Galaxy S21'
  ],
  {
    algorithm: 'hybrid',
    normalize: {
      removePunctuation: true,
      sortTokens: true
    }
  }
)

console.log(best)
```

---

## Threshold recommendation

For product titles:

- start around `75–85`
- lower thresholds allow partial matches
- higher thresholds reduce false positives

---

## Notes

- Token‑based algorithms are usually more reliable than character‑only ones
- Hybrid works well when product data is inconsistent
- Normalization matters more than the algorithm itself

---

## Key idea

For product titles:

> Compare shared information, not exact wording.

Extra words should not prevent a match.