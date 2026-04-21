# createMatcher

`createMatcher()` allows you to create a **pre‑configured matcher instance**.

Instead of passing the same options on every call, you configure them once
and reuse the matcher for multiple comparisons.

---

## Why use createMatcher?

Use `createMatcher()` when:

- you apply the same normalization repeatedly
- you use the same algorithm and threshold
- you compare many strings in a loop
- you want cleaner, more readable code

It improves:
- performance
- readability
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

`createMatcher()` returns an object with several methods.

---

## matcher.rate()

Compute a similarity score using the preconfigured options.

```
const score = matcher.rate('John Smith', 'Smith John')
console.log(score)
```

If `explain: true` was configured, this returns an explain object.

---

## matcher.isMatch()

Check if two strings match using the configured threshold.

```js
const ok = matcher.isMatch('John Smith', 'Smith John')
console.log(ok)
```

This is equivalent to calling `rate()` and comparing with the threshold.

---

## matcher.findBestMatch()

Find the closest match in a list.

```js
const best = matcher.findBestMatch(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown']
)

console.log(best)
```

The returned object contains:
- `value`
- `score`
- `index`

---

## matcher.rankCandidates()

Rank all candidates by similarity score.

```js
const ranked = matcher.rankCandidates(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown']
)

console.log(ranked)
```

Candidates are sorted from best to worst.

---

## matcher.normalize()

Apply only the normalization pipeline.

```js
const normalized = matcher.normalize('THEO-FOUCHER')
console.log(normalized)
```

Useful for:
- debugging
- preprocessing
- data cleaning

---

## Common mistake

`createMatcher()` does **not** compare strings.

Incorrect usage:

```js
createMatcher('a', 'b', options)
```

Correct usage:

```js
const matcher = createMatcher(options)
matcher.rate('a', 'b')
```

---

## When not to use createMatcher

If you only perform one comparison, using `rate()` directly is simpler.

`createMatcher()` is most useful when the same configuration
is reused multiple times.

---

## Key idea

`createMatcher()` turns Guess‑Rater into a reusable matching engine.

Configure once.  
Match many times.