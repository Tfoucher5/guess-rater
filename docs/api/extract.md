<!-- FILE: docs/api/extract.md -->

# extract()

`extract()` compares one input string against a list of candidates and returns the **top matches**.

It is effectively:

> rank → filter (threshold) → limit (top N)

Designed to be:
- **simple by default** (returns `string[]`)
- **detailed on demand** (entries + optional explain)

---

## Signature

    extract(input, candidates, options?)

---

## Basic usage (default: values only)

By default, it returns a `string[]` containing only the top matching values.

```js
import { extract } from 'guess-rater'

const results = extract('hello', ['hello', 'world'], {
  threshold: 90,
  limit: 3
})

console.log(results) // ['hello']
```

---

## Options

### limit

Maximum number of results to return.

- default: `5`

```js
extract('query', candidates, { limit: 10 })
```

---

### threshold

Minimum score required for a candidate to be included.

- default: `80`

```js
extract('query', candidates, { threshold: 85 })
```

---

### return

Controls the shape of the return value.

- `'values'` (default): returns `string[]`
- `'entries'`: returns ranked objects `{ value, score, index }`

```js
const values = extract('hello', ['hello', 'world'])
// values: string[]

const entries = extract('hello', ['hello', 'world'], { return: 'entries' })
// entries: { value, score, index }[]
```

---

### explain

`explain: true` is only applied when `return: 'entries'`.

- If `return` is `'values'` (default), `explain` is ignored.

```js
const entries = extract('hello', ['hello', 'world'], {
  return: 'entries',
  explain: true
})
```

Each entry then contains the same explain fields as `rate()` (in addition to `value` and `index`).

---

## Relationship with other helpers

- Use `rankCandidates()` when you want **all candidates sorted**
- Use `filterMatches()` when you want **all matches above a threshold**
- Use `extract()` when you want **top N matches above a threshold**
- Use `findBestMatch()` when you want **a single best match**

---

## Key idea

`extract()` is the “top N” helper for list matching:

> rank → filter → take the first N