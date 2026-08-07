import { requireOrgForUser } from '../../utils/org'

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)

  return {
    name: org.name,
    plan: org.plan,
    stripe: {
      subscriptionStatus: org.stripe.subscriptionStatus ?? null,
    },
    rentila: {
      connected: Boolean(org.rentila.clientId),
      landlordId: org.rentila.landlordId ?? null,
    },
    bridge: {
      // userUuid just means we've registered a Bridge user for this org;
      // itemId means an actual bank account has been linked (set by the
      // item.created webhook — see server/api/webhooks/bridge.post.ts).
      userCreated: Boolean(org.bridge.userUuid),
      connected: Boolean(org.bridge.itemId),
    },
  }
})
