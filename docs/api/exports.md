# API exports

This page lists **all public exports** of the Guess‑Rater package.

All functions are **named exports** and can be imported individually.

---

## Available exports

Guess‑Rater exports the following functions:

- `rate`
- `isMatch`
- `normalize`
- `rankCandidates`
- `findBestMatch`
- `createMatcher`

Example import:

```js
import {
  rate,
  isMatch,
  normalize,
  rankCandidates,
  findBestMatch,
  createMatcher
} from 'guess-rater'
```

---

## Aliasing imports

You can rename imports locally to better match your domain.

```js
import {
  rate as similarityScore,
  isMatch as fuzzyEquals
} from 'guess-rater'
```

This does not change the library behavior — it only affects your local code.

---

## Default export

Guess‑Rater does **not** provide a default export.

Incorrect:

```js
import rate from 'guess-rater'
```

Correct:

```js
import { rate } from 'guess-rater'
```

---

## ESM only

Guess‑Rater is ESM‑first.

You must use:
- `.mjs` files
- or `"type": "module"` in your `package.json`

---

## Low‑level algorithm helpers

Some internal helpers may also be exported for advanced usage:

- `getLevenshteinDistance`
- `getLevenshteinScore`
- `getJaroScore`
- `getJaroWinklerScore`
- `getTokenSortScore`
- `getTokenSetScore`

These are intended for:
- experimentation
- benchmarks
- custom matching strategies

Most users should rely on `rate()` instead.

---

## Recommended usage

For most use‑cases:

- use `rate()` for scoring
- use `isMatch()` for validation
- use `findBestMatch()` for single best result
- use `rankCandidates()` for full rankings
- use `createMatcher()` for repeated comparisons

---

## Key idea

The API is intentionally small.

Power comes from **composition**:
- normalization
- algorithms
- thresholds
- hybrid weights

Rather than from many specialized functions.