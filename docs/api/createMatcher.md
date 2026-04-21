# createMatcher()

`createMatcher()` creates a **preconfigured matcher instance**.

Instead of passing the same options to every call, you configure them once
and reuse the matcher for multiple comparisons.

---

## Signature

```js
createMatcher(baseOptions?)
```

---

## Purpose

`createMatcher()` is useful when:

- you perform many comparisons
- you reuse the same normalization rules
- you reuse the same algorithm and threshold
- you want cleaner and more readable code

It improves:
- performance
- consistency
- developer experience

---

## Creating a matcher

```js
import { createMatcher } from 'guess-rater'

const matcher = createMatcher({
  algorithm: 'hybrid',
  threshold: 85,
  normalize: {
    removeAccents: true,
    removePunctuation: true,
    sortTokens: true
  }
})
```

`createMatcher()` returns an object exposing several methods.

---

## matcher.rate()

Compute a similarity score using the predefined configuration.

```js
const score = matcher.rate('John Smith', 'Smith John')
console.log(score)
```

Return value is the same as `rate()`:
- number by default
- detailed object if `explain: true` was configured

---

## matcher.isMatch()

Check whether two strings match using the configured threshold.

```js
const ok = matcher.isMatch('John Smith', 'Smith John')
console.log(ok)
```

Always returns a boolean.

---

## matcher.findBestMatch()

Find the closest match in a list of candidates.

```js
const best = matcher.findBestMatch(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown']
)

console.log(best)
```

Returned object contains:
- `value`
- `score`
- `index`

---

## matcher.rankCandidates()

Rank all candidates from best to worst.

```js
const ranked = matcher.rankCandidates(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown']
)

console.log(ranked)
```

Each item includes:
- `value`
- `score`
- `index`
(and explain details if enabled)

---

## matcher.normalize()

Apply only the normalization pipeline.

```js
const normalized = matcher.normalize('THE-QUICK-BROWN-FOX')
console.log(normalized)
```

Useful for:
- debugging normalization
- preprocessing data
- inspecting transformations

---

## Common mistake

`createMatcher()` does **not** compare strings directly.

Incorrect usage:

```js
createMatcher('a', 'b', options)
```

Correct usage:

```js
const matcher = createMatcher(options)
matcher.rate('a', 'b')
```

Passing strings directly will lead to unexpected behavior.

---

## When not to use createMatcher()

If you only perform one or two comparisons,
calling `rate()` directly is simpler.

`createMatcher()` is most useful when configuration reuse matters.

---

## Relationship with rate()

Internally, all matcher methods delegate to `rate()`.

`createMatcher()` is a convenience layer,
not a different matching engine.

---

## Key idea

`createMatcher()` turns Guess‑Rater into a reusable matching service.

Configure once.  
Match consistently.
