# findBestMatch()

Compares one string against a list of candidates and returns the **single best match**, or `null` if the list is empty.

## Signature

```ts
findBestMatch(input: string, candidates: string[], options?: RateOptions): RankedCandidate | null
findBestMatch(input: string, candidates: string[], options: RateOptions & { explain: true }): RankedCandidateExplain | null
```

Result: `{ value: string, score: number, index: number }` — or `null`.

## Usage

```js
import { findBestMatch } from 'guess-rater'

findBestMatch('peugeot 208', ['Renault Clio', 'Peugeot 308', '208 Peugeot'], {
  algorithm: 'tokenSort'
})
// { value: '208 Peugeot', score: 100, index: 2 }

findBestMatch('anything', [])
// null
```

**With explain mode:**
```js
findBestMatch('hello', ['hello', 'helo'], { explain: true })
// { value: 'hello', score: 100, index: 0, match: true, details: {...}, ... }
```

## Options

All [rate() options](/api/rate#options) are accepted.

## Equivalent to

```js
findBestMatch(input, candidates, options) ≈ rankCandidates(input, candidates, options)[0] ?? null
```

Use `findBestMatch()` when you only need the top result. Use `rankCandidates()` when you need all scores.

## See also

- [List helpers comparison](/guide/ranking)
- [rankCandidates()](/api/rankCandidates) — all candidates, sorted
- [filterMatches()](/api/filterMatches) — all candidates above threshold
