# isMatch()

Returns `true` if the similarity score meets the threshold. Always returns a boolean — `explain` has no effect here.

## Signature

```ts
isMatch(left: string, right: string, thresholdOrOptions?: number | RateOptions): boolean
```

## Usage

```js
import { isMatch } from 'guess-rater'

// Numeric threshold shorthand
isMatch('Saint-Nazaire', 'saint nazaire', 85) // true
isMatch('cat', 'dog', 90)                     // false

// Options object
isMatch('hello', 'helo', {
  threshold: 90,
  algorithm: 'jaroWinkler'
}) // true
```

## Options

All [rate() options](/api/rate#options) are accepted. Default threshold: **80**.

> `explain: true` is silently ignored — `isMatch()` always returns a boolean. Use `rate(..., { explain: true })` if you need details.

## Equivalent to

```js
isMatch(a, b, threshold) ≈ rate(a, b) >= threshold
```

## See also

- [rate()](/api/rate) — returns the raw score or explain object
- [Thresholds guide](/guide/thresholds) — choosing the right threshold
