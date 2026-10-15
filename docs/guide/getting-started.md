# Getting started

## Install

```sh
npm install guess-rater
```

Works with ES modules (`import`) and CommonJS (`require`), in Node 18+ and every modern browser or bundler. Types are included.

## Compare two texts

```ts
import { similarity, isMatch } from 'guess-rater'

similarity('Molière', 'moliere')                      // 100
similarity('stairway to heven', 'Stairway to Heaven') // 94.44
similarity('Smith John', 'John Smith')                // 100
similarity('Paris', 'Tokyo')                          // 0

isMatch('color', 'colour')     // true  (83.33 ≥ 80)
isMatch('color', 'colour', 90) // false
```

Scores go from **0** (nothing in common) to **100** (identical once normalized). Two texts match when the score reaches the **threshold**, 80 by default.

## Pick the function for your use case

| You want to… | Use |
| --- | --- |
| Grade an answer in a quiz or a blind test | [`check()`](/recipes/quiz) |
| Filter a list as the user types | [`search()` / `createIndex()`](/recipes/search) |
| Suggest a correction | [`closest()`](/recipes/did-you-mean) |
| Merge duplicates in a dataset | [`dedupe()` / `group()`](/recipes/data-cleaning) |
| Spot a title or a name inside a sentence | [`find()`](/recipes/find-in-text) |
| Highlight what matched in a result | [`highlight()`](/recipes/search#highlight-what-matched) |
| Know how similar two texts are | `similarity()`, `isMatch()` |
| Understand a score | `compare()` |

## Reuse a configuration

When the same options are used many times, create a matcher. Options are validated and compiled once.

```ts
import { createMatcher } from 'guess-rater'

const quiz = createMatcher({ preset: 'music', threshold: 85 })

quiz.check('beatles', 'The Beatles').verdict // 'correct'
quiz.similarity('Hey Jude - Remastered', 'hey jude') // 100
quiz.search('queen', songs, { keys: 'artist' })
```

## Work with objects

List functions accept strings or objects. With objects, tell them where the text is with `keys`: a property, several properties, or a function. TypeScript only lets you name properties that hold text.

```ts
interface Song { title: string; artist: string; aliases?: string[]; year: number }

search('queen', songs, { keys: ['title', 'artist', 'aliases'] }) // ✅
search('queen', songs, { keys: (song) => `${song.title} ${song.artist}` }) // ✅
search('queen', songs) // ❌ keys is required for objects
search('queen', songs, { keys: ['year'] }) // ❌ year is not text
search('queen', songs, { keys: ['title', { name: 'artist', weight: 0.8 }] }) // ✅ artist counts less
```

Each result is a `Match`: `{ item, score, index, text }`, where `text` is the value that produced the score.

Next: [Options](/guide/options).
