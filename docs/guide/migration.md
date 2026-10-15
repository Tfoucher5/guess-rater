# Upgrading from v1

v2 is a rewrite: fewer functions, flat options, stable return types and a smarter default score.

## Functions

| v1 | v2 |
| --- | --- |
| `rate(a, b)`, `getSimilarityScore(a, b)` | `similarity(a, b)` |
| `rate(a, b, { explain: true })` | `compare(a, b)` |
| `isMatch(a, b, 85)` | unchanged |
| `findBestMatch(q, list)` | `closest(q, list)`, returns `undefined` below the threshold |
| `rankCandidates(q, list)` | `search(q, list, { threshold: 0 })` |
| `filterMatches(q, list)` | `search(q, list).map((m) => m.item)` |
| `extract(q, list, { limit })` | `search(q, list, { limit }).map((m) => m.item)` |
| `createMatcher(options)` | unchanged, with more methods |
| `normalize`, `normalizeString` | `normalize` |
| `getLevenshteinDistance` | `levenshtein` |
| `getJaroWinklerScore(a, b)` | `jaroWinkler(a, b) * 100` |

List results are now `{ item, score, index, text }` (`value` became `item`).

## Options

Options are flat: the `normalize: { ... }` block is gone.

| v1 | v2 |
| --- | --- |
| `algorithm: 'hybrid'` | default `smart` |
| `spaceInsensitive: true` | default (`ignoreSpaces: true`) |
| `normalize.sortTokens: true` | default (`ignoreWordOrder: true`) |
| `normalize.caseSensitive` | `caseSensitive` |
| `normalize.removeAccents: false` | `accentSensitive: true` |
| `normalize.removePunctuation: false` | `punctuation: 'keep'` |
| `normalize.punctuationStrategy` | `punctuation: 'space' \| 'remove'` |
| `normalize.replacements` | `replace` (whole words only) |
| `normalize.removeWords` | `ignoreWords` |
| `return: 'entries'`, `explain` on lists | always entries; use `compare()` to explain |

## Scores

`smart` tolerates swapped letters, word order and missing spaces, so similar texts generally score higher than with v1's `levenshtein`. Re-check thresholds on a few real examples with `compare()`.

## Behavior fixes

- `replace` used to replace inside words (`st → saint` turned `stairs` into `saintairs`). It now replaces whole words only.
- Two texts made only of punctuation used to score 100. An empty guess is now always `wrong` in `check()`.
- Non-string inputs (`null`, `undefined`, numbers) no longer throw: they are read as text.
