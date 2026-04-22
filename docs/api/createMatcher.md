# createMatcher()

Creates a preconfigured matcher instance. Use it to avoid repeating the same options on every call.

## Signature

```ts
createMatcher(baseOptions?: RateOptions): Matcher
```

## Usage

```js
import { createMatcher } from 'guess-rater'

const matcher = createMatcher({
  algorithm: 'hybrid',
  normalize: { removeAccents: true, sortTokens: true },
  threshold: 85
})

matcher.rate('Jean-Paul', 'jean paul')           // 100
matcher.isMatch('Café de Paris', 'cafe de paris') // true
```

## Methods

All methods accept the same options as their top-level counterparts. Call-level options are **merged** on top of the base config.

| Method | Equivalent to |
|---|---|
| `matcher.rate(left, right, options?)` | `rate(left, right, merge(base, options))` |
| `matcher.isMatch(left, right, thresholdOrOptions?)` | `isMatch(...)` |
| `matcher.findBestMatch(input, candidates, options?)` | `findBestMatch(...)` |
| `matcher.rankCandidates(input, candidates, options?)` | `rankCandidates(...)` |
| `matcher.filterMatches(input, candidates, options?)` | `filterMatches(...)` |
| `matcher.extract(input, candidates, options?)` | `extract(...)` |
| `matcher.normalize(input, options?)` | `normalize(...)` |

## Examples

**Override algorithm per call:**
```js
const matcher = createMatcher({ algorithm: 'levenshtein', threshold: 80 })

matcher.rate('Smith John', 'John Smith', { algorithm: 'tokenSort' }) // override for this call
```

**Use for a dataset search:**
```js
const productMatcher = createMatcher({
  algorithm: 'tokenSet',
  normalize: { removePunctuation: true, removeAccents: true }
})

const results = productMatcher.filterMatches(query, productCatalog, { threshold: 75 })
```

## Common mistake

`createMatcher()` takes an options object, not strings:

```js
// Wrong
const m = createMatcher('hello', 'world', { algorithm: 'hybrid' })

// Correct
const m = createMatcher({ algorithm: 'hybrid' })
m.rate('hello', 'world')
```

## See also

- [createMatcher guide](/guide/matcher) — usage patterns and when to use it
- [rate()](/api/rate) — the underlying scoring function
