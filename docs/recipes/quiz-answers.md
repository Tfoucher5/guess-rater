# Quiz answer validation

This recipe shows how to validate **quiz or game answers**
entered by users in a tolerant way.

Users often make:
- typos
- casing differences
- punctuation mistakes
- small word order changes

Guess‑Rater allows you to accept correct intent
without requiring an exact match.

---

## Basic example

```js
import { isMatch } from 'guess-rater'

const expectedAnswer = 'new york'
const userAnswer = 'New-York'

const ok = isMatch(expectedAnswer, userAnswer)
console.log(ok)
```

By default, small formatting differences are ignored.

---

## Recommended configuration

For quiz answers, use:

- accent removal
- punctuation removal
- token sorting (if order does not matter)
- a slightly strict threshold

```js
import { isMatch } from 'guess-rater'

const ok = isMatch('new york', 'York, New', {
  threshold: 85,
  normalize: {
    removeAccents: true,
    removePunctuation: true,
    sortTokens: true
  }
})

console.log(ok)
```

---

## Handling typos

```js
import { isMatch } from 'guess-rater'

const ok = isMatch('mount everest', 'mount everst', {
  threshold: 85
})

console.log(ok)
```

Small spelling mistakes are tolerated.

---

## Using explain mode for debugging

During development, explain mode helps tune thresholds.

```js
import { rate } from 'guess-rater'

const result = rate('mount everest', 'mount everst', {
  explain: true,
  threshold: 85
})

console.log(result.score)
console.log(result.match)
```

Once tuned, explain mode can be removed.

---

## Case‑sensitive answers

Some quizzes require exact casing (rare).

```js
isMatch('NASA', 'nasa', {
  normalize: {
    caseSensitive: true
  }
})
```

Use this only when casing is part of the correct answer.

---

## Multiple valid answers

You can validate against multiple acceptable answers.

```js
import { findBestMatch } from 'guess-rater'

const validAnswers = [
  'new york',
  'nyc',
  'new york city'
]

const best = findBestMatch('NYC', validAnswers)

console.log(best)
```

---

## Threshold recommendation

For quiz answers:

- start around `80–90`
- increase threshold if answers must be precise
- lower threshold if answers are short or error‑prone

---

## Notes

- Avoid overly strict thresholds for short answers
- Use normalization to reduce user frustration
- Always test with real user input

---

## Key idea

For quizzes:

> Validate intent, not exact formatting.

Guess‑Rater helps make quizzes fair and user‑friendly.