# Recipe: Data cleaning & deduplication

## The challenge

Raw datasets contain the same entity under different formats:

```
"Apple Inc."     vs  "APPLE INC"        → duplicate
"Café de Paris"  vs  "cafe de paris"    → duplicate
"Jean Dupont"    vs  "Dupont, Jean"     → duplicate
"Samsung Galaxy" vs  "Galaxy Samsung"   → duplicate
```

## Recommended configuration

```js
import { createMatcher, normalize, rankCandidates } from 'guess-rater'

const matcher = createMatcher({
  algorithm: 'hybrid',
  normalize: {
    removeAccents: true,
    removePunctuation: true,
    sortTokens: true
  },
  threshold: 90    // strict — prefer false negatives over false positives
})
```

**Why 90+?** Deduplication errors are costly. A false positive merges two different entities. Err on the side of caution.

**Why sortTokens?** "Jean Dupont" and "Dupont Jean" are the same entity.

## Normalize first, compare second

Pre-normalize your dataset once before comparison loops:

```js
const normalized = rawData.map(item => ({
  original: item,
  normalized: normalize(item, {
    removeAccents: true,
    removePunctuation: true,
    sortTokens: true
  })
}))
```

## Detect duplicates in a list

```js
function findDuplicates(items, threshold = 90) {
  const duplicates = []

  for (let i = 0; i < items.length; i++) {
    const candidates = items.slice(i + 1)
    const ranked = matcher.rankCandidates(items[i], candidates)
    const matches = ranked.filter(r => r.score >= threshold)

    if (matches.length > 0) {
      duplicates.push({ source: items[i], matches: matches.map(m => m.value) })
    }
  }

  return duplicates
}

findDuplicates(['Apple Inc.', 'APPLE INC', 'Google', 'google LLC'])
// [
//   { source: 'Apple Inc.', matches: ['APPLE INC'] },
//   { source: 'Google', matches: ['google LLC'] }
// ]
```

## Match incoming data to a reference list

When importing data, match each new entry to the existing canonical list:

```js
const canonicalList = ['Apple Inc.', 'Google LLC', 'Microsoft Corp.']

function matchToCanonical(rawValue) {
  const result = matcher.findBestMatch(rawValue, canonicalList)
  if (result && result.score >= 90) {
    return result.value  // known entity
  }
  return null  // new entity — add to canonical list
}

matchToCanonical('APPLE INC')   // 'Apple Inc.'
matchToCanonical('apple inc.')  // 'Apple Inc.'
matchToCanonical('Meta')        // null — not in list
```

## Investigate edge cases with explain mode

When a match is unexpected, inspect the normalized forms:

```js
matcher.rate('Google', 'google LLC', { explain: true })
// { score: 87, normalizedLeft: 'google', normalizedRight: 'google llc', ... }
// → 'llc' is adding noise → add it to removeWords
```

```js
const matcher = createMatcher({
  algorithm: 'hybrid',
  normalize: {
    removeAccents: true,
    removePunctuation: true,
    sortTokens: true,
    removeWords: ['inc', 'llc', 'corp', 'ltd', 'sa', 'sas']  // legal suffixes
  }
})
```

→ [Normalization guide](/guide/normalization) | [Explain mode](/guide/explain-mode) | [createMatcher](/guide/matcher)
