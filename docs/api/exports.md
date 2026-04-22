# API exports

All exports are **named** — no default export. ESM only.

```js
import { rate, isMatch, findBestMatch, filterMatches, extract, createMatcher, normalize } from 'guess-rater'
```

---

## Main functions

| Function | Description |
|---|---|
| [`rate()`](/api/rate) | Similarity score between two strings (0–100) |
| [`isMatch()`](/api/isMatch) | Boolean — score meets threshold? |
| [`normalize()`](/api/normalize) | Apply normalization pipeline without scoring |
| [`rankCandidates()`](/api/rankCandidates) | Rank all candidates, best first |
| [`findBestMatch()`](/api/findBestMatch) | Return single best candidate |
| [`filterMatches()`](/api/filterMatches) | Return all candidates above threshold |
| [`extract()`](/api/extract) | Return top N candidates above threshold |
| [`createMatcher()`](/api/createMatcher) | Preconfigured matcher instance |

### List helpers comparison

| Function | All? | Filtered? | Limited? | Default return |
|---|---|---|---|---|
| `rankCandidates()` | ✅ | ❌ | ❌ | `{value, score, index}[]` |
| `findBestMatch()` | ❌ | ❌ | top 1 | `{value, score, index} \| null` |
| `filterMatches()` | ❌ | ✅ | ❌ | `string[]` |
| `extract()` | ❌ | ✅ | ✅ | `string[]` |

→ [List helpers guide](/guide/ranking)

---

## Aliases

`getSimilarityScore` is an alias for `rate()`.
`normalizeString` is an alias for `normalize()`.

---

## Low-level algorithm helpers

Exposed for advanced use cases. Most users don't need these directly.

| Function | Description |
|---|---|
| `getLevenshteinDistance(a, b)` | Raw edit distance (integer) |
| `getLevenshteinScore(a, b)` | Normalized score (0–100) |
| `getJaroScore(a, b)` | Jaro similarity (0–100) |
| `getJaroWinklerScore(a, b, options?)` | Jaro-Winkler similarity (0–100) |
| `getTokenSortScore(a, b, options?)` | Token-sort similarity (0–100) |
| `getTokenSetScore(a, b, options?)` | Token-set similarity (0–100) |
