# Explain mode

Explain mode allows you to understand **why** two strings match or do not match.

Instead of returning only a score, Guess‑Rater returns a detailed object
describing the entire comparison process.

---

## Enabling explain mode

Enable explain mode by setting `explain: true`.

```
import { rate } from 'guess-rater'

const result = rate('John Smith', 'Smith John', {
  explain: true
})

console.log(result)
```

---

## Returned structure

When `explain: true`, `rate()` returns an object with the following fields:

- `score` — final similarity score (0–100)
- `match` — boolean result based on the threshold
- `threshold` — threshold used for matching
- `algorithm` — algorithm used
- `input` — original left input
- `target` — original right input
- `normalizedLeft` — normalized left string
- `normalizedRight` — normalized right string
- `details` — detailed breakdown

---

## Example output

```json
{
  score: 92.4,
  match: true,
  threshold: 80,
  algorithm: 'hybrid',
  input: 'John Smith',
  target: 'Smith John',
  normalizedLeft: 'john smith',
  normalizedRight: 'john smith',
  details: {
    normalize: { ... },
    hybrid: { ... }
  }
}
```

---

## Explain mode with hybrid

When using the `hybrid` algorithm, explain mode includes a breakdown
of each sub‑algorithm.

```js
import { rate } from 'guess-rater'

const result = rate('Apple iPhone 13 Pro', 'iPhone 13', {
  algorithm: 'hybrid',
  explain: true
})

console.log(result.details.hybrid)
```

Each entry shows:
- the score of the algorithm
- the weight applied

This makes tuning hybrid weights much easier.

---

## Explain mode with ranking

Explain mode also works with `rankCandidates()`.

```js
import { rankCandidates } from 'guess-rater'

const ranked = rankCandidates(
  'John Smith',
  ['Smith J.', 'John Smyth', 'Alice Brown'],
  {
    algorithm: 'hybrid',
    explain: true
  }
)

console.log(ranked[0])
```

Each ranked item contains the same explain fields as `rate()`.

---

## Common mistake

When `explain: true` is enabled, `rate()` does **not** return a number.

Incorrect:

```js
if (rate(a, b, { explain: true }) >= 80) { ... }
```

Correct:

```js
const result = rate(a, b, { explain: true })

if (result.score >= 80) { ... }
```

---

## When to use explain mode

Explain mode is recommended when:

- debugging unexpected matches
- tuning thresholds
- tuning hybrid weights
- inspecting normalization effects
- understanding edge cases

It is **not** required for production usage once configuration is stable.

---

## Performance note

Explain mode performs the same computations as normal mode,
but returns more data.

The performance impact is minimal for most use‑cases,
but it should be disabled in tight loops if not needed.

---

## Key idea

Explain mode turns Guess‑Rater from a black box into a transparent system.

Use it to learn, tune, and understand.
