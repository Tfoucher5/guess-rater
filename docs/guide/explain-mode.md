# Explain mode

Add `explain: true` to any scoring call to get a detailed breakdown instead of a raw score.

```js
const result = rate('Saint-Nazaire', 'saint-nazaire', { explain: true })
```

---

## Return structure

```ts
{
  score: number,          // 0–100
  match: boolean,         // score >= threshold
  threshold: number,      // threshold used
  algorithm: string,      // algorithm used
  input: string,          // original left string
  target: string,         // original right string
  normalizedLeft: string, // after normalization
  normalizedRight: string,
  details: {
    normalize: NormalizeOptions,
    hybrid?: Record<string, { score: number, weight: number }>, // hybrid only
    spaceInsensitive?: Record<string, SpaceInsensitiveExplain>  // when spaceInsensitive: true
  }
}
```

---

## Examples

**Standard explain**
```js
rate('hello', 'helo', { explain: true })
// {
//   score: 88,
//   match: true,
//   threshold: 80,
//   algorithm: 'levenshtein',
//   input: 'hello',
//   target: 'helo',
//   normalizedLeft: 'hello',
//   normalizedRight: 'helo',
//   details: { normalize: { caseSensitive: false, removeAccents: true, ... } }
// }
```

**Hybrid explain** — shows per-algorithm breakdown:
```js
rate('iphone 15', 'iPhone 15 Pro', {
  algorithm: 'hybrid',
  explain: true
})
// details.hybrid = {
//   levenshtein: { score: 79, weight: 0.4 },
//   jaroWinkler:  { score: 91, weight: 0.3 },
//   tokenSet:     { score: 95, weight: 0.3 }
// }
```

**spaceInsensitive explain** — shows which pass was chosen:
```js
rate('stairwaytoheaven', 'stairway to heaven', {
  algorithm: 'levenshtein',
  spaceInsensitive: true,
  explain: true
})
// details.spaceInsensitive = {
//   levenshtein: {
//     enabled: true,
//     applied: true,
//     chosen: 'compact',       // compact pass won
//     standardScore: 61,
//     compactScore: 100,
//     compactLeft: 'stairwaytoheaven',
//     compactRight: 'stairwaytoheaven'
//   }
// }
```

**Explain with list helpers:**
```js
rankCandidates('hello', ['hello', 'helo', 'world'], { explain: true })
// Each item includes the full explain structure + { value, index }
```

---

## Common mistake

`rate()` with `explain: true` returns an **object**, not a number:

```js
// Wrong
if (rate('a', 'b', { explain: true }) >= 80) { ... }

// Correct
const result = rate('a', 'b', { explain: true })
if (result.score >= 80) { ... }
// or use result.match (already compares against threshold)
```

---

## When to use explain mode

- **Debugging** — understand why two strings don't match
- **Threshold calibration** — find the natural score gap in your data
- **Normalization tuning** — see `normalizedLeft` / `normalizedRight` after transformation
- **Hybrid weight tuning** — inspect per-algorithm scores

> Explain mode has negligible performance impact. Disable it in production only if you need the absolute minimal return value.
