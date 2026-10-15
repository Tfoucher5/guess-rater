# Search as you type

```ts
import { createIndex } from 'guess-rater'

const index = createIndex(songs, { keys: ['title', 'artist'], preset: 'search' })

input.addEventListener('input', () => {
  render(index.search(input.value, { limit: 10 }))
})
```

`createIndex()` normalizes every item once. Each call to `search()` then only normalizes and scores the query.

## What the `search` preset matches

It turns on `partial` and lowers the threshold to 70:

```ts
index.search('bohem')      // prefix of a word
index.search('zep stair')  // several prefixes, any order
index.search('bohemain')   // typos still work
```

A full match always ranks above a partial one, and ties keep the original order:

```ts
search('beat', ['The Beatles', 'Beat It', 'Beat'], { preset: 'search' }).map((m) => m.item)
// ['Beat', 'Beat It', 'The Beatles']
```

## One-off searches

For a list you search only once, `search()` does the same without an index:

```ts
search('iphone', products, { keys: 'name', preset: 'search', limit: 5 })
```

## Highlight what matched

`highlight()` splits a text into pieces and marks the ones matching the query, prefixes and typos included:

```ts
import { highlight } from 'guess-rater'

highlight('Stairway to Heaven', 'stair heven')
// [{ text: 'Stair', match: true }, { text: 'way to ', match: false }, { text: 'Heaven', match: true }]
```

```tsx
// React
{highlight(song.title, query).map((piece, i) =>
  piece.match ? <mark key={i}>{piece.text}</mark> : piece.text
)}
```

```vue
<!-- Vue -->
<template v-for="(piece, i) in highlight(song.title, query)" :key="i">
  <mark v-if="piece.match">{{ piece.text }}</mark><template v-else>{{ piece.text }}</template>
</template>
```

Each result also has `text`, the value that matched, useful when you search several keys:

```ts
const [best] = index.search('queen')
best.text // 'Queen' (the artist, not the title)
```

## Some fields count less

Give a key a weight to rank its matches lower:

```ts
createIndex(songs, { keys: ['title', { name: 'artist', weight: 0.8 }], preset: 'search' })
```
