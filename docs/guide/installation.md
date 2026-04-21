# Installation

## Install with npm

```bash
npm install guess-rater
```

---

## Import (ESM)

Guess‑Rater is ESM‑first.

```js
import { rate } from 'guess-rater'
```

---

## Node & module system

You must use one of the following:

- `.mjs` files  
- or `"type": "module"` in your `package.json`

```json
{
  "type": "module"
}
```

---

## Minimal example

```js
import { rate } from 'guess-rater'

const score = rate('Molière', 'Moliere')
console.log(score)
```