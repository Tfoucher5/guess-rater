# Troubleshooting

This page lists the most common mistakes and questions when using Guess‑Rater,
along with clear explanations and fixes.

If something looks “weird”, it is usually expected behavior once understood.

---

## “explain: true does not work”

### Problem

You enabled `explain: true` but your comparisons behave strangely.

### Cause

When `explain: true` is enabled, `rate()` returns an **object**, not a number.

Incorrect usage:

```js
if (rate(a, b, { explain: true }) >= 80) {
  ...
}
```

### Fix

```js
const result = rate(a, b, { explain: true })

if (result.score >= 80) {
  ...
}
```

---

## “isMatch() does not return details”

### Explanation

`isMatch()` is a **boolean helper** by design.

It answers:
> “Do these strings match according to the threshold?”

If you need details, use `rate()` with `explain: true`.

---

## “createMatcher() returns strange options like 0:'a', 1:'b'…”

### Problem

You see unexpected numeric keys in the matcher options.

### Cause

You passed a **string** instead of an options object to `createMatcher()`.

Incorrect usage:

```js
createMatcher('john', 'smith', options)
```

JavaScript treats strings as array‑like objects.

### Fix

```js
const matcher = createMatcher(options)
matcher.rate('john', 'smith')
```

---

## “Scores are lower than expected”

### Common causes

- `caseSensitive: true`
- missing `sortTokens`
- overly strict threshold
- wrong algorithm for the use‑case

### Example

```js
rate('SAINT-MICHEL', 'saint michel', {
  normalize: { caseSensitive: true }
})
```

This will penalize casing differences.

### Fix

```js
rate('SAINT-MICHEL', 'saint michel', {
  normalize: { caseSensitive: false }
})
```

---

## “sortTokens changes my results”

### Explanation

`sortTokens: true` makes **word order irrelevant**.

This is great for:
- names
- products
- cities

It is not suitable for:
- IDs
- codes
- sentences where order matters

Disable it when order carries meaning.

---

## “Hybrid scores look inconsistent”

### Explanation

Hybrid combines multiple algorithms.
If one algorithm strongly disagrees, it can influence the final score.

### Solution

Use `explain: true` to inspect the breakdown:

```js
const result = rate(a, b, {
  algorithm: 'hybrid',
  explain: true
})

console.log(result.details.hybrid)
```

Then tune the weights if necessary.

---

## “Threshold feels wrong”

### Explanation

Thresholds are **domain‑specific**.

Do not blindly reuse the default value.

### Recommended approach

1. Enable `explain: true`
2. Test on real data
3. Observe score distribution
4. Adjust threshold empirically

---

## “Matching works locally but not in production”

### Checklist

- same normalization options?
- same threshold?
- same algorithm?
- same language / locale?
- same input preprocessing?

Differences in any of these will change results.

---

## “I want different behavior”

### Good news

Guess‑Rater is intentionally **generic and extensible**.

If the current behavior does not fit your needs, you can:

- change normalization rules
- change algorithm
- tune hybrid weights
- wrap Guess‑Rater in your own logic
- propose improvements via pull requests

---

## Key idea

Most issues are not bugs.

They are usually a mismatch between:
- what the algorithm measures
- and what you expect similarity to mean

Use normalization, explain mode, and thresholds to align the two.