# findBestMatch()

`findBestMatch()` compares one input string against a list of candidates
and returns **only the best match**.

It is a convenience helper built on top of `rankCandidates()`.

---

## Signature

```js
findBestMatch(input, candidates, options?)
```

---

## Parameters

### input

Type: `string`

The reference string to compare against.

---

### candidates

Type: `string[]`

An array of candidate strings.

---

### options

Type: `object` (optional)

Same options as `rate()`:
- algorithm
- normalization
- threshold
- explain
- hybrid weights

---

## Basic usage

```js
import { findBestMatch } from 'guess-rater'

const best = findBestMatch(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown']
)

console.log(best)
```

---

## Returned value

If the candidates array is not empty, the function returns an object:

```json
{
  value: 'John Smyth',
  score: 91.2,
  index: 1
}
```

If the candidates array is empty, it returns:

```json
null
```

---

## Using normalization

```js
import { findBestMatch } from 'guess-rater'

const best = findBestMatch(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown'],
  {
    normalize: {
      sortTokens: true
    }
  }
)

console.log(best)
```

Normalization is applied before scoring.

---

## Using explain mode

When `explain: true` is enabled, the returned object includes
the same explain details as `rate()`.

```js
import { findBestMatch } from 'guess-rater'

const best = findBestMatch(
  'john smith',
  ['Smith J.', 'John Smyth', 'Alice Brown'],
  {
    algorithm: 'hybrid',
    explain: true
  }
)

console.log(best)
```

Returned object then contains:
- `score`
- `match`
- `normalizedLeft`
- `normalizedRight`
- `details`

---

## Relationship with rankCandidates()

`findBestMatch()` is equivalent to:

```js
rankCandidates(input, candidates, options)[0] || null
```

Use it when you only care about the **top result**.

---

## Performance notes

`findBestMatch()` still performs one comparison per candidate.

For repeated calls:
- reuse configuration with `createMatcher()`
- consider pre‑normalizing static data

---

## Typical use‑cases

- selecting the best suggestion
- fuzzy search autocomplete
- quiz answer validation
- matching user input to known values

---

## Key idea

`findBestMatch()` trades visibility for simplicity.

If you need full insight, use `rankCandidates()`.