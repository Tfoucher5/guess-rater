# rate()

`rate()` is the core function of Guess‑Rater.

It computes a **similarity score between two strings**, optionally returning
detailed information about the comparison.

---

## Signature

```js
rate(leftInput, rightInput, options?)
```

---

## Parameters

### leftInput

Type: `string`

The first string to compare.

---

### rightInput

Type: `string`

The second string to compare.

---

### options

Type: `object` (optional)

Configuration object controlling:
- algorithm selection
- normalization behavior
- threshold
- explain mode
- hybrid weights
- space-insensitive scoring (optional)

---

## Basic usage

```js
import { rate } from 'guess-rater'

const score = rate('Hello World', 'hello world')
console.log(score)
```

Return value is a **number between 0 and 100**.

---

## Options

### algorithm

Select the matching algorithm.

Supported values:
- `levenshtein`
- `jaroWinkler`
- `tokenSort`
- `tokenSet`
- `hybrid`

```js
rate('John Smith', 'Smith John', {
  algorithm: 'tokenSort'
})
```

---

### normalize

Configure normalization (applied before scoring).

```js
rate('Mr. John-Smith', 'john smith', {
  normalize: {
    removeWords: ['mr'],
    removePunctuation: true,
    sortTokens: true
  }
})
```

---

### threshold

Threshold is used only to compute the `match` boolean in explain mode.

```js
const result = rate('John Smith', 'Smith John', {
  explain: true,
  threshold: 90
})

console.log(result.score)
console.log(result.match)
```

---

### explain

When `explain: true`, `rate()` returns an object instead of a number.

```js
const result = rate('John Smith', 'Smith John', {
  explain: true
})

console.log(result.score)
console.log(result.normalizedLeft)
console.log(result.normalizedRight)
```

---

### spaceInsensitive

If `spaceInsensitive: true`, Guess‑Rater performs an **additional comparison pass**
where **all whitespace is removed** from both normalized strings, then keeps the
best score between:

1. standard comparison (normal whitespace preserved)
2. compact comparison (all whitespace removed)

Important rules:
- This applies only to **character-based algorithms**:
  - `levenshtein`
  - `jaroWinkler`
- It does **not** affect token-based algorithms:
  - `tokenSort`
  - `tokenSet`

Example: missing spaces should score higher.

```js
rate('stairwaytoheaven', 'stairway to heaven', {
  algorithm: 'levenshtein',
  spaceInsensitive: true
})
```

Example: compact product queries.

```js
rate('iphone14pro', 'iphone 14 pro', {
  algorithm: 'jaroWinkler',
  spaceInsensitive: true
})
```

Explain mode also includes details when supported by the algorithm.

```js
const result = rate('nomoresorrow', 'no more sorrow', {
  algorithm: 'levenshtein',
  spaceInsensitive: true,
  explain: true
})

console.log(result.details.spaceInsensitive)
```

---

### hybrid

Hybrid combines multiple algorithms with weights.

Default weights:
- levenshtein: 0.4
- jaroWinkler: 0.3
- tokenSet: 0.3

```js
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

When `spaceInsensitive: true` is enabled:
- char-based sub-algorithms may benefit from it
- token-based sub-algorithms keep their normal behavior
- hybrid aggregation remains unchanged

---

## Explain mode return object

When `explain: true`, `rate()` returns:

```json
{
  score: number,
  match: boolean,
  threshold: number,
  algorithm: string,
  input: string,
  target: string,
  normalizedLeft: string,
  normalizedRight: string,
  details: object
}
```

---

## Common mistakes

### Comparing explain results directly

Incorrect:

```js
if (rate(a, b, { explain: true }) >= 80) { ... }
```

Correct:

```js
const result = rate(a, b, { explain: true })

if (result.score >= 80) { ... }
```

---

## Key idea

`rate()` gives you **the raw similarity score**.

Everything else in Guess‑Rater is built on top of it.
