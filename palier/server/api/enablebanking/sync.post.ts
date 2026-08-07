import { requireOrgForUser } from '../../utils/org'
import { syncOrgEnableBankingTransactions } from '../../utils/reconcile'

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  if (!org.enablebanking.sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Bank account is not connected yet' })
  }

  const { rateLimited } = await syncOrgEnableBankingTransactions(org)
  if (rateLimited) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Your bank is rate-limiting transaction checks right now — try again later.',
    })
  }
  return { ok: true }
})
