# Quizzes and blind tests

`check()` grades a guess against one or several accepted answers.

```ts
import { check } from 'guess-rater'

check('bohemian rapsody', 'Bohemian Rhapsody')
// { verdict: 'correct', correct: true, close: false, score: 94.12, answer: 'Bohemian Rhapsody' }

check('bohemian', 'Bohemian Rhapsody').verdict         // 'close'
check('we will rock you', 'Bohemian Rhapsody').verdict // 'wrong'
```

## Verdicts

| Verdict | When |
| --- | --- |
| `correct` | score ≥ `threshold` (80) |
| `close` | score ≥ `closeThreshold` (threshold − 15), or the guess is a good chunk (40%+) of the answer |
| `wrong` | anything else, and always for an empty guess |

`close` is there to say "almost!" and let the player try again.

## Song titles and artists

The `music` preset removes what players never type: featurings, versions, bracketed info and leading articles.

```ts
import { createMatcher } from 'guess-rater'

const blindTest = createMatcher({ preset: 'music' })

blindTest.check('get lucky', 'Get Lucky (feat. Pharrell Williams) - Radio Edit').correct // true
blindTest.check('beatles', 'The Beatles').correct          // true
blindTest.check('acdc', 'AC/DC').correct                   // true
blindTest.check('guns and roses', "Guns N' Roses").correct // true
blindTest.check('beyonce', 'Beyoncé').correct              // true
blindTest.check('jackson', 'Michael Jackson').verdict      // 'close'
```

## Several accepted answers

Pass an array; `answer` tells which one was closest.

```ts
blindTest.check('zeppelin', ['Led Zeppelin', 'Zeppelin']).answer // 'Zeppelin'
```

## Title and artist in one guess

`checkAll()` looks for each part anywhere in the guess, so players can give the title, the artist or both, in any order. Score each part separately:

```ts
import { checkAll } from 'guess-rater'

const song = { title: 'Bohemian Rhapsody - Remastered 2011', artist: 'Queen' }

const result = checkAll('bohemian rapsody de queen', song, { preset: 'music' })
result.correct // true: every part was found
result.found   // ['title', 'artist']

checkAll('queen', song, { preset: 'music' }).found // ['artist']

const points = result.found.length // 1 point per part
```

Each entry of `result.parts` is a regular `check()` result, so `result.parts.title.close` tells you to say "almost!". A part can list several accepted answers: `{ artist: ['The Beatles', 'Fab Four'] }`.

## Numbers

Numbers in words, in digits and in roman numerals are the same answer: `2 Become 1` matches `Two Become One`, `rocky 2` matches `Rocky II`, `vingt et un` matches `21`. Turn it off with `numbers: false`.

## Guesses typed in a chat

When players type whole sentences, look for the answer inside the message with `find()`:

```ts
import { find } from 'guess-rater'

const message = "je crois que c'est bohemian rapsody de queen"
const hit = find(message, 'Bohemian Rhapsody')[0]
if (hit) console.log(`Correct! (${hit.text})`)
```

## Tuning

```ts
// Stricter for numbers or very short answers
check(guess, '1984', { threshold: 100 })

// Never say "close"
check(guess, answer, { closeThreshold: 101 })
```

Use `compare()` on real player answers to see where scores land before changing the threshold.
