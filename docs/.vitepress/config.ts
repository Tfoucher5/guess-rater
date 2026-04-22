import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Guess‑Rater',
  description: 'Fuzzy string matching for JavaScript',

  base: '/guess-rater/',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/quickstart' },
      { text: 'API', link: '/api/exports' },
      { text: 'Recipes', link: '/recipes/person-name' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Quickstart', link: '/guide/quickstart' },
          { text: 'Concepts', link: '/guide/concepts' },
          { text: 'Algorithms', link: '/guide/algorithms' },
          { text: 'Normalization', link: '/guide/normalization' },
          { text: 'Thresholds', link: '/guide/thresholds' },
          { text: 'Explain mode', link: '/guide/explain-mode' },
          { text: 'List helpers', link: '/guide/ranking' },
          { text: 'createMatcher', link: '/guide/matcher' },
          { text: 'Types & Autocomplete', link: '/guide/types-autocomplete' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          { text: 'Changelog', link: '/guide/changelog' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'All exports', link: '/api/exports' },
          { text: 'rate()', link: '/api/rate' },
          { text: 'isMatch()', link: '/api/isMatch' },
          { text: 'normalize()', link: '/api/normalize' },
          { text: 'rankCandidates()', link: '/api/rankCandidates' },
          { text: 'findBestMatch()', link: '/api/findBestMatch' },
          { text: 'filterMatches()', link: '/api/filterMatches' },
          { text: 'extract()', link: '/api/extract' },
          { text: 'createMatcher()', link: '/api/createMatcher' }
        ]
      },
      {
        text: 'Recipes',
        items: [
          { text: 'Person name matching', link: '/recipes/person-name' },
          { text: 'Product title matching', link: '/recipes/product-title' },
          { text: 'Quiz answer validation', link: '/recipes/quiz-answers' },
          { text: 'Data cleaning & dedupe', link: '/recipes/data-cleaning' }
        ]
      }
    ],

    search: {
      provider: 'local'
    }
  }
})
