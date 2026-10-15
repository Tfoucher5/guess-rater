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

## Highlighting what matched

Each result has `text`, the value that matched (useful when you search several keys):

```ts
const [best] = index.search('queen')
best.text // 'Queen' (the artist, not the title)
```
