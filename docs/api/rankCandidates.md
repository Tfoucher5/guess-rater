# rankCandidates()

Compares one string against a list of candidates and returns **all candidates sorted by score**, best first.

## Signature

```ts
rankCandidates(input: string, candidates: string[], options?: RateOptions): RankedCandidate[]
rankCandidates(input: string, candidates: string[], options: RateOptions & { explain: true }): RankedCandidateExplain[]
```

Each result: `{ value: string, score: number, index: number }`.

## Usage

```js
import { rankCandidates } from 'guess-rater'

rankCandidates('moliere', ['Voltaire', 'Moliere', 'Victor Hugo'])
// [
//   { value: 'Moliere',     score: 100, index: 1 },
//   { value: 'Victor Hugo', score: 22,  index: 2 },
//   { value: 'Voltaire',    score: 17,  index: 0 }
// ]
```

**With threshold filtering:**
```js
const ranked = rankCandidates('iphone', candidates, { algorithm: 'tokenSet' })
const matches = ranked.filter(r => r.score >= 80)
```

**With explain mode:**
```js
rankCandidates('hello', ['hello', 'helo'], { explain: true })
// Each item includes: match, normalizedLeft, normalizedRight, details
```

## Options

All [rate() options](/api/rate#options) are accepted.

## See also

- [List helpers comparison](/guide/ranking) — rankCandidates vs findBestMatch vs filterMatches vs extract
- [findBestMatch()](/api/findBestMatch) — returns only the top result
- [filterMatches()](/api/filterMatches) — returns only candidates above threshold
