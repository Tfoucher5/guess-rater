# Thresholds

A threshold defines **when a similarity score is considered a match**.

In Guess‑Rater, a score is always between **0 and 100**.
The threshold converts this continuous score into a boolean decision.

---

## What is a threshold?

The rule is simple:

```
match = score >= threshold
```

- score < threshold → no match
- score >= threshold → match

The default threshold is **80**.

---

## Using thresholds with isMatch

`isMatch()` is a convenience helper built on top of `rate()`.

```js
import { isMatch } from 'guess-rater'

const ok = isMatch('John Smith', 'John Smith', 85)
console.log(ok)

// true
```

Internally, Guess‑Rater computes the score and compares it to the threshold.

---

## Using thresholds with rate

When using `rate()` directly, you can inspect both the score and the match result.

```js
import { rate } from 'guess-rater'

const result = rate('John Smith', 'John Smith', {
  explain: true,
  threshold: 85
})

console.log(result.score)
console.log(result.match)

// 100
// true
```

This is useful when you want more control or need to debug results.

---

## Choosing the right threshold

There is no universal threshold.
The correct value depends on your domain and tolerance.

General guidelines:

- **Very strict matching** → 90–95
- **Balanced matching** → 80–90
- **Very tolerant matching** → 70–80

---

## Common use‑cases

### Person names

```js
threshold: 88
```

Names are short and sensitive to small differences.
Higher thresholds reduce false positives.

---

### Product titles

```js
threshold: 75
```

Product names often contain extra words or noise.
Lower thresholds allow partial matches.

---

### Quiz answers

```js
threshold: 85
```

Users may make small typos but the intent should be clear.

---

### Data deduplication

```js
threshold: 90
```

You usually want to avoid merging unrelated records.

---

## Thresholds and normalization

Thresholds must be chosen **after normalization** is configured.

Example:

```js
sortTokens: true
removeAccents: true
removeWords: [...]
```

Better normalization usually allows **higher thresholds**,
because noise is already removed.

---

## Thresholds and hybrid scoring

Hybrid scores tend to be more stable than single‑algorithm scores.

This often means:
- fewer extreme values
- smoother score distribution

As a result, hybrid usually works well with thresholds between **80 and 90**.

---

## Avoid hard‑coding blindly

Do not assume one threshold fits all cases.

Recommended approach:
1. enable `explain: true`
2. inspect real scores on your data
3. adjust the threshold empirically

---

## Key idea

A threshold is a **business decision**, not a technical one.

Guess‑Rater gives you the score.
You decide where “good enough” starts.