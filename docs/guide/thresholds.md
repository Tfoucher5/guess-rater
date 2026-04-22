# Thresholds

A threshold defines when a score is considered a match: `match = score >= threshold`.

The default threshold is **80**. It works well for general-purpose matching after standard normalization.

---

## Where thresholds appear

**In `isMatch()`** — determines the return value:
```js
isMatch('hello', 'helo', 85) // false — score ~88... actually true, use a real example
isMatch('color', 'colour', 95) // false — score ~91
isMatch('color', 'colour', 90) // true
```

**In `rate()` with `explain: true`** — populates the `match` field:
```js
const result = rate('hello', 'helo', { threshold: 85, explain: true })
result.match // true if score >= 85
```

**In list helpers** — filters results:
```js
filterMatches('iphone', candidates, { threshold: 75 })
extract('iphone', candidates, { threshold: 75, limit: 3 })
```

---

## Choosing a threshold

| Domain | Recommended threshold | Rationale |
|---|---|---|
| Person names | 85–92 | Typos + nicknames, avoid false positives |
| Product titles | 72–82 | Extra words / model numbers common |
| Quiz answers | 80–90 | Tolerant of typos, strict on intent |
| Data deduplication | 88–95 | Prefer false negatives over false positives |
| Free-text search | 65–78 | Broad tolerance expected |
| Strict identifiers | 95–100 | No tolerance |

These are starting points. **Always test on real data** — domain-specific noise matters more than any rule of thumb.

---

## Normalization affects effective threshold

Good normalization allows a **higher threshold** to be safe. If you skip accent removal and token sorting, a score of 88 might mean two strings that are actually identical.

```js
// Bad: normalization off, threshold too low
isMatch('Jean-Paul Dupont', 'jean paul dupont', {
  normalize: { removeAccents: false },
  threshold: 70
})

// Good: normalization handles accents and order, threshold can be strict
isMatch('Jean-Paul Dupont', 'jean paul dupont', {
  normalize: { removeAccents: true, sortTokens: true },
  threshold: 90
})
```

---

## Calibrating with explain mode

Use `explain: true` during development to understand what scores look like across your data:

```js
rate('Peugeot 208', '208 Peugeot Active', { algorithm: 'tokenSort', explain: true })
// { score: 84, match: true, ... }
```

Once you've seen real score distributions, set the threshold at the natural gap between matches and non-matches.

→ [Explain mode](/guide/explain-mode)
