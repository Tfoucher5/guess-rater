# isMatch()

`isMatch()` is a convenience helper built on top of `rate()`.

It answers one simple question:

> “Do these two strings match according to a threshold?”

---

## Important behavior

`isMatch()` **always returns a boolean**.

- It does **not** return a score
- It does **not** return explain details
- The `explain` option is **ignored**

If you need details, you must use `rate()` instead.

---

## Signature

```js
isMatch(leftInput, rightInput, thresholdOrOptions?)
```

---

## Basic usage

```js
import { isMatch } from 'guess-rater'

const ok = isMatch('John Smith', 'Smith John', 85)
console.log(ok)
```

Return value is strictly:

```js
true | false
```

---

## Using options instead of a numeric threshold

You can pass an options object instead of a number.

```js
import { isMatch } from 'guess-rater'

const ok = isMatch('John Smith', 'Smith John', {
  threshold: 85,
  normalize: {
    sortTokens: true
  }
})

console.log(ok)
```

Internally, `isMatch()` computes a score and compares it to the threshold.

---

## About explain mode

Passing `explain: true` to `isMatch()` **has no effect**.

```js
isMatch('a', 'b', { explain: true })
```

This still returns:

```js
true | false
```

Explain mode exists only on `rate()`.

---

## Correct way to get explain details

If you need details, use `rate()` instead:

```js
import { rate } from 'guess-rater'

const result = rate('John Smith', 'Smith John', {
  explain: true,
  threshold: 85
})

console.log(result.score)
console.log(result.match)
console.log(result.normalizedLeft)
console.log(result.normalizedRight)
```

---

## Comparison with rate()

`isMatch()` is equivalent to:

```js
const result = rate(a, b, { threshold })
return result >= threshold
```

It is intentionally minimal and opinionated.

---

## When to use isMatch()

Use `isMatch()` when:

- you only need a yes / no answer
- you are validating user input
- you are checking quiz answers
- you want simple conditional logic

Do **not** use it when:

- you need a score
- you need explain details
- you are debugging or tuning

---

## Common mistakes

### Expecting explain data

Incorrect:

```js
isMatch('a', 'b', { explain: true }).score
```

Correct:

```js
rate('a', 'b', { explain: true }).score
```

---

## Key idea

`isMatch()` is a **decision helper**.

If you want insight, transparency, or tuning:
use `rate()`.