import { getStripe } from '../../utils/stripe'
import { requireOrgForUser } from '../../utils/org'

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  const session = await requireUserSession(event)
  const config = useRuntimeConfig()
  const stripe = getStripe()

  let customerId = org.stripe.customerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { orgId: org._id.toString() },
    })
    customerId = customer.id
    org.stripe.customerId = customerId
    await org.save()
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: config.stripePriceId, quantity: 1 }],
    success_url: `${config.appUrl}/billing/success`,
    cancel_url: `${config.appUrl}/billing/cancel`,
    // Lets the webhook (server/api/webhooks/stripe.post.ts) find the org
    // without relying on the customer metadata alone.
    subscription_data: { metadata: { orgId: org._id.toString() } },
  })

  if (!checkoutSession.url) {
    throw createError({ statusCode: 502, statusMessage: 'Stripe did not return a checkout URL' })
  }

  return { url: checkoutSession.url }
})
