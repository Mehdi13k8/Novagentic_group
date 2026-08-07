#!/usr/bin/env node
// Idempotently creates the "Rentila Sync" Product + a recurring 3€/month
// Price (identified by a stable lookup_key, so re-running this is a no-op
// once they exist). Run with: npm run stripe:setup
//
// Uses whatever STRIPE_SECRET_KEY is in your .env — sk_test_... vs
// sk_live_... decides whether this touches test or live mode. Prefer
// running this against a TEST key first and exercising the full checkout
// flow with Stripe's test card numbers before ever pointing
// NUXT_STRIPE_PRICE_ID at a live-mode price.

import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY ?? process.env.NUXT_STRIPE_SECRET_KEY
if (!secretKey) {
  console.error('Set STRIPE_SECRET_KEY (or NUXT_STRIPE_SECRET_KEY) in .env first.')
  process.exit(1)
}

const stripe = new Stripe(secretKey)
const LOOKUP_KEY = 'rentila_sync_monthly'

console.log(`Mode: ${secretKey.startsWith('sk_live_') ? 'LIVE' : 'test'}`)

const existing = await stripe.prices.list({ lookup_keys: [LOOKUP_KEY], limit: 1, expand: ['data.product'] })
if (existing.data.length > 0) {
  const price = existing.data[0]
  console.log(`Already exists — price ${price.id} (${price.unit_amount / 100}${price.currency.toUpperCase()}/${price.recurring.interval})`)
  console.log(`Set NUXT_STRIPE_PRICE_ID=${price.id}`)
  process.exit(0)
}

const product = await stripe.products.create({ name: 'Rentila Sync', description: 'Monthly subscription' })
const price = await stripe.prices.create({
  product: product.id,
  currency: 'eur',
  unit_amount: 300, // €3.00
  recurring: { interval: 'month' },
  lookup_key: LOOKUP_KEY,
})

console.log(`Created product ${product.id} and price ${price.id} (€3.00/month)`)
console.log(`Set NUXT_STRIPE_PRICE_ID=${price.id}`)
