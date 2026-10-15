# "Did you mean…?"

```ts
import { closest } from 'guess-rater'

const commands = ['install', 'uninstall', 'update', 'publish']
const suggestion = closest('instal', commands)

if (suggestion) console.log(`Unknown command. Did you mean "${suggestion.item}"?`)
```

`closest()` returns the best `Match`, or `undefined` when nothing reaches the threshold, so you never suggest something unrelated.

With objects:

```ts
closest('pari', cities, { keys: ['name', 'aliases'] })?.item
```
