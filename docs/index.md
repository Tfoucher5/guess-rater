---
layout: home

hero:
  name: guess-rater
  text: Fuzzy matching that just works
  tagline: Check answers, search as you type, spot names in a message, clean up duplicates, match two lists. Typos, accents, word order, numbers in words and noise like "(feat. X)" are handled for you.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Try it below
      link: '#try-it'
    - theme: alt
      text: GitHub
      link: https://github.com/Tfoucher5/guess-rater

features:
  - icon: 🎯
    title: Right by default
    details: One smart score that forgives typos, swapped letters, accents, word order and missing spaces. On 3,000 simulated blind-test guesses, 97.6% of right answers were accepted and 0% of wrong ones.
  - icon: 🧰
    title: One function per job
    details: check() and checkAll() grade answers, search() and createIndex() power search boxes, closest() suggests corrections, find() spots text in a message, dedupe() and join() clean data.
  - icon: ⚡
    title: Fast
    details: Bit-parallel edit distances and pre-built indexes. Searching 26,000 songs takes about 40 ms per keystroke, about 5 times faster than Fuse.js on the same data.
  - icon: 🧠
    title: Your editor knows it
    details: Written in TypeScript. Every option autocompletes, and with objects, keys only accepts properties that hold text.
  - icon: 🪶
    title: Tiny
    details: About 6 kB minified and gzipped, zero dependencies. ESM and CommonJS, Node 18+ and every browser.
  - icon: 🎵
    title: Presets for real data
    details: The music preset drops featurings, "Remastered 2011", "(Live)" and leading articles. search turns on prefix matching. strict keeps order and spaces.
---

<div class="home-section" id="try-it">

## Try it

<p class="lead">This runs the real library in your browser. Edit anything.</p>

<Playground />

</div>

<div class="home-section">

## One line per use case

<p class="lead">No configuration to learn before the first result.</p>

<div class="home-grid">
<div class="home-card">

### Quizzes and blind tests

```ts
check('bohemian rapsody', 'Bohemian Rhapsody')
// → { verdict: 'correct', score: 94.12 }
checkAll('bohemian rapsody de queen',
  { title: 'Bohemian Rhapsody', artist: 'Queen' })
// → { correct: true, found: ['title', 'artist'] }
```

</div>
<div class="home-card">

### Search as you type

```ts
const index = createIndex(songs, {
  keys: ['title', 'artist'],
  preset: 'search',
})
index.search('zep stair') // → Stairway to Heaven
```

</div>
<div class="home-card">

### "Did you mean…?"

```ts
closest('javascrpt', ['java', 'javascript'])
// → { item: 'javascript', score: 90 }
```

</div>
<div class="home-card">

### Spot a name in a message

```ts
find("c'est bohemian rapsody non ?",
     'Bohemian Rhapsody')
// → [{ text: 'bohemian rapsody', start: 6 }]
```

</div>
<div class="home-card">

### Highlight what matched

```ts
highlight('Bohemian Rhapsody', 'bohem')
// → [{ text: 'Bohem', match: true },
//    { text: 'ian Rhapsody', match: false }]
```

</div>
<div class="home-card">

### Clean up duplicates

```ts
dedupe(['Hey Jude', 'hey jude - Remastered'],
       { preset: 'music' })
// → ['Hey Jude']
```

</div>
<div class="home-card">

### Match two lists

```ts
join(['Apple Inc.', 'Microsoft Corp'],
     ['MICROSOFT CORPORATION', 'Apple'],
     { ignoreWords: ['inc', 'corp', 'corporation'] })
// → each row with its best match
```

</div>
<div class="home-card">

### Numbers, any way they're written

```ts
similarity('2 Become 1', 'Two Become One') // → 100
check('rocky 2', 'Rocky II').correct       // → true
```

</div>
</div>

</div>

<div class="home-section home-table">

## Measured on real data

<p class="lead">Public datasets, simulated typos, reproducible with <code>npm run bench:real</code>. Node 22 on a shared cloud VM; your numbers will differ.</p>

| Blind test: 26,230 Spotify tracks, 3,000 player guesses with typos | Result |
| --- | --- |
| Right guesses accepted, `check()` with the `music` preset | **97.6 %** |
| Wrong songs accepted | **0 %** |
| Same guesses with guess-rater 1.x `isMatch()` | 70.1 % |
| Same guesses with string-similarity (≥ 0.8) | 57.0 % |
| Time per `check()` | ~25 µs |

| Search and suggestions | Result |
| --- | --- |
| Search 26,230 songs by title and artist from a partial query: wanted song in top 10 | 82.3 % in **~40 ms** (Fuse.js: 85.7 % in ~240 ms) |
| Find a city among 150,653 names, with a typo and no accents (top 5) | **100 %** in ~70 ms |
| Correct a one-typo word among the 20,000 most frequent English words (top 3) | **98.9 %** in ~6 ms |

</div>

<div class="home-section">

## Simpler than v1

<p class="lead">Fewer concepts, flat options, one return type per function.</p>

<div class="home-grid">
<div class="home-card">

### Before (v1)

```js
const best = findBestMatch(guess, answers, {
  algorithm: 'hybrid',
  threshold: 85,
  normalize: { removeWords: ['feat', 'remastered'] },
})
const ok = best !== null && best.score >= 85
```

</div>
<div class="home-card">

### After (v2)

```js
const { correct } = check(guess, answers, {
  preset: 'music',
})
```

</div>
</div>

[Upgrading from v1](/guide/migration) maps every old function and option.

</div>

<div class="home-section" style="padding-bottom: 64px">

## Install

```sh
npm install guess-rater
```

```ts
import { check, checkAll, search, closest, find, highlight, dedupe, join } from 'guess-rater'
```

</div>
