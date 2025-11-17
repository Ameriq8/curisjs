import { defineConfig } from 'vitepress';

export default defineConfig({
  // If you plan to deploy to GitHub Pages under
  // https://<org-or-user>.github.io/curisjs/
  // set base to '/curisjs/'. Adjust if you use a different repo name or custom domain.
  base: '/curisjs/',
  title: 'CurisJS',
  description: 'High-performance, multi-runtime web framework',

  lastUpdated: true,

  themeConfig: {
    lastUpdated: {
      text: 'Last update',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'Changelog', link: '/changelog' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'Packages',
        items: [
          { text: 'Core', link: '/core/' },
          { text: 'Database', link: '/db/' },
          { text: 'CLI', link: '/cli/' },
        ]
      }
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is CurisJS?', link: '/' },
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Deployment', link: '/deployment' },
          ]
        },
        {
          text: 'Core Package',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/core/' },
            { text: 'Application', link: '/core/application' },
            { text: 'Routing', link: '/core/routing' },
            { text: 'Context', link: '/core/context' },
            { text: 'Middleware', link: '/core/middleware' },
            { text: 'Validation', link: '/core/validation' },
            { text: 'API Reference', link: '/core/api-reference' },
          ]
        },
        {
          text: 'Database',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/db/' },
            { text: 'Models', link: '/db/models' },
            { text: 'Query Builder', link: '/db/query-builder' },
            { text: 'Relations', link: '/db/relations' },
            { text: 'Transactions', link: '/db/transactions' },
            { text: 'Migrations', link: '/db/migrations' },
            { text: 'API Reference', link: '/db/api-reference' },
          ]
        },
        {
          text: 'CLI Tools',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/cli/' },
            { text: 'Commands', link: '/cli/commands' },
            { text: 'Code Generation', link: '/cli/generation' },
            { text: 'API Reference', link: '/cli/api-reference' },
          ]
        },
        {
          text: 'Advanced',
          collapsed: true,
          items: [
            { text: 'Service Container', link: '/advanced/container' },
            { text: 'Service Providers', link: '/advanced/providers' },
            { text: 'Facades', link: '/advanced/facades' },
            { text: 'Testing', link: '/advanced/testing' },
          ]
        },
        {
          text: 'Resources',
          items: [
            { text: 'Changelog', link: '/changelog' },
            { text: 'Examples', link: '/examples/' },
            { text: 'Contributing', link: '/contributing' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Ameriq8/curisjs' }
    ],

    editLink: {
      pattern: 'https://github.com/Ameriq8/curisjs/edit/develop/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Ameriq8'
    },

    search: {
      provider: 'local'
    }
  }
});
