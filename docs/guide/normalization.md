# Normalization

Normalization is the most important part of Guess‑Rater.

It allows you to remove noise and formatting differences **before** comparing strings.

You decide what matters and what does not.

---

## Why normalization exists

Most matching problems are not caused by wrong information, but by differences such as:

- accents  
- punctuation  
- casing  
- word order  
- extra words  
- typos or abbreviations  

Normalization solves this **before** any algorithm is applied.

---

## The normalize option

Normalization is configured using `options.normalize`.

Example:

```js
import { rate } from 'guess-rater'

rate('the mont st-michel', 'the mont saint michel', {
  normalize: {
    removeWords: ['the'],
    replacements: { st: 'saint' },
    sortTokens: true
  }
})
// rightResult : mont saint michel 
// leftResult : mont saint michel 
```

---

## caseSensitive

Controls whether letter casing matters.

- default: `false`

```js
normalize: {
  caseSensitive: false
}
```

When `false`:
```
Paris == paris == PARIS
```

When `true`:
```
Paris != paris != PARIS
```

Recommended:
- names → false
- products → false
- identifiers / codes → true

---

## removeAccents

Removes diacritics.

- default: `true`

```js
normalize: {
  removeAccents: true
}
```

Examples:
```
é → e
ç → c
ô → o
```

---

## removePunctuation

Removes punctuation characters.

- default: `true`

```js
normalize: {
  removePunctuation: true
}
```

Examples:
```
SAINT-MICHEL → SAINT MICHEL
renault/clio → renault clio
```

---

## punctuationStrategy

Controls how punctuation is handled.

- `"space"` (default)
- `"remove"`

```js
normalize: {
  punctuationStrategy: 'space'
}
```

Use `"space"` to keep word boundaries.
Use `"remove"` when punctuation should disappear completely.

---

## trim

Removes leading and trailing whitespace.

- default: `true`

```js
normalize: {
  trim: true
}
```

---

## collapseWhitespace

Collapses multiple spaces into a single space.

- default: `true`

```js
normalize: {
  collapseWhitespace: true
}
```

---

## replacements

Replace substrings before matching.

Useful for:
- abbreviations
- common typos
- domain-specific rules

```js
normalize: {
  replacements: {
    st: 'saint',
    nvm: 'nevermind'
  }
}
```

Replacements are applied **before** comparison.

---

## removeWords

Removes specific words completely.

Useful for:
- articles
- stop words
- noise words

```js
normalize: {
  removeWords: ['the']
}
```

Example:
```
"the thing" → "thing"
```

---

## sortTokens

Sorts words alphabetically.

- default: `false`

```js
normalize: {
  sortTokens: true
}
```

This makes word order irrelevant.

Examples:
```
"Tower Eiffel" == "Eiffel Tower"
"The Thing" == "Thing The"
```

Use it for:
- names
- products
- cities
- addresses

Avoid it for:
- IDs
- codes
- sentences where order matters

---

## Typical normalization presets

### Names

```js
normalize: {
  removeAccents: true,
  removePunctuation: true,
  sortTokens: true
}
```

### Products

```js
normalize: {
  removeAccents: true,
  removePunctuation: true,
  sortTokens: true
}
```

### Strict identifiers

```js
normalize: {
  caseSensitive: true,
  removePunctuation: false,
  sortTokens: false
}
```

---

## Key idea

Normalization is not “right” or “wrong”.

It is **a tool**.

You control how strict or tolerant the matching should be.
