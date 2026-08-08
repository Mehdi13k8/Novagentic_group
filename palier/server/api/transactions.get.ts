import { requireOrgForUser } from '../utils/org'
import { BankTransaction } from '../models/BankTransaction'
import { Match } from '../models/Match'
import '../models/Payment'
import '../models/Property'
import '../models/Tenant'

interface PopulatedPayment {
  _id: { toString(): string }
  rentilaId: number
  amount: number
  propertyId?: { title?: string }
  tenantId?: { fullName?: string }
}

export default defineEventHandler(async (event) => {
  const org = await requireOrgForUser(event)

  // "Virements reçus" — incoming transfers only, not every bank line item
  // (expenses/outgoing debits aren't what this view is for; tryMatch() in
  // reconcile.ts applies the same amount > 0 rule for the same reason).
  // provider must be a real, current aggregator — defense against exactly
  // what happened once already: 329 leftover Bridge-sandbox fixture rows
  // with provider:null (inserted before the field existed, never migrated)
  // silently showing up here as if they were real transfers.
  const transactions = await BankTransaction.find({
    orgId: org._id,
    amount: { $gt: 0 },
    provider: { $in: ['bridge', 'enablebanking'] },
  })
    .sort({ date: -1 })
    .limit(200)
    .populate({
      path: 'matchedPaymentId',
      populate: [
        { path: 'propertyId', select: 'title' },
        { path: 'tenantId', select: 'fullName' },
      ],
    })
    .lean()

  // Only `claim()` in reconcile.ts ever updates an existing BankTransaction
  // doc after insert (setting matchedPaymentId) — so updatedAt IS the match
  // time, no separate Match lookup needed. "Recent" = within this window,
  // not "updatedAt differs from createdAt" (that's permanently true once
  // matched, whether it happened a minute or a month ago).
  const ALERT_WINDOW_MS = 1000 * 60 * 60 * 24 // 24h
  let newMatchesCount = 0

  // How each link came about — 'exact'/'partial' are the automated matcher's
  // own levels, 'manual' is a landlord override (see models/Match.ts). The
  // Rapprochement screen groups its tabs on exactly this distinction, so it
  // has to come from the audit trail rather than being guessed from the data.
  const matches = await Match.find({
    orgId: org._id,
    bankTransactionId: { $in: transactions.map((tx) => tx._id) },
  })
    .select('bankTransactionId confidence')
    .lean()
  const confidenceByTx = new Map(matches.map((m) => [String(m.bankTransactionId), m.confidence]))

  const items = transactions.map((tx) => {
    const payment = tx.matchedPaymentId as unknown as PopulatedPayment | undefined
    const matchedRecently = Boolean(payment) && Date.now() - tx.updatedAt.getTime() < ALERT_WINDOW_MS
    if (matchedRecently) newMatchesCount += 1

    return {
      id: tx._id.toString(),
      provider: tx.provider,
      date: tx.date,
      amount: tx.amount,
      currencyCode: tx.currencyCode,
      description: tx.description,
      matchedRecently,
      confidence: payment ? (confidenceByTx.get(tx._id.toString()) ?? null) : null,
      match: payment
        ? {
            paymentId: payment._id.toString(),
            rentilaId: payment.rentilaId,
            property: payment.propertyId?.title ?? null,
            tenant: payment.tenantId?.fullName ?? null,
            amount: payment.amount,
            // Rentila's REST API is read-only (Phase 0 findings) — this is
            // the actual "close the loop" action until/unless that changes.
            rentilaEditUrl: `https://www.rentila.com/landlord/#payments/${payment.rentilaId}/edit`,
          }
        : null,
    }
  })

  return { items, newMatchesCount }
})
