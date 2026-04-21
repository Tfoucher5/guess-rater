# Ranking and batch matching

Guess‑Rater can compare **one input against many candidates**.

This is useful when you want to:
- find the closest match in a list
- rank multiple possibilities
- validate user input against a dataset

Two helpers are provided:
- `rankCandidates()`
- `findBestMatch()`

---

## rankCandidates

`rankCandidates()` compares one input string against a list of candidates
and returns **all results sorted from best to worst**.

### Basic usage

```js
import { rankCandidates } from 'guess-rater'

const ranked = rankCandidates(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown'],
  {
    algorithm: 'hybrid',
    normalize: {
      sortTokens: true
    }
  }
)

console.log(ranked)
```

---

## Returned structure

Each ranked entry contains:

- `value` — the candidate string
- `score` — similarity score (0–100)
- `index` — index of the candidate in the original array

Example:

```json
{
  value: 'John Smyth',
  score: 91.4,
  index: 1
}
```

---

## Ranking with explain mode

You can enable `explain: true` to get detailed information
for each ranked candidate.

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

Each entry then includes:
- normalized strings
- match boolean
- algorithm breakdown

---

## Filtering matches

You can filter results using the score or match flag.

```js
const matches = ranked.filter(item => item.score >= 85)
```

or:

```js
const matches = ranked.filter(item => item.match)
```

---

## findBestMatch

`findBestMatch()` is a shortcut built on top of `rankCandidates()`.

It returns **only the best match** (or `null` if the list is empty).

### Basic usage

```js
import { findBestMatch } from 'guess-rater'

const best = findBestMatch(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown'],
  {
    algorithm: 'hybrid',
    normalize: {
      sortTokens: true
    }
  }
)

console.log(best)
```

---

## Returned value

If a match is found:

```json
{
  value: 'John Smyth',
  score: 91.4,
  index: 1
}
```

If the candidates list is empty:

```json
null
```

---

## Performance considerations

Ranking performs **one comparison per candidate**.

For large lists:
- prefer `createMatcher()` to reuse configuration
- consider pre‑normalizing static datasets
- tune thresholds to reduce false positives

---

## Common use‑cases

- fuzzy search suggestions
- quiz answer validation
- contact or customer deduplication
- product matching
- data reconciliation

---

## Key idea

`rankCandidates()` gives you visibility and control.  
`findBestMatch()` gives you convenience.

Both are built on the same matching engine.