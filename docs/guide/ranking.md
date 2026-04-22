# List helpers

Guess‑Rater provides four functions for comparing one input against a list of candidates. They all use the same scoring engine — the difference is in what they return.

## Comparison at a glance

| Function | Returns all? | Filters by threshold? | Limits count? | Default return type |
|---|---|---|---|---|
| `rankCandidates()` | ✅ all, sorted | ❌ | ❌ | `{value, score, index}[]` |
| `findBestMatch()` | ❌ top 1 only | ❌ | ✅ (1) | `{value, score, index} \| null` |
| `filterMatches()` | ❌ above threshold | ✅ | ❌ | `string[]` |
| `extract()` | ❌ above threshold | ✅ | ✅ configurable | `string[]` |

---

## rankCandidates()

Returns **all candidates**, sorted from best to worst score. No filtering.

```js
import { rankCandidates } from 'guess-rater'

rankCandidates('moliere', ['Voltaire', 'Moliere', 'Victor Hugo'])
// [
//   { value: 'Moliere',    score: 100, index: 1 },
//   { value: 'Victor Hugo', score: 22,  index: 2 },
//   { value: 'Voltaire',   score: 17,  index: 0 }
// ]
```

Filter results yourself when needed:

```js
const ranked = rankCandidates('iphone', candidates, { algorithm: 'tokenSet' })
const good = ranked.filter(r => r.score >= 80)
```

→ [rankCandidates() reference](/api/rankCandidates)

---

## findBestMatch()

Returns the **single best candidate**, or `null` if the list is empty.

```js
import { findBestMatch } from 'guess-rater'

findBestMatch('peugeot 208', ['Renault Clio', 'Peugeot 308', '208 Peugeot'], {
  algorithm: 'tokenSort'
})
// { value: '208 Peugeot', score: 100, index: 2 }

findBestMatch('anything', []) // null
```

Equivalent to `rankCandidates()[0] ?? null` — use it when you only need the top result.

→ [findBestMatch() reference](/api/findBestMatch)

---

## filterMatches()

Returns **all candidates above the threshold**, without a count limit.

```js
import { filterMatches } from 'guess-rater'

filterMatches('iPhone', ['iPhone 15', 'Samsung S24', 'iPhone 14 Pro'], { threshold: 70 })
// ['iPhone 15', 'iPhone 14 Pro']
```

Use `{ return: 'entries' }` to get the full objects instead of strings:

```js
filterMatches('iPhone', candidates, { threshold: 70, return: 'entries' })
// [{ value: 'iPhone 15', score: 91, index: 0 }, { value: 'iPhone 14 Pro', score: 84, index: 2 }]
```

→ [filterMatches() reference](/api/filterMatches)

---

## extract()

Like `filterMatches()`, but with a **count limit**. Returns the top N candidates above the threshold.

```js
import { extract } from 'guess-rater'

extract('apple', ['Apple Watch', 'Apple TV', 'Samsung TV', 'iPad'], {
  limit: 2,
  threshold: 60
})
// ['Apple Watch', 'Apple TV']
```

Default: `limit: 5`, `threshold: 80`.

→ [extract() reference](/api/extract)

---

## explain with list helpers

All four functions support `explain: true`. Each result then includes the full explain payload:

```js
rankCandidates('hello', ['hello', 'helo'], { explain: true })
// [
//   { value: 'hello', score: 100, index: 0, match: true, normalizedLeft: '...', details: {...} },
//   { value: 'helo',  score: 88,  index: 1, match: true, ... }
// ]
```

→ [Explain mode guide](/guide/explain-mode)

---

## Which one to use?

```
Need all scores for ranking/sorting?           → rankCandidates()
Need only the single best result?              → findBestMatch()
Need all good matches, no limit?               → filterMatches()
Need top N good matches?                       → extract()
```
