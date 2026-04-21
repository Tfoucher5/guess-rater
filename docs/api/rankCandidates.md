# rankCandidates()

`rankCandidates()` compares one input string against a list of candidates
and returns **all candidates ranked from best to worst**.

It is useful when you want to understand *how close* each candidate is,
not just which one is the best.

---

## Signature

```js
rankCandidates(input, candidates, options?)
```

---

## Parameters

### input

Type: `string`

The reference string to compare against.

---

### candidates

Type: `string[]`

An array of candidate strings.

---

### options

Type: `object` (optional)

Same options as `rate()`:
- algorithm
- normalization
- threshold
- explain
- hybrid weights

---

## Basic usage

```js
import { rankCandidates } from 'guess-rater'

const ranked = rankCandidates(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown']
)

console.log(ranked)
```

---

## Returned value

The function returns an **array of objects**, sorted by score (descending).

Each item contains:

- `value` — the candidate string
- `score` — similarity score (0–100)
- `index` — index of the candidate in the original array

Example:

```js
[
  { value: 'John Smyth', score: 90, index: 1 },
  { value: 'Smith J.', score: 30, index: 0 },
  { value: 'Alice Brown', score: 9.09, index: 2 }
]
```

---

## Using normalization

```js
import { rankCandidates } from 'guess-rater'

const ranked = rankCandidates(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown'],
  {
    normalize: {
      sortTokens: true
    }
  }
)

console.log(ranked)
```

Normalization is applied before scoring.

---

## Using explain mode

When `explain: true` is enabled, each ranked item includes
the same details returned by `rate()`.

```js
import { rankCandidates } from 'guess-rater'

const ranked = rankCandidates(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown'],
  {
    algorithm: 'hybrid',
    explain: true
  }
)

console.log(ranked[0])
```

Each item then contains:
- `score`
- `match`
- `normalizedLeft`
- `normalizedRight`
- `details`

---

## Filtering results

You can filter ranked results using the score or match flag.

```js
const matches = ranked.filter(item => item.score >= 85)
```

or:

```js
const matches = ranked.filter(item => item.match)
```

---

## Relationship with findBestMatch()

`findBestMatch()` is a shortcut built on top of `rankCandidates()`.

If you only need the best candidate, prefer `findBestMatch()`.

---

## Performance notes

Ranking performs **one comparison per candidate**.

For large lists:
- reuse options with `createMatcher()`
- pre‑normalize static datasets if needed

---

## Typical use‑cases

- fuzzy search suggestions
- ranking user input candidates
- quiz answer comparison
- data deduplication
- recommendation systems

---

## Key idea

`rankCandidates()` gives you **full visibility** over all matches,
not just the best one.