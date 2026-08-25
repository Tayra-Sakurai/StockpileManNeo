import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "StockpileMan Neo Documentation",
  description: "The documentation page for StockpileMan Neo.",
  cleanUrls: true,
  // base: '/StockpileManNeo/',
  locales: {
    root: {
      lang: 'en',
      label: 'English',
      themeConfig: {
        siteTitle: 'StockpileMan neo Documentation',
        nav: [
          {
            text: 'User Guide',
            link: '/user-guide',
          },
          {
            text: 'API Reference',
            link: '/api-reference',
          },
        ],
        editLink: {
          text: 'Edit this page on GitHub',
          pattern: 'https://github.com/Tayra-Sakurai/StockpileManNeo/edit/master/:path',
        },
      },
    },
    ja: {
      lang: 'ja',
      label: '日本語',
      themeConfig: {
        siteTitle: 'StockpileMan neo ドキュメント',
        nav: [
          {
            text: 'ユーザーガイド',
            link: '/ja/user-guide',
          },
          {
            text: 'APIリファレンス',
            link: '/ja/api-reference',
          },
        ],
        editLink: {
          text: 'GitHubで編集',
          pattern: 'https://github.com/Tayra-Sakurai/StockpileManNeo/edit/master/docs/:path',
        },
      },
    },
  },
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Tayra-Sakurai/StockpileManNeo' }
    ],
  },
})
