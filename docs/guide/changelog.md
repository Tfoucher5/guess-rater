# Changelog

All notable changes to Guess‑Rater are documented in this file.

The project follows **semantic versioning**:
- MAJOR — breaking changes
- MINOR — new features, backward‑compatible
- PATCH — bug fixes, documentation, DX improvements


---

## v1.2.1

### Added
- Major TypeScript / IDE DX improvements in `index.d.ts`:
  - richer inline documentation (hover docs) for core options and behaviors
  - clearer option typing for algorithm-specific configuration (`jaroWinkler`, `tokenSort`, `tokenSet`, `hybrid`)
- Overloads for better return type inference:
  - `rate(..., { explain: true })` is inferred as a detailed object
  - `rate(..., { explain: false })` / default is inferred as a number
  - similar inference improvements for `rankCandidates()` and `findBestMatch()` depending on `explain`

### Improved
- Autocomplete quality and discoverability of options in VS Code / WebStorm / TS-powered IDEs
- Reduced common mistakes by making return types and option meanings explicit in tooltips

### Notes
- No runtime changes
- Backward compatible
- DX-only release (types & developer experience)

---

## v1.2.0

### Added
- New optional scoring feature: `spaceInsensitive?: boolean`
  - when enabled, performs an additional comparison pass with all whitespace removed
  - keeps the best score between standard vs compact (no-whitespace) comparison
  - applies only to character-based algorithms (`levenshtein`, `jaroWinkler`)
  - does not affect token-based algorithms (`tokenSort`, `tokenSet`)
- Explain support for `spaceInsensitive`:
  - when `explain: true`, details include which pass was selected and related scores
- Test coverage for the new feature:
  - boosts char-based algorithms when spaces are missing/extra
  - confirms token-based algorithms remain unchanged
  - validates hybrid remains coherent and can improve on compact inputs

### Improved
- Better matching for compact inputs and "no-spaces" user queries (e.g. `iphone14pro` vs `iphone 14 pro`)
- Maintains token semantics by design (non-destructive, opt-in only)

### Notes
- No breaking changes
- Backward compatible
- Feature release focused on matching robustness

---

## v1.1.2

### Added
- Missing TypeScript exports in `index.d.ts`:
  - `getSimilarityScore`
  - `normalizeString`
  - `getLevenshteinDistance`
  - `getLevenshteinScore`
  - `getJaroScore`
  - `getJaroWinklerScore`
  - `getTokenSortScore`
  - `getTokenSetScore`
- Added `tokenSort` to `HybridWeights`
- New `RankedCandidateExplain` type for `explain: true` in `rankCandidates` and `findBestMatch`
- 26 new test cases covering:
  - low-level algorithms
  - hybrid mode
  - `createMatcher`
  - `isMatch` with object options
  - error cases (invalid type, unknown algorithm)

### Fixed
- Fixed a critical bug where `getTokenSetScore('', 'hello')` returned `100` instead of `0` when only one side was empty
- Fixed a bug where using `'hybrid'` as a sub-algorithm in hybrid weights (for example `hybrid: { hybrid: 1 }`) produced a cryptic internal error; the error message is now explicit

### Improved
- Optimized Levenshtein performance by replacing the O(n) array copy at each iteration with an O(1) reference swap, reducing the main loop workload significantly
- Increased total test coverage to 39 cases

### Notes
- No breaking changes
- Backward compatible
- Bug fix, type completeness, performance, and test coverage focused release

---

## v1.1.1

### Added
- TypeScript declaration files (`.d.ts`)
- Full IDE autocomplete support
- Inline documentation for options and algorithms

### Improved
- Developer experience in VS Code and similar editors
- Safer configuration via typed options

### Notes
- No runtime changes
- Backward compatible
- Documentation and DX focused release

---

## v1.1.0

### Added
- Modular matching engine
- Multiple algorithms:
  - Levenshtein
  - Jaro‑Winkler
  - TokenSort
  - TokenSet
  - Hybrid
- Normalization pipeline
- Hybrid weighted scoring
- Ranking helpers:
  - `rankCandidates`
  - `findBestMatch`
- `createMatcher` for reusable configurations
- Explain mode for debugging

### Improved
- Matching accuracy on noisy inputs
- Flexibility across domains

### Notes
- Backward compatible with previous API
- Major internal refactor

---

## v1.0.1

### Initial release
- Basic string similarity scoring
- Levenshtein algorithm
- Simple normalization
- Minimal API surface

---

## Contributing

Guess‑Rater is an **open‑source project** and contributions are welcome.

Anyone can:
- use the library freely
- fork the repository
- experiment with new ideas
- propose improvements

### Contribution workflow

1. Fork the repository on GitHub
2. Create a branch in your fork
3. Make your changes
4. Open a Pull Request (PR)
5. The PR is reviewed thoroughly
6. The PR is either merged, requested for changes, or rejected

All Pull Requests are reviewed **in depth** to ensure:
- code quality
- correctness
- consistency with the project philosophy
- backward compatibility
- proper documentation when required

Not all contributions will be merged, and that is OK.
Every proposal is reviewed with care and respect.

---

## Future plans

Planned improvements may include:
- additional algorithms
- domain presets (names, products, addresses)
- performance optimizations
- more recipes and examples
- extended documentation
- community‑driven enhancements
