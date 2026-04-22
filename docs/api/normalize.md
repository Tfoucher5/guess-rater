# normalize()

Applies the normalization pipeline to a string **without computing any score**. Returns the cleaned string.

## Signature

```ts
normalize(input: string, options?: NormalizeOptions): string
```

## Usage

```js
import { normalize } from 'guess-rater'

normalize('Héloïse Saint-Exupéry')
// 'heloise saint exupery'

normalize('  APPLE INC.  ')
// 'apple inc'

normalize('John-Paul Smith', { sortTokens: true })
// 'john paul smith'  (sorted: john paul smith → john paul smith)
```

Returns an empty string if the input is not a string.

## Options

All normalization options are described in the [Normalization guide](/guide/normalization).

## Use cases

- **Inspect transformations** during development
- **Pre-normalize** a dataset once before looping comparisons
- **Store normalized values** to avoid repeated computation
- **Build custom matching logic** using the same normalization as `rate()`

## Example: normalize before bulk comparison

```js
const normalizedCatalog = catalog.map(title => normalize(title))

for (const input of userInputs) {
  const normalizedInput = normalize(input)
  // compare normalizedInput against normalizedCatalog with a custom scorer
}
```

## Alias

`normalizeString()` is an alias for `normalize()`.

## See also

- [Normalization guide](/guide/normalization) — all options explained
- [rate()](/api/rate) — applies normalization internally before scoring
