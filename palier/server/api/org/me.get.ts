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
    enablebanking: {
      connected: Boolean(org.enablebanking.sessionId && org.enablebanking.accountUids?.length),
      aspspName: org.enablebanking.aspspName ?? null,
      aspspCountry: org.enablebanking.aspspCountry ?? null,
      validUntil: org.enablebanking.validUntil ?? null,
      // The dashboard header reports when we last actually called the bank.
      // Set on every attempt, including rejected ones (see reconcile.ts), so
      // it is the honest "last contact", not "last success".
      lastPolledAt: org.enablebanking.lastPolledAt ?? null,
      accountCount: org.enablebanking.accountUids?.length ?? 0,
    },
  }
})
