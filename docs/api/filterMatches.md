# filterMatches()

Returns all candidates that score **at or above the threshold**. No count limit.

## Signature

```ts
// Default — returns string[]
filterMatches(input: string, candidates: string[], options?: RateOptions & { return?: 'values' }): string[]

// Detailed — returns ranked objects
filterMatches(input: string, candidates: string[], options: RateOptions & { return: 'entries' }): RankedCandidate[]
filterMatches(input: string, candidates: string[], options: RateOptions & { return: 'entries'; explain: true }): RankedCandidateExplain[]
```

## Usage

```js
import { filterMatches } from 'guess-rater'

// Default: string[]
filterMatches('iPhone', ['iPhone 15', 'Samsung S24', 'iPhone 14 Pro'], { threshold: 70 })
// ['iPhone 15', 'iPhone 14 Pro']

// Detailed objects
filterMatches('iPhone', candidates, { threshold: 70, return: 'entries' })
// [{ value: 'iPhone 15', score: 91, index: 0 }, { value: 'iPhone 14 Pro', score: 84, index: 2 }]

// With explain
filterMatches('iPhone', candidates, { threshold: 70, return: 'entries', explain: true })
// Each entry includes the full explain payload
```

> `explain` is only applied when `return: 'entries'` — it is ignored in values mode.

## Options

| Option | Default | Description |
|---|---|---|
| `threshold` | `80` | Minimum score to include |
| `return` | `'values'` | `'values'` → `string[]`, `'entries'` → `{value, score, index}[]` |
| `explain` | `false` | Include explain payload (requires `return: 'entries'`) |
| + all [rate() options](/api/rate#options) | | |

## See also

- [List helpers comparison](/guide/ranking)
- [extract()](/api/extract) — same as filterMatches but with a count limit
- [rankCandidates()](/api/rankCandidates) — all candidates, no threshold filter
