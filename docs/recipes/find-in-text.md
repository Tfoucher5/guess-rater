# Spot names in a text

`find()` looks for fuzzy occurrences of a query inside a longer text and tells you where they are.

```ts
import { find } from 'guess-rater'

find("je crois que c'est bohemian rapsody de queen", 'Bohemian Rhapsody')
// [{ text: 'bohemian rapsody', start: 19, end: 35, score: 94.12 }]
```

Positions refer to the original text, so `message.slice(start, end)` is exactly what was written.

## Ideas

- **Chat games**: accept an answer typed in the middle of a sentence.
- **Moderation**: catch a banned word written with typos or accents.
- **Mentions**: detect a product, a city or a person in reviews or support tickets.
- **Tagging**: list which known names appear in an article.

```ts
const brands = ['Peugeot', 'Renault', 'Citroën']
const mentioned = brands.filter((brand) => find(review, brand).length > 0)
```

## Highlight them

`highlight()` uses the same matching and returns pieces ready to render:

```ts
import { highlight } from 'guess-rater'

highlight("c'est bohemian rapsody", 'Bohemian Rhapsody')
// [{ text: "c'est ", match: false }, { text: 'bohemian rapsody', match: true }]
```

## Tuning

`find()` takes the usual options. Use a `threshold` of 90 or more to avoid near misses on short words, and `preset: 'music'` when the query is a song title.
