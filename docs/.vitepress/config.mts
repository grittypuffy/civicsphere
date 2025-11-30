import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  
  title: "CivicSphere Docs",
  description: "Documentation for CivicSphere",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Roadmap', link: '/roadmap' }
    ],

    sidebar: [
      {
        text: 'CivicSphere',
        items: [
          { text: 'Philosophy', link: '/philosophy' },
          { text: 'Roadmap', link: '/roadmap' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/grittypuffy/civicsphere' }
    ]
  }
})
