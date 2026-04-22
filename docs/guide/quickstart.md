# Quickstart

```sh
npm install guess-rater
```

```js
import { rate, isMatch, findBestMatch, filterMatches, extract, createMatcher } from 'guess-rater'
```

> ESM only — requires `"type": "module"` in `package.json` or `.mjs` files.

---

## Score similarity

`rate()` returns a number from **0 to 100**. Normalization (accents, casing, punctuation) is applied automatically.

```js
rate('Molière', 'moliere')             // 100
rate('levenshtein', 'levenstein')      // ~88
rate('Saint-Nazaire', 'saint nazaire') // 100
```

→ Full reference: [rate()](/api/rate)

## Boolean match

`isMatch()` returns `true` if the score meets the threshold (default: 80).

```js
isMatch('Saint-Nazaire', 'saint nazaire') // true
isMatch('cat', 'dog', 90)                 // false
isMatch('hello', 'helo', { threshold: 70 }) // true
```

→ Full reference: [isMatch()](/api/isMatch)

## Find best match in a list

`findBestMatch()` returns `{ value, score, index }` for the closest candidate, or `null`.

```js
findBestMatch('peugeot', ['Renault Clio', 'Peugeot 208', 'BMW'])
// { value: 'Peugeot 208', score: 82, index: 1 }
```

→ Full reference: [findBestMatch()](/api/findBestMatch)

## Filter a list by threshold

`filterMatches()` returns only the candidates that score above the threshold.

```js
filterMatches('iPhone', ['iPhone 15', 'Samsung S24', 'iPhone 14 Pro'], { threshold: 70 })
// ['iPhone 15', 'iPhone 14 Pro']
```

→ Full reference: [filterMatches()](/api/filterMatches)

## Extract top N matches

`extract()` returns the top N candidates above the threshold.

```js
extract('apple', ['Apple Watch', 'Apple TV', 'Samsung TV', 'iPad'], { limit: 2, threshold: 60 })
// ['Apple Watch', 'Apple TV']
```

→ Full reference: [extract()](/api/extract)

## Reuse a configuration

`createMatcher()` preconfigures options once so you don't repeat them on every call.

```js
const matcher = createMatcher({
  algorithm: 'hybrid',
  normalize: { removeAccents: true, sortTokens: true }
})

matcher.rate('Jean-Paul', 'jean paul')
matcher.isMatch('Café de Flore', 'cafe de flore') // true
matcher.filterMatches('iphone', ['iPhone 15', 'Samsung', 'iPhone 14'])
```

→ Full reference: [createMatcher()](/api/createMatcher)

---

## What's next?

| I want to… | Go to |
|---|---|
| Pick the right algorithm | [Algorithms](/guide/algorithms) |
| Tune accents, casing, punctuation | [Normalization](/guide/normalization) |
| Set a good threshold | [Thresholds](/guide/thresholds) |
| Debug a surprising score | [Explain mode](/guide/explain-mode) |
| Compare rankCandidates / filterMatches / extract | [List helpers](/guide/ranking) |
