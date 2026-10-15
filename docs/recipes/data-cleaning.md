# Cleaning data

## Remove near-duplicates

`dedupe()` keeps the first occurrence of each group of similar items.

```ts
import { dedupe } from 'guess-rater'

dedupe(['Hey Jude', 'hey jude - Remastered 2015', 'Let It Be'], { preset: 'music' })
// ['Hey Jude', 'Let It Be']

dedupe(companies, { keys: 'name', ignoreWords: ['sarl', 'sas', 'inc', 'ltd'] })
```

## See the groups

`group()` returns every group, in the original order, so you can review before merging.

```ts
import { group } from 'guess-rater'

group(['Jean Dupont', 'Dupont Jean', 'J. Dupont', 'Marie Curie'], { threshold: 70 })
```

An item joins the first group whose first item it matches.

## Map messy values to a clean list

```ts
import { createMatcher } from 'guess-rater'

const country = createMatcher({ replace: { usa: 'united states', uk: 'united kingdom' } })
const clean = rows.map((row) => country.closest(row.country, COUNTRIES)?.item ?? null)
```
