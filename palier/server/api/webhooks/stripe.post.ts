import type Stripe from 'stripe'
import { getStripe } from '../../utils/stripe'
import { Organization } from '../../models/Organization'

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event, 'utf8')
  const signature = getHeader(event, 'stripe-signature')
  if (!rawBody || !signature) {
    throw createError({ statusCode: 400, statusMessage: 'Missing body or signature' })
  }

  const config = useRuntimeConfig()
  const stripe = getStripe()

  let stripeEvent: Stripe.Event
  try {
    // Stripe's own SDK verifies the HMAC signature against the RAW body —
    // same principle as the Bridge webhook: never trust an unverified
    // "a subscription changed" event, that's the only thing stopping anyone
    // from POSTing a fake "subscription active" to this URL.
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid signature' })
  }

  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object as Stripe.Checkout.Session
      const orgId = session.subscription_data?.metadata?.orgId ?? session.metadata?.orgId
      if (orgId && session.subscription) {
        await Organization.updateOne(
          { _id: orgId },
          { $set: { plan: 'active', 'stripe.subscriptionId': String(session.subscription) } },
        )
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = stripeEvent.data.object as Stripe.Subscription
      const orgId = subscription.metadata?.orgId
      const plan = subscription.status === 'active' ? 'active' : subscription.status === 'canceled' ? 'canceled' : undefined
      const update: Record<string, unknown> = { 'stripe.subscriptionStatus': subscription.status }
      if (plan) update.plan = plan

      if (orgId) {
        await Organization.updateOne({ _id: orgId }, { $set: update })
      } else {
        // Fallback for events that don't carry the metadata (shouldn't
        // happen given subscription_data.metadata was set at checkout, but
        // don't silently drop a status change if it does).
        await Organization.updateOne({ 'stripe.subscriptionId': subscription.id }, { $set: update })
      }
      break
    }

    default:
      break // ignore anything else — Stripe sends far more event types than we act on
  }

  return { ok: true }
})
