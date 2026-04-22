<!-- FILE: docs/api/filterMatches.md -->

# filterMatches()

filter a list of candidates and keeps only the items that score **at or above a threshold**.

It is designed to be:

- **simple by default** (returns `string[]`)
- **more detailed on demand** (return ranked entries, optionally with `explain`)

---

## Signature

```js
filterMatches(input, candidates, options?)
```

---

## Basic usage (default: values only)

By default, it returns a `string[]` containing only the matching candidate values.

```js
import { filterMatches } from 'guess-rater'

const results = filterMatches('hello', ['hello', 'world'], {
    threshold: 90
})

console.log(results) // ['hello']
```

---

## Options

### threshold

Minimum score required for a candidate to be included.

- default: `80`

    filterMatches('query', candidates, { threshold: 85 })

---

### return

Controls the shape of the return value.

- `'values'` (default): returns `string[]`
- `'entries'`: returns ranked objects `{ value, score, index }`

    const values = filterMatches('hello', ['hello', 'world'])
    // values: string[]

    const entries = filterMatches('hello', ['hello', 'world'], { return: 'entries' })
    // entries: { value, score, index }[]

---

### explain

`explain: true` is only applied when `return: 'entries'`.

- If `return` is `'values'` (default), `explain` is ignored.

    const entries = filterMatches('hello', ['hello', 'world'], {
      return: 'entries',
      explain: true
    })

Each entry then contains the same explain fields as `rate()` (in addition to `value` and `index`).

---

## Return values

### Default (`return: 'values'`)

Returns:

```js
string[]
```

---

### Detailed (`return: 'entries'`)

Returns:

```
Array<{ value: string, score: number, index: number }>
```

---

### Detailed + explain (`return: 'entries', explain: true`)

Returns:

```
Array<{
    value: string,
    index: number,
    score: number,
    match: boolean,
    threshold: number,
    algorithm: string,
    input: string,
    target: string,
    normalizedLeft: string,
    normalizedRight: string,
    details: object
}>
```

---

## Relationship with other helpers

- Use `rankCandidates()` when you need **all candidates sorted** by score
- Use `findBestMatch()` when you need **only the top result**
- Use `filterMatches()` when you need **only candidates above a threshold**

---

## Key idea

`filterMatches()` is the “pandas-like” helper for string matching:

> rank → filter → (optionally) inspect details


