# Recipe: Product title matching

## The challenge

Product titles vary in word order, extra descriptors, punctuation, and missing or added model details:

```
"iPhone 15 Pro Max 256GB"  vs  "Apple iPhone 15 Pro Max"  → same product
"Peugeot 208 Active"       vs  "208 Peugeot"              → same
"Samsung Galaxy S24 Ultra" vs  "Galaxy S24 Ultra 256Go"   → same
```

## Recommended configuration

```js
import { rate, findBestMatch, filterMatches, extract, createMatcher } from 'guess-rater'

const config = {
  algorithm: 'tokenSet',    // tolerates extra/missing words
  normalize: {
    removePunctuation: true,
    removeAccents: true,
    removeWords: ['the', 'a', 'an', 'le', 'la', 'les']
  },
  threshold: 78
}
```

**Why tokenSet?** Product catalogs often have extra words (brand names, capacities, colors). tokenSet compares shared tokens and ignores extras.

**Why 78?** Lower than person names because product titles naturally have more variation between legitimate matches.

## Usage

```js
// Find best matching product
findBestMatch('iphone 15', [
  'Samsung Galaxy S24',
  'Apple iPhone 15 Pro',
  'iPhone 15 Plus 128GB'
], config)
// { value: 'Apple iPhone 15 Pro', score: 91, index: 1 }

// Get all good matches above threshold
filterMatches('peugeot 208', [
  '208 Peugeot Active',
  'Peugeot 308 GTi',
  'Renault Clio',
  'Peugeot 208 Style'
], config)
// ['208 Peugeot Active', 'Peugeot 208 Style']

// Extract top 3 results for a search bar
extract(userQuery, productCatalog, { ...config, limit: 3 })
```

## Handling word-order variations

Use `tokenSort` if your titles differ mainly in word order:

```js
rate('Peugeot 208 Active', '208 Active Peugeot', { algorithm: 'tokenSort' }) // 100
```

Use `hybrid` when you have both word-order and extra-word issues:

```js
const config = {
  algorithm: 'hybrid',
  hybrid: { tokenSort: 0.4, tokenSet: 0.6 }
}
```

## Building a search function

```js
const matcher = createMatcher({
  algorithm: 'tokenSet',
  normalize: { removePunctuation: true, removeAccents: true },
  threshold: 75
})

function searchProducts(query, catalog) {
  return matcher.extract(query, catalog, { limit: 5, return: 'entries' })
}

searchProducts('iphone 15', productCatalog)
// [{ value: 'iPhone 15 Pro', score: 91, index: 4 }, ...]
```

→ [Algorithms guide](/guide/algorithms) | [List helpers](/guide/ranking)
