---
layout: home

hero:
  name: guess-rater
  text: Fuzzy string matching that just works
  tagline: Check quiz answers, search as you type, suggest "did you mean…?" and clean up duplicates. Typos, accents, word order and missing spaces are handled for you.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: API reference
      link: /api/

features:
  - title: Zero config
    details: One smart default that tolerates typos, swapped letters, word order and missing spaces. Presets for music, search and strict matching.
  - title: Built for real use cases
    details: check() grades guesses as correct, close or wrong. search() and createIndex() power search boxes. dedupe() and group() clean data.
  - title: Fast
    details: Bit-parallel edit distances, options compiled once, reusable indexes that only score the query.
  - title: Fully typed
    details: Every option autocompletes. With objects, keys is required and only accepts properties that hold text.
  - title: Tiny
    details: About 6 kB minified and gzipped. No dependencies. ESM and CommonJS.
---
