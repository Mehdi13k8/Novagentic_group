import { requireOrgForUser } from '../../utils/org'
import { BankTransaction } from '../../models/BankTransaction'

/**
 * Just the sidebar badge: how many incoming transfers still await a decision.
 *
 * Deliberately separate from /api/dashboard/summary — the badge is needed on
 * every dashboard screen, and running the six-query summary aggregate on each
 * of them to render one number would be wasteful.
 */
export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)

  const toReconcile = await BankTransaction.countDocuments({
    orgId: org._id,
    amount: { $gt: 0 },
    provider: { $in: ['bridge', 'enablebanking'] },
    matchedPaymentId: { $exists: false },
  })

  return { toReconcile }
})
