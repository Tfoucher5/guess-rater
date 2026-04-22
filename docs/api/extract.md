# extract()

Returns the **top N candidates** that score at or above the threshold. Combines filtering and limiting in one call.

## Signature

```ts
// Default — returns string[]
extract(input: string, candidates: string[], options?: RateOptions & { limit?: number; return?: 'values' }): string[]

// Detailed — returns ranked objects
extract(input: string, candidates: string[], options: RateOptions & { limit?: number; return: 'entries' }): RankedCandidate[]
extract(input: string, candidates: string[], options: RateOptions & { limit?: number; return: 'entries'; explain: true }): RankedCandidateExplain[]
```

## Usage

```js
import { extract } from 'guess-rater'

// Default: top 5, threshold 80, returns string[]
extract('apple', ['Apple Watch', 'Apple TV', 'Samsung TV', 'iPad'])
// ['Apple Watch', 'Apple TV']

// Custom limit and threshold
extract('apple', candidates, { limit: 2, threshold: 60 })
// ['Apple Watch', 'Apple TV']

// Detailed objects
extract('apple', candidates, { return: 'entries', limit: 3 })
// [{ value: 'Apple Watch', score: 91, index: 0 }, ...]

// With explain
extract('apple', candidates, { return: 'entries', explain: true })
```

> `explain` is only applied when `return: 'entries'`.

## Options

| Option | Default | Description |
|---|---|---|
| `limit` | `5` | Maximum number of results |
| `threshold` | `80` | Minimum score to include |
| `return` | `'values'` | `'values'` → `string[]`, `'entries'` → `{value, score, index}[]` |
| `explain` | `false` | Include explain payload (requires `return: 'entries'`) |
| + all [rate() options](/api/rate#options) | | |

## Pipeline

```
rankCandidates()  →  filter(score >= threshold)  →  slice(0, limit)
```

## See also

- [List helpers comparison](/guide/ranking)
- [filterMatches()](/api/filterMatches) — same without the count limit
- [findBestMatch()](/api/findBestMatch) — single best result
