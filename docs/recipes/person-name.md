# Recipe: Person name matching

## The challenge

Person names vary in ways that are hard to predict: accents, casing, punctuation, reversed first/last name, abbreviations, nicknames, and typos.

```
"Jean-Paul Dupont"  vs  "dupont jean paul"   → same person
"J. Smith"          vs  "John Smith"         → probably same person
"Molière"           vs  "Moliere"            → same
"Marta"             vs  "Martha"             → likely same
```

## Recommended configuration

```js
import { rate, isMatch, findBestMatch, createMatcher } from 'guess-rater'

const config = {
  algorithm: 'hybrid',
  normalize: {
    removeAccents: true,
    removePunctuation: true,
    sortTokens: true       // makes word order irrelevant
  },
  threshold: 88
}
```

**Why hybrid?** Names have both character-level noise (typos) and word-order variations. Hybrid handles both with a single config.

**Why sortTokens?** "Dupont Jean" and "Jean Dupont" should score 100.

**Why 88?** High enough to avoid false positives like "Pierre" vs "Pierre-Antoine", low enough to catch "Jean-Paul" vs "jean paul".

## Usage

```js
// Boolean check
isMatch('Jean-Paul Dupont', 'dupont jean paul', config) // true
isMatch('Marta', 'Martha', config)                      // true
isMatch('Pierre Martin', 'Marie Pierre', config)        // false

// Find best match in a list
findBestMatch('Molière', ['Hugo', 'Moliere', 'Racine', 'Voltaire'], config)
// { value: 'Moliere', score: 100, index: 1 }

// Filter candidates above threshold
filterMatches('Jean Dupont', ['Jean-Paul Dupont', 'Jean Martin', 'Paul Simon'], config)
// ['Jean-Paul Dupont', 'Jean Martin']
```

## Handling abbreviations

Use `replacements` for common abbreviations or nicknames:

```js
const config = {
  algorithm: 'hybrid',
  normalize: {
    removeAccents: true,
    sortTokens: true,
    replacements: {
      'j.': 'john',
      'j ':  'john ',
      'bill': 'william',
      'bob':  'robert'
    }
  }
}

isMatch('J. Smith', 'John Smith', config) // true
```

## Calibrating the threshold

Use explain mode to see score distributions across your dataset:

```js
rate('Pierre', 'Pierre-Antoine', { algorithm: 'hybrid', explain: true })
// score: 78 — below 88 → correct rejection

rate('Dupont', 'Dupond', { algorithm: 'hybrid', explain: true })
// score: 91 — above 88 → correct match
```

→ [Thresholds guide](/guide/thresholds) | [Normalization options](/guide/normalization)
