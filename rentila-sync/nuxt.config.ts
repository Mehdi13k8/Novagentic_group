import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: true },
  modules: ['nuxt-auth-utils'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },

  // Server-only secrets (never exposed to the client — no `public` keys
  // here on purpose, this app has no need for client-side runtime config;
  // the Checkout flow only ever needs the secret key server-side).
  runtimeConfig: {
    mongodbUri: '',
    encryptionKey: '',
    appUrl: 'http://localhost:3000', // used to build Stripe Checkout success/cancel redirect URLs
    bridgeClientId: '',
    bridgeClientSecret: '',
    bridgeWebhookSecret: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    stripePriceId: '',
    // nuxt-auth-utils reads NUXT_SESSION_PASSWORD itself (32+ chars) to
    // encrypt the session cookie — see .env.example.
    session: {
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  },

  nitro: {
    experimental: { tasks: true },
    scheduledTasks: {
      // Catches anything a missed/failed Bridge webhook didn't trigger.
      // Only works because this deploys as a long-running container (Azure
      // App Service), not serverless — see README.
      '*/30 * * * *': ['reconcile:sweep'],
    },
  },

  app: {
    head: {
      title: 'Rentila Sync',
      htmlAttrs: { lang: 'fr' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
    },
  },
})
