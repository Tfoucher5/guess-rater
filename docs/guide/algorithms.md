# Algorithms

## Quick comparison

| Algorithm | Best for | Sensitive to order? | Handles extra words? |
|---|---|---|---|
| `levenshtein` | Typos, short strings | Yes | No |
| `jaroWinkler` | Names, short IDs | Yes | No |
| `tokenSort` | Reordered words | No | Partially |
| `tokenSet` | Extra / missing words | No | Yes |
| `hybrid` | Mixed / unknown inputs | Balanced | Balanced |

Use the `algorithm` option on any scoring function:

```js
rate('John Smith', 'Smith John', { algorithm: 'tokenSort' }) // 100
```

---

## levenshtein

Counts the minimum number of character edits (insert, delete, replace) to transform one string into another. The score is normalized to 0–100.

**Good for:** spelling mistakes, short strings, codes, identifiers.

```js
rate('levenshtein', 'levenstein')  // ~88
rate('color', 'colour')            // ~91
rate('GOOG', 'GOOGL')              // ~88
```

**Limitation:** word order matters — `"John Smith"` vs `"Smith John"` will score low.

---

## jaroWinkler

Measures character overlap and prefix similarity. Gives a bonus when strings share the same beginning, which makes it excellent for names.

**Good for:** person names, usernames, short identifiers.

```js
rate('Martha', 'Marhta', { algorithm: 'jaroWinkler' })  // ~94
rate('Dixon', 'Dicksonx', { algorithm: 'jaroWinkler' })  // ~81
```

**Options:**

| Option | Default | Description |
|---|---|---|
| `jaroWinkler.prefixScale` | `0.1` | Weight of the prefix bonus |
| `jaroWinkler.maxPrefixLength` | `4` | Max prefix length considered |

---

## tokenSort

Sorts tokens alphabetically before comparing. This makes word order irrelevant.

**Good for:** names, product titles, addresses where word order varies.

```js
rate('John Smith', 'Smith, John', { algorithm: 'tokenSort' })       // 100
rate('peugeot 208 active', '208 peugeot active', { algorithm: 'tokenSort' }) // 100
```

**Options:**

| Option | Default | Description |
|---|---|---|
| `tokenSort.baseAlgorithm` | `'levenshtein'` | Algorithm used after token sorting |

---

## tokenSet

Compares string pairs built from shared and unique tokens, then takes the best score. Extremely tolerant of extra or missing words.

**Good for:** product matching, fuzzy search, partial queries.

```js
rate('iphone 15 pro max 256gb', 'iPhone 15 Pro Max', { algorithm: 'tokenSet' })  // ~95
rate('café de paris', 'le café de paris brasserie', { algorithm: 'tokenSet' })   // ~91
```

**Options:**

| Option | Default | Description |
|---|---|---|
| `tokenSet.baseAlgorithm` | `'levenshtein'` | Algorithm used for token set comparison |

---

## hybrid

Combines multiple algorithms with configurable weights. Use when inputs are inconsistent or when you want robustness without knowing which algorithm fits best.

**Default weights:** `levenshtein: 0.4, jaroWinkler: 0.3, tokenSet: 0.3`

```js
// Default hybrid — no config needed
rate('Jean-Baptiste Poquelin', 'jean baptiste poquelin', { algorithm: 'hybrid' }) // 100

// Custom weights
rate('iPhone 15 Pro', 'iphone 15 pro max', {
  algorithm: 'hybrid',
  hybrid: { tokenSort: 0.5, tokenSet: 0.5 }
})
```

**Reading the hybrid explain output:**

```js
rate('hello world', 'helo world', {
  algorithm: 'hybrid',
  explain: true
})
// details.hybrid = {
//   levenshtein: { score: 95, weight: 0.4 },
//   jaroWinkler:  { score: 97, weight: 0.3 },
//   tokenSet:     { score: 95, weight: 0.3 }
// }
```

**Weight rules:**
- Weights don't need to sum to 1 — they are normalized internally.
- Any algorithm can be used as a sub-algorithm, except `hybrid` itself.
- Omit an algorithm from the `hybrid` object to exclude it.

**When to use hybrid:** mixed data sources, unknown input structure, general-purpose matching.

**When NOT to use hybrid:** when you know exactly what you're comparing (e.g., only names → `jaroWinkler` is more predictable).

→ [Explain mode](/guide/explain-mode) — inspect hybrid breakdown per sub-algorithm

---

## spaceInsensitive

Available on all **character-based algorithms** (`levenshtein`, `jaroWinkler`). When enabled, Guess‑Rater runs an additional comparison with all whitespace removed from both strings, then keeps the best score.

```js
rate('stairwaytoheaven', 'stairway to heaven', {
  algorithm: 'levenshtein',
  spaceInsensitive: true
}) // 100

rate('nomoresorrow', 'no more sorrow', {
  algorithm: 'jaroWinkler',
  spaceInsensitive: true
}) // 100
```

> Does **not** affect `tokenSort` or `tokenSet` — those already handle spaces through token splitting.

When used with `explain: true`, the details include which pass was chosen and both scores:

```js
// details.spaceInsensitive = {
//   levenshtein: { enabled: true, applied: true, chosen: 'compact', standardScore: 61, compactScore: 100, ... }
// }
```

---

## Choosing an algorithm

```
Comparing short strings or codes?         → levenshtein
Comparing names or usernames?             → jaroWinkler
Word order might vary?                    → tokenSort
Extra or missing words expected?          → tokenSet
Mixed / inconsistent inputs?              → hybrid
Strings may lack spaces between words?    → add spaceInsensitive: true
```

When in doubt, start with `hybrid` and use [explain mode](/guide/explain-mode) to understand the breakdown.
