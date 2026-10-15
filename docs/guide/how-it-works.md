# How it works

## The `smart` score

1. **Normalize** both texts: lower case, no accents, no punctuation, single spaces, plus your `strip`, `replace` and `ignoreWords`.
2. **Characters**: Damerau-Levenshtein distance, turned into a score with `(1 - distance / longest length) × 100`. A swapped pair of letters (`teh` / `the`) counts as a single typo.
3. **Word order** (`ignoreWordOrder`): the same, with words sorted.
4. **Spaces** (`ignoreSpaces`): the same, with spaces removed.
5. **Partial** (`partial`): the shorter text is matched against the start of any word of the longer one, or word by word in any order. The result is weighted by how much of the longer text it covers, so a full match always ranks first.

The final score is the best of these. `compare()` shows each of them:

```ts
compare('Smith Jon', 'John Smith')
// { score: 90, a: 'smith jon', b: 'john smith', scores: { characters: 10, wordOrder: 90 }, ... }
```

## Algorithms

`smart` is right for almost everything. The others exist for specific needs:

| `algorithm` | Use when |
| --- | --- |
| `smart` | Default. |
| `damerau` | Order and spaces matter, swapped letters count once. |
| `levenshtein` | You need the textbook edit distance. |
| `jaroWinkler` | Short strings where the beginning matters most, such as names. |
| `tokenSort` | Only word order should be ignored. |
| `tokenSet` | Extra words should not matter: a subset scores 100. |

The raw distances are exported too, without normalization: `levenshtein(a, b)`, `damerau(a, b)` and `jaroWinkler(a, b)`.

## Performance

- Distances use bit-parallel algorithms (Myers, Hyyrö) for texts up to 32 characters, and skip common prefixes and suffixes.
- Options are compiled once per `createMatcher()`, `createIndex()`, or options object you reuse.
- List functions normalize the query once and skip candidates whose length alone rules them out.
- `createIndex()` normalizes the list once; each search only scores the query.

Run `npm run bench` in the repository to measure on your machine.
