# Algorithms

Guess‑Rater provides multiple string similarity algorithms.

Each algorithm answers a different question about similarity.
There is no universally “best” algorithm — the right choice depends on your use‑case.

---

## Available algorithms

You select the algorithm using `options.algorithm`.

Supported values:

- `levenshtein`
- `jaroWinkler`
- `tokenSort`
- `tokenSet`
- `hybrid`

Example:

```js
rate('John Smith', 'Smith John', {
  algorithm: 'tokenSort'
})
```

---

## levenshtein

Levenshtein measures **character‑level edit distance**.

It answers:
> “How many single‑character edits are required to transform one string into the other?”

### Strengths
- simple
- predictable
- good baseline

### Weaknesses
- sensitive to word order
- sensitive to long strings

### Example

```js
rate('apple', 'appple', {
  algorithm: 'levenshtein'
})

// score: 83.33
```

Good for:
- typos
- short strings
- baseline comparison

---

## jaroWinkler

Jaro‑Winkler focuses on **prefix similarity** and small transpositions.

It answers:
> “Do these strings look like the same name with small variations?”

### Strengths
- excellent for names
- tolerant to small mistakes
- good for short strings

### Weaknesses
- less suited for long phrases
- not token‑aware

### Example

```js
rate('Jonathan', 'Jonathon', {
  algorithm: 'jaroWinkler'
})

// score: 95
```

Recommended for:
- person names
- usernames
- short identifiers

---

## tokenSort

TokenSort splits strings into words, sorts them alphabetically, then compares.

It answers:
> “Are the same words present, regardless of order?”

### Strengths
- ignores word order
- very effective with names and titles

### Weaknesses
- extra or missing words affect the score
- not ideal when order matters

### Example

```js
rate('Smith John', 'John Smith', {
  algorithm: 'tokenSort'
})

// score: 100
```

Recommended for:
- names
- product titles
- addresses

---

## tokenSet

TokenSet compares **shared tokens** and penalizes missing or extra words.

It answers:
> “How much information do these strings share?”

### Strengths
- handles extra words well
- tolerant to noise
- good for fuzzy search

### Weaknesses
- less sensitive to exact ordering
- may over‑match in some cases

### Example

```js
rate('Apple iPhone 13 Pro', 'iPhone 13', {
  algorithm: 'tokenSet'
})

// score: 100
```

Recommended for:
- product matching
- fuzzy catalog search
- partial queries

---

## hybrid

Hybrid combines multiple algorithms using weighted scoring.

It answers:
> “What is the best overall similarity across different strategies?”

By default, hybrid uses:

- Levenshtein
- Jaro‑Winkler
- TokenSet

### Strengths
- most robust option
- balances strictness and tolerance
- works well across domains

### Weaknesses
- slightly slower
- requires tuning for specific domains

### Example

```js
rate('John Smith', 'Smith J.', {
  algorithm: 'hybrid'
})

//   score: 48.29
```

---

## Choosing the right algorithm

Quick guidelines:

- Person names → `jaroWinkler` or `hybrid`
- Product titles → `tokenSet` or `hybrid`
- Reordered phrases → `tokenSort`
- Simple typo detection → `levenshtein`
- Unknown / mixed use‑cases → `hybrid`

---

## Algorithm vs normalization

Algorithms do not work alone.

In practice:
- normalization reduces noise
- algorithms measure similarity

The combination of both defines the final result.

---

## Summary

- Algorithms measure similarity
- Normalization controls what differences matter
- Hybrid is the safest default
- Domain knowledge always wins

Pick the algorithm that matches **your definition of similarity**.