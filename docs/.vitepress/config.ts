import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Guess‑Rater',
  description: 'Flexible fuzzy matching for JavaScript',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/installation' },
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
          { text: 'Normalization', link: '/guide/normalization' },
          { text: 'Algorithms', link: '/guide/algorithms' },
          { text: 'Hybrid Scoring', link: '/guide/hybrid' },
          { text: 'Thresholds', link: '/guide/thresholds' },
          { text: 'Explain Mode', link: '/guide/explain-mode' },
          { text: 'createMatcher', link: '/guide/matcher' },
          { text: 'Ranking', link: '/guide/ranking' },
          { text: 'Types & Autocomplete', link: '/guide/types-autocomplete' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          { text: 'Changelog', link: '/guide/changelog' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Exports', link: '/api/exports' },
          { text: 'rate()', link: '/api/rate' },
          { text: 'isMatch()', link: '/api/isMatch' },
          { text: 'normalize()', link: '/api/normalize' },
          { text: 'rankCandidates()', link: '/api/rankCandidates' },
          { text: 'findBestMatch()', link: '/api/findBestMatch' },
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
    ]
  }
})