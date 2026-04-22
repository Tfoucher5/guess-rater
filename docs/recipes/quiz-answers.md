# Recipe: Quiz answer validation

## The challenge

Users type answers with typos, different casing, missing accents, or slight word variations:

```
Expected: "stairway to heaven"
User types: "Stairway To Heaven"   → should pass
User types: "stairway to heavon"   → should pass (typo)
User types: "stairway"             → should fail (too short)
```

## Recommended configuration

```js
import { isMatch, findBestMatch } from 'guess-rater'

const config = {
  algorithm: 'levenshtein',
  normalize: {
    removeAccents: true,
    removePunctuation: true
  },
  threshold: 85
}
```

**Why levenshtein?** Quiz answers are typically short, single-value strings. Levenshtein is the most predictable algorithm for character-level typos.

**Why 85?** Strict enough to reject wrong answers, tolerant enough for common typos.

## Usage

```js
// Simple validation
isMatch('stairway to heaven', userAnswer, config)

// With custom threshold per question
isMatch('42', userAnswer, { ...config, threshold: 100 }) // exact match for numbers

// Multiple valid answers
const validAnswers = ['stairway to heaven', 'led zeppelin iv', 'zoso']
const best = findBestMatch(userAnswer, validAnswers, config)
if (best && best.score >= 85) {
  console.log('Correct!')
}
```

## Calibrating tolerance

For short answers (1–3 words), typo tolerance matters more:

```js
// Too strict — rejects "colour" for "color"
isMatch('color', 'colour', { threshold: 95 }) // false

// Good — allows common spelling variants
isMatch('color', 'colour', { threshold: 85 }) // true
```

For factual answers where precision matters, increase the threshold:

```js
isMatch('Louis XIV', userAnswer, { threshold: 92 }) // strict — no "Louis XIII"
```

## Avoiding false positives on short strings

Very short strings score misleadingly high. Use a higher threshold or exact match:

```js
// Risky: "cat" vs "car" scores 67 — passes at threshold 65
isMatch('cat', 'car', { threshold: 65 }) // true

// Better: use a strict threshold for 3-letter answers
isMatch('cat', 'car', { threshold: 90 }) // false
```

## Debugging with explain mode

During development, check the scores for expected matches and non-matches:

```js
rate('stairway to heaven', 'stairway to heavon', { explain: true })
// { score: 94, match: true, ... }

rate('stairway to heaven', 'highway to hell', { explain: true })
// { score: 52, match: false, ... }
```

→ [Explain mode](/guide/explain-mode) | [Thresholds guide](/guide/thresholds)
