import { requireOrgForUser } from '../../utils/org'
import {
  processStagedEnableBankingTransactions,
  syncOrgEnableBankingTransactions,
} from '../../utils/reconcile'

interface Body {
  // Absent (the normal "Sync now" click): re-read this org's lines from the
  // staging collection. No bank call at all, so it is instant and cannot be
  // rate-limited however often it is clicked — the scheduled sweep is what
  // keeps staging fresh, every 30 min.
  //
  // Present: go to the bank for this many days of history first. That is the
  // backfill path (an account connected before the 90-day initial pull
  // existed), and it IS subject to the poll spacing, because it spends the
  // bank's scarce daily allowance.
  days?: number
}

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  if (!org.enablebanking.sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Bank account is not connected yet' })
  }

  const body = await readBody<Body>(event).catch(() => ({}) as Body)
  const wantsBankFetch = body?.days !== undefined

  if (!wantsBankFetch) {
    const { processed, failed } = await processStagedEnableBankingTransactions(org)
    return { ok: true, source: 'staging', processed, failed }
  }

  const days = Math.min(Math.max(Number(body.days) || 7, 1), 365)
  const { rateLimited, throttled, retryAfterSeconds, processed, failed } =
    await syncOrgEnableBankingTransactions(org, { days })

  // Two different refusals, deliberately worded apart: this one is ours and
  // the wait is exact, so say how long. Collapsing it into the bank's
  // message below would tell the landlord their bank is blocking them when
  // it isn't.
  if (throttled) {
    // Nothing new could be fetched, but staging may still hold rows this org
    // has never processed — do that rather than returning empty-handed.
    const staged = await processStagedEnableBankingTransactions(org)
    const minutes = Math.ceil((retryAfterSeconds ?? 0) / 60)
    throw createError({
      statusCode: 429,
      statusMessage:
        `Already checked your bank a moment ago — try again in ${minutes} min.` +
        (staged.processed ? ` (${staged.processed} pending transaction(s) filed in the meantime.)` : ''),
    })
  }

  if (rateLimited) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Your bank is rate-limiting transaction checks right now — try again later.',
    })
  }

  return { ok: true, source: 'bank', processed, failed }
})
