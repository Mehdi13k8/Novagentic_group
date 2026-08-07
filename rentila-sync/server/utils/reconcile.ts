import type { HydratedDocument, Types } from 'mongoose'
import { Payment, type PaymentDoc } from '../models/Payment'
import { BankTransaction, type BankTransactionDoc } from '../models/BankTransaction'
import { Match } from '../models/Match'
import type { OrganizationDoc } from '../models/Organization'
import { createBridgeClient, type BridgeTransaction } from './bridge'

/**
 * Upserts one Bridge transaction, idempotent on (orgId, bridgeTransactionId)
 * — a redelivered webhook or an overlapping sweep is a no-op here, not a
 * duplicate. Then attempts to match it against an outstanding rent payment.
 */
export async function ingestBridgeTransaction(orgId: Types.ObjectId, tx: BridgeTransaction) {
  const doc = await BankTransaction.findOneAndUpdate(
    { orgId, bridgeTransactionId: tx.id },
    {
      $setOnInsert: {
        orgId,
        bridgeTransactionId: tx.id,
        bridgeAccountId: tx.account_id,
        amount: tx.amount,
        currencyCode: tx.currency_code,
        date: new Date(tx.date),
        description: tx.clean_description || tx.provider_description,
        raw: tx,
      },
    },
    { upsert: true, new: true },
  )

  if (doc.matchedPaymentId) return doc // already reconciled on a prior ingest — nothing to do
  await tryMatch(doc)
  return doc
}

function normalizeForMatch(name: string) {
  return name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents -- bank descriptions are usually ASCII-folded
}

/** Finds a candidate outstanding rent payment for a bank transaction; claims it if found. */
async function tryMatch(tx: HydratedDocument<BankTransactionDoc>) {
  // Only credits count as a candidate — expenses paid out aren't "did the
  // tenant pay" reconciliation.
  if (tx.amount <= 0) return null

  const candidates = await Payment.find({
    orgId: tx.orgId,
    kind: 'rent',
    status: { $in: ['pending', 'partial'] },
    matchedTransactionId: { $exists: false },
    amount: tx.amount,
  }).sort({ dueDate: 1 })

  if (candidates.length === 0) return null

  const description = normalizeForMatch(tx.description)
  const exact = candidates.find((p) => description.includes(normalizeForMatch(p.personLabel)))
  // No name hit: fall back to the oldest pending rent of the same amount —
  // flagged 'partial' confidence so it surfaces for a human glance instead
  // of being silently trusted.
  const chosen = exact ?? candidates[0]
  const confidence: 'exact' | 'partial' = exact ? 'exact' : 'partial'

  return claim(tx, chosen, confidence)
}

/**
 * THE safety-critical step. Claims both sides atomically via a conditional
 * update keyed on the unique partial indexes declared on Payment and
 * BankTransaction (see those model files). If either write affects zero
 * documents, someone else — a concurrent webhook retry, an overlapping
 * sweep — already claimed one side; back off, never retry-and-overwrite.
 * This is a hard requirement per the plan, not something to skip.
 */
async function claim(
  tx: HydratedDocument<BankTransactionDoc>,
  payment: HydratedDocument<PaymentDoc>,
  confidence: 'exact' | 'partial',
) {
  const claimedPayment = await Payment.findOneAndUpdate(
    { _id: payment._id, matchedTransactionId: { $exists: false } },
    { $set: { matchedTransactionId: tx._id, status: 'paid', amountPaid: payment.amount, amountLeft: 0 } },
    { new: true },
  )
  if (!claimedPayment) return null // lost the race on the payment side — no-op, not an error

  const claimedTx = await BankTransaction.findOneAndUpdate(
    { _id: tx._id, matchedPaymentId: { $exists: false } },
    { $set: { matchedPaymentId: payment._id } },
    { new: true },
  )
  if (!claimedTx) {
    // Lost the race on the transaction side after winning the payment side
    // — roll the payment claim back rather than leave a half-matched state.
    await Payment.updateOne(
      { _id: payment._id, matchedTransactionId: tx._id },
      {
        $unset: { matchedTransactionId: 1 },
        $set: { status: payment.status, amountPaid: payment.amountPaid, amountLeft: payment.amountLeft },
      },
    )
    return null
  }

  await Match.findOneAndUpdate(
    { paymentId: payment._id },
    {
      $setOnInsert: {
        orgId: tx.orgId,
        paymentId: payment._id,
        bankTransactionId: tx._id,
        confidence,
        // Rentila's REST API is confirmed read-only for this app's
        // credentials (Phase 0 findings) — so the loop can't close itself
        // yet. 'notified' until/unless a write path exists.
        writeBackStatus: 'notified',
      },
    },
    { upsert: true },
  )

  notifyLandlord(tx.orgId, claimedPayment)
  return claimedTx
}

function notifyLandlord(orgId: Types.ObjectId, payment: HydratedDocument<PaymentDoc>) {
  // TODO: real email delivery. For now this is a log line — the dashboard's
  // matched/unmatched list is the source of truth until that's built.
  // eslint-disable-next-line no-console
  console.log(
    `[reconcile] org=${orgId} matched payment ${payment.rentilaId} (€${payment.amount}). ` +
      `Manual confirm needed in Rentila: https://www.rentila.com/landlord/#payments/${payment.rentilaId}/edit`,
  )
}

/**
 * Pulls recent transactions for one org from Bridge and runs them through
 * ingest. Used by the scheduled sweep (server/tasks/reconcile/sweep.ts) and
 * can also back a manual "resync" button later.
 */
export async function syncOrgTransactions(org: HydratedDocument<OrganizationDoc>) {
  if (!org.bridge.userUuid) return

  const config = useRuntimeConfig()
  const bridge = createBridgeClient({ clientId: config.bridgeClientId, clientSecret: config.bridgeClientSecret })
  const { access_token: accessToken } = await bridge.authenticateUser(org.bridge.userUuid)

  // 7 days is generous slack for a 30-min sweep whose real job is just to
  // catch what a missed webhook didn't — webhooks are the primary path.
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  const { resources } = await bridge.listTransactions(accessToken, { since })

  for (const tx of resources) {
    if (tx.deleted) continue
    await ingestBridgeTransaction(org._id, tx)
  }
}
