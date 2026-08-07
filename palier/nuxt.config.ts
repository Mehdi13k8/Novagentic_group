import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: true },
  // Dev-only (never touches `nuxt build`/Azure) — Enable Banking's redirect
  // URI check requires https even for localhost (confirmed: it rejected a
  // plain http:// localhost callback), so the dev server needs to actually
  // terminate TLS itself, not just have https in the URL we send. Nuxt
  // auto-generates a self-signed cert for this; your browser will warn
  // once on first visit to https://localhost:3000 — click through it.
  devServer: { https: true },
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
    // Fast, no-KYB alternative to Bridge while Bridge's KYB is pending —
    // see .env.example "Enable Banking" section. Deliberately
    // `enablebanking*` (lowercase b, one word) not `enableBanking*` — Nuxt
    // maps NUXT_-prefixed env vars to these by inserting `_` at each
    // camelCase boundary, so `enableBankingX` would need
    // NUXT_ENABLE_BANKING_X, not NUXT_ENABLEBANKING_X like every other file
    // in this feature (and .env) uses. Got this wrong once already — see
    // the chat that fixed it; matching Bridge's working bridgeClientId ->
    // NUXT_BRIDGE_CLIENT_ID pattern here means no camelCase boundary at all
    // inside "enablebanking".
    enablebankingApplicationId: '',
    enablebankingPrivateKeyB64: '',
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
      title: 'Palier',
      htmlAttrs: { lang: 'fr' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'theme-color', content: '#060606' },
      ],
      link: [
        // Same fonts as Novagentic's marketing site, for the shared brand
        // identity — see app/assets/css/main.css.
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
