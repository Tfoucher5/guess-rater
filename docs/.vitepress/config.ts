import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'guess-rater',
  description: 'Fuzzy string matching that just works',

  base: '/guess-rater/',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Recipes', link: '/recipes/quiz' },
      { text: 'API', link: '/api/' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Options', link: '/guide/options' },
          { text: 'How it works', link: '/guide/how-it-works' },
          { text: 'Upgrading from v1', link: '/guide/migration' },
          { text: 'Changelog', link: '/guide/changelog' }
        ]
      },
      {
        text: 'Recipes',
        items: [
          { text: 'Quizzes and blind tests', link: '/recipes/quiz' },
          { text: 'Search as you type', link: '/recipes/search' },
          { text: '"Did you mean…?"', link: '/recipes/did-you-mean' },
          { text: 'Cleaning data', link: '/recipes/data-cleaning' }
        ]
      },
      {
        text: 'Reference',
        items: [{ text: 'API', link: '/api/' }]
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/Tfoucher5/guess-rater' }],

    search: {
      provider: 'local'
    }
  }
})
