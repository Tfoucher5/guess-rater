# Types and IDE autocomplete

Guess‑Rater provides **TypeScript declaration files** (`.d.ts`)
to improve developer experience in modern editors.

You do **not** need to use TypeScript to benefit from this.

---

## What typings provide

Type declarations enable:

- IDE auto‑completion
- inline documentation (hover)
- validation of options
- safer configuration
- better discoverability of the API

This works in editors such as:
- VS Code
- WebStorm
- IntelliJ
- any editor using TypeScript language services

---

## Autocomplete for functions

When typing:

```js
rate(
```

Your editor should display:
- function signature
- expected parameters
- return type

Example:

```js
rate(
  leftInput: string,
  rightInput: string,
  options?: RateOptions
)
```

---

## Autocomplete for algorithms

When typing:

```js
algorithm:
```

Your editor should suggest:

- `levenshtein`
- `jaroWinkler`
- `tokenSort`
- `tokenSet`
- `hybrid`

This prevents typos and invalid values.

---

## Autocomplete for normalization

When typing:

```js
normalize: {
```

Your editor should suggest:

- `caseSensitive`
- `removeAccents`
- `removePunctuation`
- `punctuationStrategy`
- `trim`
- `collapseWhitespace`
- `replacements`
- `removeWords`
- `sortTokens`

Each option includes inline documentation explaining its purpose.

---

## Autocomplete with explain mode

When using `explain: true`, return types change.

Example:

```js
const result = rate('John Smith', 'Smith John', {
  explain: true
})
```

The editor should know that `result` is an object with:

- `score`
- `match`
- `normalizedLeft`
- `normalizedRight`
- `details`

This helps avoid mistakes such as comparing an object directly to a number.

---

## isMatch overload behavior

The `isMatch()` helper is typed to reflect its behavior:

- returns `boolean` by default
- returns a detailed object when `explain: true` is provided

This allows correct autocomplete depending on usage.

---

## createMatcher typing

A matcher instance exposes typed methods:

- `matcher.rate()`
- `matcher.isMatch()`
- `matcher.rankCandidates()`
- `matcher.findBestMatch()`
- `matcher.normalize()`

Each method has proper parameter and return types.

---

## Common troubleshooting

### Autocomplete not working

If autocomplete does not appear:

1. Make sure the package is installed correctly
2. Restart your editor
3. In VS Code:
   - Command palette
   - Run “TypeScript: Restart TS Server”

---

## Why this matters

Typings turn Guess‑Rater from a simple utility into a
**safe, discoverable, self‑documenting API**.

They reduce runtime errors and make configuration easier to understand.

---

## Key idea

The code runs in JavaScript.

The typings exist only to help **you** write better code.