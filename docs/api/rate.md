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

---

## Basic usage

```js
import { rate } from 'guess-rater'

const score = rate('John Smith', 'Smith John')
console.log(score)
```

Return value is a **number between 0 and 100**.

---

## Using an algorithm

```js
rate('John Smith', 'Smith John', {
  algorithm: 'jaroWinkler'
})
```

Supported algorithms:
- `levenshtein`
- `jaroWinkler`
- `tokenSort`
- `tokenSet`
- `hybrid`

---

## Using normalization

```js
rate('Mr. John-Smith', 'john smith', {
  normalize: {
    removeWords: ['mr'],
    removePunctuation: true,
    sortTokens: true
  }
})
```

Normalization is applied **before** scoring.

---

## Using explain mode

```js
const result = rate('John Smith', 'Smith John', {
  explain: true
})

console.log(result)
```

When `explain: true`, the return value is an **object**, not a number.

---

## Explain mode return object

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

## Using threshold with rate

```js
const result = rate('John Smith', 'Smith John', {
  explain: true,
  threshold: 90
})

console.log(result.score)
console.log(result.match)
```

Threshold controls the `match` boolean only.
It does not change the score itself.

---

## Hybrid scoring with rate

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

## When to use rate()

Use `rate()` when:
- you need a numeric similarity score
- you want full control over options
- you want to debug or inspect behavior
- you are building higher‑level logic

For boolean checks, consider `isMatch()` instead.

---

## Key idea

`rate()` gives you **the raw similarity score**.

Everything else in Guess‑Rater is built on top of it.