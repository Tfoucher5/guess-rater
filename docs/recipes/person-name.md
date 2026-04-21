# Person name matching

This recipe shows how to match **person names** in a tolerant and realistic way.

Person names often vary due to:
- accents
- casing
- punctuation
- word order
- abbreviations
- typos

Guess‑Rater is well suited for this use‑case.

---

## Basic example

```js
import { rate } from 'guess-rater'

const score = rate('John Smith', 'Smith John')
console.log(score)
```

Without normalization, word order differences may reduce the score.

---

## Recommended configuration

For person names, use:

- accent removal
- punctuation removal
- token sorting
- hybrid algorithm

```js
import { rate } from 'guess-rater'

const score = rate('John Smith', 'Smith John', {
  algorithm: 'hybrid',
  normalize: {
    removeAccents: true,
    removePunctuation: true,
    sortTokens: true
  }
})

console.log(score)
```

This configuration treats both inputs as equivalent.

---

## Handling casing differences

Names are usually **case‑insensitive**.

```js
rate('JOHN SMITH', 'john smith', {
  normalize: {
    caseSensitive: false,
    sortTokens: true
  }
})
```

Avoid `caseSensitive: true` unless casing carries meaning.

---

## Handling abbreviations and typos

Use `replacements` to handle common abbreviations or mistakes.

```js
rate('J. Smith', 'John Smith', {
  normalize: {
    removePunctuation: true,
    replacements: {
      j: 'john'
    },
    sortTokens: true
  }
})
```

---

## Boolean validation

When you only need to validate a name:

```js
import { isMatch } from 'guess-rater'

const ok = isMatch('John Smith', 'Smith John', {
  threshold: 88,
  normalize: {
    removeAccents: true,
    removePunctuation: true,
    sortTokens: true
  }
})

console.log(ok)
```

---

## Finding the best match

```js
import { findBestMatch } from 'guess-rater'

const best = findBestMatch(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown'],
  {
    algorithm: 'hybrid',
    normalize: {
      removeAccents: true,
      removePunctuation: true,
      sortTokens: true
    }
  }
)

console.log(best)
```

---

## Notes

- Use higher thresholds (85–92) for names
- Token sorting is almost always recommended
- Hybrid provides the most robust results

---

## Key idea

For person names:

> Ignore formatting, compare identity.

Normalization defines identity.