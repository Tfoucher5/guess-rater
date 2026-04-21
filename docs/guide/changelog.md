# Changelog

All notable changes to Guess‑Rater are documented in this file.

The project follows **semantic versioning**:
- MAJOR — breaking changes
- MINOR — new features, backward‑compatible
- PATCH — bug fixes, documentation, DX improvements

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
