# Concepts

## The matching pipeline

Every call to `rate()`, `isMatch()`, or any list helper goes through the same pipeline:

```
Input strings
    ↓
1. Normalization   — remove noise (accents, casing, punctuation…)
    ↓
2. Algorithm       — measure character or token similarity
    ↓
3. Score (0–100)   — normalized to a common scale
    ↓
4. Threshold       — score ≥ threshold → match: true
    ↓
5. Output          — number, boolean, or explain object
```

Each step is configurable and independent. You can normalize aggressively, pick a precise algorithm, set a strict threshold — or leave everything at defaults and get sensible results out of the box.

## Score vs match

`rate()` returns a **continuous score** (0–100). `isMatch()` converts it to a **boolean** using a threshold.

```js
rate('levenshtein', 'levenstein')    // 88   — a number
isMatch('levenshtein', 'levenstein') // true  — score >= 80 (default threshold)
```

Use the score when you need to rank or compare results. Use the boolean when you only care about yes/no.

## Normalization is preprocessing

Normalization runs **before** the algorithm. It removes formatting differences that aren't semantically meaningful — accents, casing, punctuation, stop words.

```js
// These all score 100 with default normalization:
rate('Molière', 'moliere')
rate('Saint-Nazaire', 'saint nazaire')
rate('APPLE INC.', 'apple inc')
```

The more consistent your normalization, the more predictable your scores. → [Normalization reference](/guide/normalization)

## Algorithms measure different things

| Question | Algorithm |
|---|---|
| How many edits to transform A into B? | `levenshtein` |
| Do they share the same prefix / short form? | `jaroWinkler` |
| Do they contain the same words (any order)? | `tokenSort` |
| Does one contain the other's words? | `tokenSet` |
| All of the above, weighted? | `hybrid` |

→ [Algorithm guide](/guide/algorithms)

## Explain mode

Add `explain: true` to any call to see the full breakdown: normalized strings, algorithm used, threshold evaluated, and per-algorithm scores in hybrid mode.

```js
rate('hello', 'helo', { explain: true })
// { score: 88, match: true, threshold: 80, normalizedLeft: 'hello', ... }
```

→ [Explain mode guide](/guide/explain-mode)
