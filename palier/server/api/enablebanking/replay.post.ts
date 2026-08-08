import { requireOrgForUser } from '../../utils/org'
import { processStagedEnableBankingTransactions } from '../../utils/reconcile'

/**
 * Re-runs normalisation over EVERY staged row for this org, including ones
 * already turned into a BankTransaction — the point of keeping the raw
 * payloads (see server/models/StagedBankTransaction.ts).
 *
 * Use after fixing a normalisation bug: the amount-sign handling, the
 * description whitespace-collapse, a new field the matcher should read.
 * Without this the only way to apply such a fix to existing rows was to
 * re-poll the bank, which competes with normal operation for a daily
 * allowance of a handful of calls.
 *
 * Touches no external API, so it is neither rate-limited nor throttled.
 * Safe to re-run: ingest is an idempotent upsert keyed on the provider's
 * transaction id, and it never rewrites the financial facts of a row that
 * already exists ($setOnInsert) — a replay refreshes the derived/display
 * fields and re-attempts matching, it does not duplicate or restate money.
 */
export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)
  if (!org.enablebanking.sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Bank account is not connected yet' })
  }

  const { processed, failed } = await processStagedEnableBankingTransactions(org, { replay: true })
  return { ok: true, processed, failed }
})
