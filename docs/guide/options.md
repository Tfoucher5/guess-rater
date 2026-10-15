# Options

Every function accepts the same flat options object. All fields are optional.

```ts
similarity(a, b, { preset: 'music', threshold: 85, ignoreWords: ['live'] })
```

## Presets

A preset is a ready-made set of options. Anything you pass yourself wins over it.

| Preset | For | What it sets |
| --- | --- | --- |
| `music` | song titles, artists | `strip: ['featuring', 'version', 'brackets', 'articles']`, `replace: { '&': 'and', '+': 'and', n: 'and' }` |
| `search` | search boxes | `partial: true`, `threshold: 70` |
| `strict` | codes, references | `ignoreWordOrder: false`, `ignoreSpaces: false`, `threshold: 90` |

## Matching

| Option | Default | Effect |
| --- | --- | --- |
| `threshold` | `80` | Minimum score to match. |
| `ignoreWordOrder` | `true` | `john smith` matches `smith john`. |
| `ignoreSpaces` | `true` | `stairwaytoheaven` matches `stairway to heaven`. |
| `partial` | `false` | The shorter text may match a part of the longer one, starting at a word. A full match always scores higher. |
| `algorithm` | `'smart'` | See [How it works](/guide/how-it-works#algorithms). |

## Normalization

Before comparing, both texts are cleaned up. [`normalize()`](/api/#normalize) shows the result.

| Option | Default | Effect |
| --- | --- | --- |
| `caseSensitive` | `false` | Keep `A` and `a` apart. |
| `accentSensitive` | `false` | Keep `é` and `e` apart. Otherwise ligatures are expanded too: `œ` → `oe`, `ß` → `ss`. |
| `punctuation` | `'space'` | `'space'`: `saint-malo` → `saint malo`. `'remove'`: → `saintmalo`. `'keep'`: untouched. Apostrophes are removed outright: `don't` → `dont`. |
| `strip` | `[]` | Noise to drop, see below. |
| `replace` | `{}` | Whole-word replacements: `{ st: 'saint', nyc: 'new york city' }`. `st` never touches `stairs`. |
| `ignoreWords` | `[]` | Whole words to drop: `['inc', 'ltd', 'sarl']`. |

### `strip` rules

| Rule | Example |
| --- | --- |
| `featuring` | `Get Lucky (feat. Pharrell)` → `get lucky` |
| `version` | `Hey Jude - Remastered 2015` → `hey jude`, `Song (Live)` → `song` |
| `brackets` | `Song [Bonus] (2012)` → `song` |
| `articles` | `The Beatles` → `beatles`, `L'Aventurier` → `aventurier` |

A rule never empties a text: `(Intro)` stays `intro`.

## Thresholds

| Threshold | Feels like |
| --- | --- |
| 95+ | Same text, maybe one typo in a long one |
| 85 | A typo or two, good for strict answers |
| **80** | Default: forgiving but rarely wrong |
| 70 | Loose, good for search |

Short texts move fast: one typo in a 4-letter word already costs 25 points. Use `check()`'s `close` verdict to be kind without accepting wrong answers.
