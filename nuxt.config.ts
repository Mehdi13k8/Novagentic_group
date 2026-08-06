import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: true },
  modules: ['@nuxt/content'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    acsConnectionString: '',
    acsSenderAddress: 'DoNotReply@novagentic.fr',
    contactTo: 'contact@novagentic.fr',
    contactCc: 'andremartin719@gmail.com,mehdi.rhoulam@outlook.fr',
  },
  app: {
    head: {
      title: 'Novagentic — Ingénierie logicielle & data',
      htmlAttrs: { lang: 'fr' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Ingénierie logicielle & data, pour équipes qui n\'ont pas droit à l\'erreur. Novagentic conçoit des systèmes fiables pour l\'industrie, la finance, la logistique et la banque — depuis Marseille.',
        },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#060606' },
        { name: 'author', content: 'Novagentic' },

        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Novagentic' },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:url', content: 'https://novagentic.fr/' },
        { property: 'og:title', content: 'Novagentic — Ingénierie logicielle & data' },
        {
          property: 'og:description',
          content: 'Ingénierie logicielle & data, pour équipes qui n\'ont pas droit à l\'erreur.',
        },
        { property: 'og:image', content: 'https://novagentic.fr/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Novagentic — Ingénierie logicielle & data' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Novagentic — Ingénierie logicielle & data' },
        {
          name: 'twitter:description',
          content: 'Ingénierie logicielle & data, pour équipes qui n\'ont pas droit à l\'erreur.',
        },
        { name: 'twitter:image', content: 'https://novagentic.fr/og-image.png' },
      ],
      link: [
        { rel: 'canonical', href: 'https://novagentic.fr/' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', sizes: '192x192', href: '/icon-192.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..900&family=IBM+Plex+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },
})
