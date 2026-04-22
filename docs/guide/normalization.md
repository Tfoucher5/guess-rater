# Normalization

Normalization runs **before** any scoring algorithm. It removes formatting noise so that semantically identical strings match regardless of their presentation.

```js
// All of these score 100 with default normalization:
rate('Molière', 'moliere')
rate('Saint-Nazaire', 'saint nazaire')
rate('APPLE INC.', 'apple inc')
```

Normalization is controlled by the `normalize` option, available on all scoring functions:

```js
rate(a, b, { normalize: { ... } })
isMatch(a, b, { normalize: { ... } })
```

---

## Options reference

| Option | Type | Default | Effect |
|---|---|---|---|
| `caseSensitive` | `boolean` | `false` | Keep original casing |
| `removeAccents` | `boolean` | `true` | `é→e`, `ç→c`, `ô→o` |
| `removePunctuation` | `boolean` | `true` | Remove punctuation |
| `punctuationStrategy` | `'space' \| 'remove'` | `'space'` | Replace with space or delete |
| `trim` | `boolean` | `true` | Remove leading/trailing whitespace |
| `collapseWhitespace` | `boolean` | `true` | Collapse multiple spaces |
| `replacements` | `Record<string, string>` | `{}` | Substitute substrings before matching |
| `removeWords` | `string[]` | `[]` | Remove stop words entirely |
| `sortTokens` | `boolean` | `false` | Sort words alphabetically (order-agnostic) |

---

## caseSensitive

Default: `false` — strings are lowercased before comparison.

```js
rate('Hello', 'hello')                                   // 100
rate('Hello', 'hello', { normalize: { caseSensitive: true } }) // lower score
```

Only disable the default if case is semantically meaningful (e.g., code identifiers).

## removeAccents

Default: `true` — diacritics are stripped.

```js
rate('Héloïse', 'heloise') // 100
rate('Ångström', 'angstrom') // 100
```

## removePunctuation / punctuationStrategy

Default: remove punctuation, replacing it with a space.

```js
rate('Saint-Nazaire', 'saint nazaire') // 100  (hyphen → space)
rate('hello, world!', 'hello world')   // 100
```

`punctuationStrategy: 'remove'` deletes punctuation entirely (no space replacement). Prefer `'space'` for natural language — it preserves word boundaries.

## trim / collapseWhitespace

Enabled by default. Strips outer whitespace and collapses runs of spaces.

```js
rate('  hello   world  ', 'hello world') // 100
```

## replacements

Substitutes substrings before scoring. Useful for abbreviations, aliases, or known typos.

```js
rate('J. Smith', 'John Smith', {
  normalize: { replacements: { 'j.': 'john', 'j ': 'john ' } }
}) // 100

rate('NYC', 'New York City', {
  normalize: { replacements: { nyc: 'new york city' } }
}) // 100
```

Replacements are case-insensitive after the initial lowercasing step.

## removeWords

Removes specific words from both strings before scoring. Useful for stop words or noise tokens.

```js
rate('le café de paris', 'café de paris', {
  normalize: { removeWords: ['le', 'la', 'les', 'de'] }
}) // 100
```

## sortTokens

Sorts all words alphabetically before comparing. Makes word order irrelevant without switching algorithm.

```js
rate('Jean Paul Dupont', 'Dupont Jean Paul', {
  normalize: { sortTokens: true }
}) // 100
```

This is similar to the `tokenSort` algorithm, but applied at the normalization level — available to any algorithm including `hybrid`.

---

## Common presets

**Person names**
```js
{
  removeAccents: true,
  removePunctuation: true,
  sortTokens: true
}
```

**Product titles**
```js
{
  removePunctuation: true,
  collapseWhitespace: true,
  removeWords: ['the', 'a', 'an']
}
```

**Strict identifiers** (codes, references)
```js
{
  caseSensitive: true,
  removeAccents: false,
  removePunctuation: false
}
```

---

## Using normalize() standalone

To inspect normalization output or pre-clean data:

```js
import { normalize } from 'guess-rater'

normalize('Héloïse Saint-Exupéry')
// 'heloise saint exupery'

normalize('  APPLE INC.  ', { removePunctuation: true, collapseWhitespace: true })
// 'apple inc'
```

→ [normalize() reference](/api/normalize)

---

> **Normalization is not "right" or "wrong".** It reflects your domain's definition of equivalence. Always test on real data.
