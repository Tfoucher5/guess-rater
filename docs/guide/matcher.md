# createMatcher

`createMatcher()` preconfigures a set of options once and returns a matcher object with all the same methods as the top-level API.

Use it when you repeat the same configuration across multiple calls.

```js
import { createMatcher } from 'guess-rater'

const matcher = createMatcher({
  algorithm: 'hybrid',
  normalize: { removeAccents: true, sortTokens: true },
  threshold: 85
})
```

---

## Methods

All methods accept the same options as their top-level counterparts. Options are **merged** with the base configuration — call-level options take precedence.

### matcher.rate(left, right, options?)

Returns a score (or explain object).

```js
matcher.rate('Jean-Paul', 'jean paul')        // 100
matcher.rate('Jean-Paul', 'jean paul', { explain: true })
```

### matcher.isMatch(left, right, thresholdOrOptions?)

```js
matcher.isMatch('Café de Paris', 'cafe de paris') // true
matcher.isMatch('hello', 'world', 95)              // false
```

### matcher.findBestMatch(input, candidates, options?)

```js
matcher.findBestMatch('peugeot', ['Renault', 'Peugeot 208', 'BMW'])
// { value: 'Peugeot 208', score: ..., index: 1 }
```

### matcher.rankCandidates(input, candidates, options?)

```js
matcher.rankCandidates('iphone', ['iPhone 15', 'Samsung S24', 'iPhone 14'])
// [{ value: 'iPhone 15', score: ..., index: 0 }, ...]
```

### matcher.filterMatches(input, candidates, options?)

```js
matcher.filterMatches('iphone', ['iPhone 15', 'Samsung S24', 'iPhone 14'])
// ['iPhone 15', 'iPhone 14']
```

### matcher.extract(input, candidates, options?)

```js
matcher.extract('apple', ['Apple Watch', 'Apple TV', 'Samsung', 'iPad'], { limit: 2 })
// ['Apple Watch', 'Apple TV']
```

### matcher.normalize(input, options?)

```js
matcher.normalize('Héloïse Saint-Exupéry')
// 'heloise saint exupery'  (uses base normalization options)
```

---

## Overriding options per call

Options passed at call time are merged on top of the base config:

```js
const matcher = createMatcher({ algorithm: 'levenshtein', threshold: 80 })

// Override algorithm for this call only:
matcher.rate('Smith John', 'John Smith', { algorithm: 'tokenSort' })
```

---

## Common mistake

`createMatcher()` takes **options**, not strings:

```js
// Wrong
const m = createMatcher('hello', 'world', { algorithm: 'hybrid' })

// Correct
const m = createMatcher({ algorithm: 'hybrid' })
m.rate('hello', 'world')
```

---

## When to use createMatcher

- Comparing many strings with the same configuration
- Building a reusable service or class method around Guess‑Rater
- Ensuring consistency across a module (same normalization everywhere)

**When not to use it:** one-off comparisons — just call `rate()` directly.

→ [createMatcher() API reference](/api/createMatcher)
