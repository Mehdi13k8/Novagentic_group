import { Organization } from '../../models/Organization'
import { syncOrgTransactions } from '../../utils/reconcile'
import { syncOrgRentilaData } from '../../utils/rentilaSync'

export default defineTask({
  meta: {
    name: 'reconcile:sweep',
    description:
      'Refreshes each org\'s Rentila cache, pulls recent Bridge transactions, and runs reconciliation. Backstop for missed webhooks, not the primary path — see nuxt.config.ts scheduledTasks.',
  },
  async run() {
    const orgs = await Organization.find({ 'bridge.userUuid': { $exists: true }, plan: { $ne: 'canceled' } })

    let failures = 0
    for (const org of orgs) {
      try {
        await syncOrgRentilaData(org)
        await syncOrgTransactions(org)
      } catch (err) {
        // One org's Bridge hiccup (e.g. a reauth-required connection) must
        // not block the sweep for everyone else.
        failures += 1
        // eslint-disable-next-line no-console
        console.error(`[reconcile:sweep] org=${org._id} failed:`, err)
      }
    }

    return { result: { orgsSwept: orgs.length, failures } }
  },
})
