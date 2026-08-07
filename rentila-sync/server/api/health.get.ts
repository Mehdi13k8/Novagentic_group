import mongoose from 'mongoose'

export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  // Reports whether each integration is *configured* (env var present), not
  // whether it's actually reachable — Mongo is the only one we hold a live
  // connection to check. Bridge/Stripe are checked per-request by their own
  // clients; this is just "did the right env vars actually load", which is
  // the thing that's gone wrong in practice (e.g. running `npm run dev`
  // from the repo root instead of this folder — see README).
  return {
    ok: true,
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'not connected',
    bridge: config.bridgeClientId && config.bridgeClientSecret ? 'configured' : 'missing',
    stripe: config.stripeSecretKey && config.stripePriceId ? 'configured' : 'missing',
    encryptionKey: config.encryptionKey ? 'configured' : 'missing',
    sessionPassword: config.session?.password ? 'configured' : 'missing',
  }
})
