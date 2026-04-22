# rate()

Computes the similarity between two strings and returns a score from **0 to 100**.

## Signature

```ts
rate(left: string, right: string, options?: RateOptions): number
rate(left: string, right: string, options: RateOptions & { explain: true }): RateExplainResult
```

## Basic usage

```js
import { rate } from 'guess-rater'

rate('Molière', 'moliere')             // 100
rate('levenshtein', 'levenstein')      // ~88
rate('Saint-Nazaire', 'saint nazaire') // 100
rate('cat', 'dog')                     // low
```

## Options

| Option | Default | Description |
|---|---|---|
| `algorithm` | `'levenshtein'` | Matching strategy. → [Algorithms](/guide/algorithms) |
| `threshold` | `80` | Used in `match` field when `explain: true`. → [Thresholds](/guide/thresholds) |
| `explain` | `false` | Return full breakdown object. → [Explain mode](/guide/explain-mode) |
| `spaceInsensitive` | `false` | Also compare with spaces removed; keeps best score. → [spaceInsensitive](/guide/algorithms#spaceinsensitive) |
| `normalize` | — | Normalization pipeline. → [Normalization](/guide/normalization) |
| `hybrid` | — | Custom weights per sub-algorithm. → [Hybrid](/guide/algorithms#hybrid) |
| `jaroWinkler` | — | `{ prefixScale, maxPrefixLength }` |
| `tokenSort` | — | `{ baseAlgorithm }` |
| `tokenSet` | — | `{ baseAlgorithm }` |

## Examples

**Custom algorithm**
```js
rate('John Smith', 'Smith, John', { algorithm: 'tokenSort' }) // 100
```

**Custom normalization**
```js
rate('J. Smith', 'John Smith', {
  normalize: { replacements: { 'j.': 'john' } }
}) // 100
```

**spaceInsensitive**
```js
rate('stairwaytoheaven', 'stairway to heaven', {
  algorithm: 'levenshtein',
  spaceInsensitive: true
}) // 100
```

**explain mode**
```js
const result = rate('hello', 'helo', { explain: true })
// {
//   score: 88, match: true, threshold: 80,
//   algorithm: 'levenshtein',
//   input: 'hello', target: 'helo',
//   normalizedLeft: 'hello', normalizedRight: 'helo',
//   details: { normalize: {...} }
// }
```

## Alias

`getSimilarityScore()` is an alias for `rate()`.

## See also

- [isMatch()](/api/isMatch) — boolean version
- [Algorithms guide](/guide/algorithms) — choosing the right algorithm
- [Explain mode](/guide/explain-mode) — understanding the output
