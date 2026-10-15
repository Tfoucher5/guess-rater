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

## Tuning

```ts
// Stricter for numbers or very short answers
check(guess, '1984', { threshold: 100 })

// Never say "close"
check(guess, answer, { closeThreshold: 101 })
```

Use `compare()` on real player answers to see where scores land before changing the threshold.
