# Data cleaning and deduplication

This recipe shows how to use Guess‑Rater for **data cleaning** and
**duplicate detection**.

Real‑world datasets often contain:
- inconsistent casing
- punctuation differences
- reordered words
- partial values
- near‑duplicates

Guess‑Rater helps normalize data and identify duplicates reliably.

---

## Normalizing raw data

Before matching, it is often useful to normalize data explicitly.

```js
import { normalize } from 'guess-rater'

const rawValues = [
  'The Quick-Brown Fox',
  'quick brown fox',
  'FOX, QUICK BROWN',
  'Lazy Dog'
]

const normalizedValues = rawValues.map(value =>
  normalize(value, {
    removeWords: ['the'],
    removePunctuation: true,
    sortTokens: true
  })
)

console.log(normalizedValues)
```

This produces a consistent representation for comparison or storage.

---

## Detecting duplicates in a list

You can compare each value against the rest of the dataset.

```js
import { rankCandidates } from 'guess-rater'

const values = [
  'Quick Brown Fox',
  'Brown Quick Fox',
  'Lazy Dog'
]

const ranked = rankCandidates(
  'Quick Brown Fox',
  values,
  {
    algorithm: 'hybrid',
    normalize: {
      removePunctuation: true,
      sortTokens: true
    }
  }
)

console.log(ranked)
```

Candidates with high scores are likely duplicates.

---

## Filtering potential duplicates

```js
const duplicates = ranked.filter(item => item.score >= 90)
console.log(duplicates)
```

Higher thresholds reduce false positives.

---

## Finding the closest existing value

```js
import { findBestMatch } from 'guess-rater'

const best = findBestMatch(
  'quick brown fox',
  [
    'Quick Brown Fox',
    'Lazy Dog',
    'Slow Yellow Cat'
  ],
  {
    algorithm: 'hybrid',
    normalize: {
      removePunctuation: true,
      sortTokens: true
    }
  }
)

console.log(best)
```

This is useful when importing or merging datasets.

---

## Using createMatcher for large datasets

For repeated comparisons, reuse configuration.

```js
import { createMatcher } from 'guess-rater'

const matcher = createMatcher({
  algorithm: 'hybrid',
  threshold: 90,
  normalize: {
    removePunctuation: true,
    sortTokens: true
  }
})

const isDuplicate = matcher.isMatch(
  'Quick Brown Fox',
  'Brown Quick Fox'
)

console.log(isDuplicate)
```

This avoids re‑creating options for each comparison.

---

## Recommended settings

For data cleaning and deduplication:

- use `hybrid`
- enable punctuation removal
- enable token sorting
- start with thresholds between `85–95`

Always validate thresholds on real data.

---

## Notes

- Data cleaning is domain‑specific
- Normalization rules should reflect business logic
- Explain mode helps understand edge cases

---

## Key idea

For data cleaning:

> Normalize first.  
> Compare consistently.  
> Decide duplicates with thresholds.