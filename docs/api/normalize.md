# normalize()

`normalize()` applies the normalization pipeline **without computing any score**.

It is useful when you want to clean or standardize text using the same rules
that are used internally by `rate()` and other helpers.

---

## Signature

```js
normalize(input, options?)
```

---

## Basic usage

```js
import { normalize } from 'guess-rater'

const result = normalize('HELLO, WORLD!')
console.log(result)
```

---

## Using normalization options

You can pass the same normalization options used by `rate()`.

```js
import { normalize } from 'guess-rater'

const result = normalize('The Quick-Brown Fox', {
  removeWords: ['the'],
  removePunctuation: true,
  sortTokens: true
})

console.log(result)
```

---

## Returned value

`normalize()` always returns a **string**.

If the input is not a string, it returns an empty string.

```
normalize(null)      → ""
normalize(undefined) → ""
```

---

## What normalize() does NOT do

`normalize()` does **not**:

- compute a similarity score
- apply an algorithm
- evaluate a threshold
- return explain details

It only performs **text preprocessing**.

---

## Typical use-cases

Use `normalize()` when you want to:

- inspect how inputs are transformed
- debug normalization behavior
- pre-clean datasets
- store normalized values
- reduce repeated normalization costs
- build your own matching logic

---

## Example: dataset preprocessing

```js
import { normalize } from 'guess-rater'

const rawValues = [
  'Hello, World!',
  'world hello',
  'The-World: Hello'
]

const normalizedValues = rawValues.map(value =>
  normalize(value, {
    removeWords: ['the'],
    removePunctuation: true,
    sortTokens: true
  })
)

console.log(normalizedValues)
```

---

## Relationship with rate()

Internally, `rate()` calls `normalize()` before comparing strings.

Using `normalize()` directly allows you to:

- understand the normalization pipeline
- reuse normalized values
- avoid recomputing normalization multiple times

---

## Key idea

`normalize()` exposes the **first stage** of the Guess-Rater pipeline.

It is especially useful for data cleaning, preprocessing, and debugging.
