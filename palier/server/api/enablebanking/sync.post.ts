import { requireOrgForUser } from '../../utils/org'
import { syncOrgEnableBankingTransactions } from '../../utils/reconcile'

interface Body {
  // Optional wider look-back, for backfilling an account that was connected
  // before callback.get.ts started pulling 90 days — a plain "Sync now"
  // stays on the cheap 7-day default so it doesn't burn the bank's polling
  // quota (see the 429 note below) on history that's already stored.
  days?: number
}

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  if (!org.enablebanking.sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Bank account is not connected yet' })
  }

  const body = await readBody<Body>(event).catch(() => ({}) as Body)
  const days = Math.min(Math.max(Number(body?.days) || 7, 1), 365)

  const { rateLimited } = await syncOrgEnableBankingTransactions(org, { days })
  if (rateLimited) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Your bank is rate-limiting transaction checks right now — try again later.',
    })
  }
  return { ok: true }
})
