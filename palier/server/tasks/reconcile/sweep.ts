import { Organization } from '../../models/Organization'
import { syncOrgTransactions, syncOrgEnableBankingTransactions } from '../../utils/reconcile'
import { syncOrgRentilaData } from '../../utils/rentilaSync'

export default defineTask({
  meta: {
    name: 'reconcile:sweep',
    description:
      'Refreshes each org\'s Rentila cache, pulls recent Bridge/Enable Banking transactions, and runs reconciliation. ' +
      'Backstop for missed Bridge webhooks — and the PRIMARY path for Enable Banking, which has no webhook at all ' +
      '(see server/api/enablebanking/callback.get.ts). See nuxt.config.ts scheduledTasks.',
  },
  async run() {
    const orgs = await Organization.find({
      plan: { $ne: 'canceled' },
      $or: [{ 'bridge.userUuid': { $exists: true } }, { 'enablebanking.sessionId': { $exists: true } }],
    })

    // Each org runs all three, but independently — one integration's hiccup
    // (a broken Rentila connection, a reauth-required bank) must not skip
    // the other two for the same org. Used to be one try/catch around all
    // three per org, which meant a disconnected Rentila silently aborted
    // Bridge/Enable Banking sync too, every single sweep, with no error
    // pointing at the real cause — see the chat that found this the hard way.
    let failures = 0
    let rateLimited = 0
    for (const org of orgs) {
      for (const [label, sync] of [
        ['rentila', () => syncOrgRentilaData(org)],
        ['bridge', () => syncOrgTransactions(org)],
        ['enablebanking', () => syncOrgEnableBankingTransactions(org)],
      ] as const) {
        try {
          const result = await sync()
          // Only enablebanking's sync returns this — a 429 from the bank
          // itself (PSD2-mandated AIS polling caps), not a failure. Doesn't
          // throw specifically so this doesn't inflate `failures` below; a
          // visible log line is still worth it over silence.
          if (result && 'rateLimited' in result && result.rateLimited) {
            rateLimited += 1
            // eslint-disable-next-line no-console
            console.log(`[reconcile:sweep] org=${org._id} ${label} rate-limited by the bank, skipped this round`)
          }
        } catch (err) {
          failures += 1
          // eslint-disable-next-line no-console
          console.error(`[reconcile:sweep] org=${org._id} ${label} failed:`, err)
        }
      }
    }

    return { result: { orgsSwept: orgs.length, failures, rateLimited } }
  },
})
