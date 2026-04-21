# Concepts

Guess‑Rater is a **flexible, open‑source fuzzy matching engine**.

It is designed to be:
- easy to use
- highly configurable
- adaptable to many different use‑cases
- extensible by the community

---

## The matching pipeline

Guess‑Rater works as a **pipeline**.

Every comparison follows these steps:

1. **Normalization**
2. **Algorithm comparison**
3. **Score computation**
4. **Threshold evaluation**
5. *(optional)* Explain & ranking

Understanding this pipeline is the key to using the library correctly.

---

## 1. Normalization

Before comparing two strings, Guess‑Rater can normalize them.

Normalization reduces differences that usually do not matter, such as:

- accents (`Molière` → `Moliere`)
- punctuation (`SAINT-MICHEL.` → `SAINT MICHEL`)
- casing (`Paris` vs `paris`)
- word order (`Tower Eiffel` vs `Eiffel Tower`)
- noise or typos (`bartndr` → `bartender`)

Normalization is controlled with `options.normalize`.

You decide what is important and what is not.

---

## 2. Algorithm comparison

After normalization, strings are compared using one algorithm:

- `levenshtein`
- `jaroWinkler`
- `tokenSort`
- `tokenSet`
- `hybrid`

Each algorithm measures similarity differently.

There is **no single “best” algorithm**.
The right choice depends entirely on your domain.

---

## 3. Score computation

The comparison produces a **score between 0 and 100**.

- `0` means completely different
- `100` means identical after normalization

Example:

```
rate('Black Peugeot', 'Black Peugeot') → 100
rate('Black Peugeot', 'Peugeot') → lower score
```

The score represents **how close the information is**, not how similar the formatting is.

---

## 4. Threshold and match

A **threshold** defines when two strings are considered a match.

```
match = score >= threshold
```

- Default threshold: `80`
- Higher threshold → stricter matching
- Lower threshold → more tolerant matching

This is what `isMatch()` does internally.

---

## 5. Explain mode

When `explain: true` is enabled, Guess‑Rater returns a detailed object:

- final score
- match boolean
- normalized strings
- algorithm breakdown (for hybrid)

Explain mode is meant for:
- debugging
- tuning thresholds
- understanding *why* something matches or not

---

## Score vs Match

Important distinction:

- **score** is continuous (0–100)
- **match** is boolean (true / false)

You should always tune your threshold based on your use‑case.

---

## Designed to be generic

Guess‑Rater does **not** enforce a specific domain.

It can be used for:

- person name matching
- product title matching
- fuzzy search
- quiz answer validation
- data cleaning and deduplication
- tolerant user input validation

And also for:
- custom business rules
- experimental matching strategies
- domain‑specific heuristics

You decide how strict or tolerant it should be.

---

## Open‑source & contributions

Guess‑Rater is an **open‑source project**.

You are encouraged to:

- use it freely in your own projects
- adapt it to your needs
- experiment with new ideas
- propose improvements

Contributions are welcome, including:

- new algorithms
- new normalization options
- performance improvements
- documentation improvements
- new examples and recipes
- bug fixes

If something does not fit your use‑case, it is very likely intentional:
the library is meant to be **extended**, not locked.

---

## Mental model

Think of Guess‑Rater as:

> “Compare information content, not formatting.”

Normalization removes noise.  
Algorithms measure similarity.  
Thresholds decide acceptance.

Everything else is up to you.