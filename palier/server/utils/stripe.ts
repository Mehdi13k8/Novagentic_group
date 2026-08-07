import Stripe from 'stripe'

let client: Stripe | null = null

/** Lazily-created singleton — avoids constructing a new Stripe client per request. */
export function getStripe(): Stripe {
  if (client) return client
  const { stripeSecretKey } = useRuntimeConfig()
  if (!stripeSecretKey) throw new Error('NUXT_STRIPE_SECRET_KEY is not set')
  client = new Stripe(stripeSecretKey)
  return client
}
