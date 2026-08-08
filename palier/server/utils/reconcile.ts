import type { HydratedDocument, Types } from 'mongoose'
import { Payment, type PaymentDoc } from '../models/Payment'
import { BankTransaction, type BankTransactionDoc } from '../models/BankTransaction'
import { Match, type MatchConfidence } from '../models/Match'
import type { OrganizationDoc } from '../models/Organization'
import { createBridgeClient, type BridgeTransaction } from './bridge'
import { createEnableBankingClient, enableBankingCredentialsFromConfig, type EnableBankingTransaction } from './enablebanking'

/**
 * Upserts one Bridge transaction, idempotent on (orgId, bridgeTransactionId)
 * — a redelivered webhook or an overlapping sweep is a no-op here, not a
 * duplicate. Then attempts to match it against an outstanding rent payment.
 */
export async function ingestBridgeTransaction(orgId: Types.ObjectId, tx: BridgeTransaction) {
  const doc = await BankTransaction.findOneAndUpdate(
    { orgId, provider: 'bridge', bridgeTransactionId: tx.id },
    {
      $setOnInsert: {
        orgId,
        provider: 'bridge',
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

/**
 * Same idempotent-upsert-then-match shape as ingestBridgeTransaction, for
 * Enable Banking's transaction shape instead. Lands in the same
 * BankTransaction collection (provider: 'enablebanking'), so tryMatch/claim
 * below don't need to know or care which aggregator a transaction came from.
 */
export async function ingestEnableBankingTransaction(orgId: Types.ObjectId, accountUid: string, tx: EnableBankingTransaction) {
  const externalId = tx.transaction_id ?? tx.entry_reference
  if (!externalId) return null // no stable id to dedupe on — skip rather than risk a duplicate ingest

  console.log(`[enablebanking] ingesting transaction ${externalId} for org=${orgId} account=${accountUid}`);
  console.log(JSON.stringify(tx, null, 2));

  // tryMatch()'s `tx.amount <= 0` credit-check below depends on getting the
  // sign right — confirmed 2026-08-07 against real CEPAC data: amount comes
  // unsigned, credit_debit_indicator is 'DBIT'/'CRDT' (real debits observed
  // with 'DBIT'), so this branch is what actually runs, not the fallback.
  const rawAmount = Number(tx.transaction_amount.amount)
  const indicator = tx.credit_debit_indicator
  const amount = indicator ? (indicator === 'CRDT' ? Math.abs(rawAmount) : -Math.abs(rawAmount)) : rawAmount

  // CEPAC pads remittance_information to a fixed width (e.g. "CB FOO
  // <lots of spaces> FACT 050826 <lots of spaces> 524389******0") — collapse
  // it rather than store/display that verbatim.
  const description = (
    (tx.remittance_information ?? []).join(' ') ||
    tx.debtor?.name ||
    tx.creditor?.name ||
    ''
  ).replace(/\s+/g, ' ').trim()

  const doc = await BankTransaction.findOneAndUpdate(
    { orgId, provider: 'enablebanking', enablebankingTransactionId: externalId },
    {
      // Identity/financial facts — set once at insert, never silently
      // rewritten by a later sync of the same transaction.
      $setOnInsert: {
        orgId,
        provider: 'enablebanking',
        enablebankingTransactionId: externalId,
        enablebankingAccountUid: accountUid,
        amount,
        currencyCode: tx.transaction_amount.currency,
        date: new Date(tx.booking_date),
      },
      // Display/debug fields — refreshed on EVERY sync (not just insert),
      // so a formatting fix like the whitespace-collapse above self-heals
      // already-ingested history the next time the sweep/manual sync runs,
      // instead of needing a one-off backfill script each time.
      $set: { description, raw: tx },
    },
    { upsert: true, new: true },
  )

  if (doc.matchedPaymentId) return doc
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
  const confidence: MatchConfidence = exact ? 'exact' : 'partial'

  return claim(tx, chosen, confidence)
}

/**
 * THE safety-critical step. Claims both sides atomically via a conditional
 * update keyed on the unique partial indexes declared on Payment and
 * BankTransaction (see those model files). If either write affects zero
 * documents, someone else — a concurrent webhook retry, an overlapping
 * sweep, or a landlord's manual link — already claimed one side; back off,
 * never retry-and-overwrite. This is a hard requirement per the plan, not
 * something to skip. Exported so the manual-link path below reuses this
 * exact safety mechanism instead of a second, easier-to-get-wrong copy of it.
 */
export async function claim(
  tx: HydratedDocument<BankTransactionDoc>,
  payment: HydratedDocument<PaymentDoc>,
  confidence: MatchConfidence,
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

export interface ManualLinkResult {
  ok: boolean
  reason?: 'transaction-not-found' | 'payment-not-found' | 'already-matched' | 'race-lost'
}

/**
 * Landlord-initiated override (server/api/transactions/[id]/link.post.ts) —
 * links one specific virement to one specific Rentila payment, bypassing
 * tryMatch's amount/name heuristics entirely (that's the point: a human
 * already confirmed it, e.g. a name mismatch or a transaction outside the
 * auto-matcher's usual window). Still goes through the exact same claim()
 * as the automated path, so the one-claim-per-side guarantee holds no
 * matter who initiated it — this is not a second, looser matching mechanism.
 */
export async function manualLinkTransaction(
  orgId: Types.ObjectId,
  transactionId: Types.ObjectId,
  paymentId: Types.ObjectId,
): Promise<ManualLinkResult> {
  const tx = await BankTransaction.findOne({ _id: transactionId, orgId })
  if (!tx) return { ok: false, reason: 'transaction-not-found' }
  if (tx.matchedPaymentId) return { ok: false, reason: 'already-matched' }

  const payment = await Payment.findOne({ _id: paymentId, orgId })
  if (!payment) return { ok: false, reason: 'payment-not-found' }
  if (payment.matchedTransactionId) return { ok: false, reason: 'already-matched' }

  const claimed = await claim(tx, payment, 'manual')
  return claimed ? { ok: true } : { ok: false, reason: 'race-lost' }
}

/**
 * Reverses a match (manual or automated) — mistakes in a human-picked link
 * are more likely than in the automated matcher, and without an undo the
 * only fix would be direct DB surgery. Resets the payment to 'pending'
 * (losing partial-payment nuance, but nothing here produces 'partial'
 * amounts today, so that's not a real loss) and drops the Match audit row.
 */
export async function unlinkTransaction(orgId: Types.ObjectId, transactionId: Types.ObjectId): Promise<boolean> {
  const tx = await BankTransaction.findOne({ _id: transactionId, orgId })
  if (!tx?.matchedPaymentId) return false

  const payment = await Payment.findOne({ _id: tx.matchedPaymentId, orgId })

  await BankTransaction.updateOne({ _id: tx._id }, { $unset: { matchedPaymentId: 1 } })
  if (payment) {
    await Payment.updateOne(
      { _id: payment._id },
      { $unset: { matchedTransactionId: 1 }, $set: { status: 'pending', amountPaid: 0, amountLeft: payment.amount } },
    )
    await Match.deleteOne({ paymentId: payment._id, bankTransactionId: tx._id })
  }
  return true
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
  // Placeholder credentials (see .env.example — still `<paste production
  // Client-Id...>` until Bridge's KYB clears) can't possibly authenticate;
  // skip the doomed API call and its noisy 401 stack trace rather than let
  // it hit Bridge every sweep. Same "don't attempt a call that can't
  // succeed" guard Rentila's sync has for "not connected yet".
  if (!config.bridgeClientId || config.bridgeClientId.startsWith('<') || config.bridgeClientSecret.startsWith('<')) {
    return
  }
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

/**
 * Same job as syncOrgTransactions above, for Enable Banking. No webhooks on
 * this path at all (unlike Bridge) — this poll IS the primary path, not
 * just a sweep backstop, so callers should run it right after connect too
 * (see server/api/enablebanking/callback.get.ts), not only on the schedule.
 */
export async function syncOrgEnableBankingTransactions(
  org: HydratedDocument<OrganizationDoc>,
  { days = 7 }: { days?: number } = {},
): Promise<{ rateLimited: boolean }> {
  if (!org.enablebanking.sessionId || !org.enablebanking.accountUids?.length) return { rateLimited: false }

  const config = useRuntimeConfig()
  const client = createEnableBankingClient(enableBankingCredentialsFromConfig(config))

  // Default 7 days: same slack as Bridge's sweep, for the same reason —
  // the recurring poll only needs to cover what could have landed (or been
  // amended from PDNG to BOOK) since the last one.
  //
  // The FIRST sync after a connect must NOT use that default, though: it's
  // the only chance to pull history that predates the consent, and without
  // it the dashboard shows a near-empty "Virements reçus" list on day one
  // (observed: 42 lines ingested, exactly 1 of them a credit — the rest
  // were card debits, which that view filters out by design). Callers pass
  // a wider window for that; see callback.get.ts. PSD2 entitles the user to
  // ~90 days of history without a fresh SCA, and banks cap it themselves
  // anyway, so asking for more than they allow just returns what they have.
  const dateFrom = new Date(Date.now() - 1000 * 60 * 60 * 24 * days).toISOString().slice(0, 10)

  for (const accountUid of org.enablebanking.accountUids) {
    let continuationKey: string | undefined
    do {
      let page: { transactions: EnableBankingTransaction[]; continuation_key?: string }
      try {
        page = await client.listTransactions(accountUid, { dateFrom, continuationKey })
      } catch (err) {
        // PSD2 requires ASPSPs to rate-limit AIS polling (a handful of
        // pulls/day per account is a common cap) — expected under repeated
        // manual "Sync now" testing, not a bug. Stop cleanly rather than
        // crash the request; the next scheduled sweep (or a later manual
        // sync) picks up right where this left off since ingest is
        // idempotent either way.
        const status = (err as { statusCode?: number; response?: { status?: number } })?.statusCode ??
          (err as { response?: { status?: number } })?.response?.status
        if (status === 429) return { rateLimited: true }
        throw err
      }

      // Prints the exact response Enable Banking just returned, live, the
      // moment each page comes back — requested explicitly for watching
      // real syncs in the `npm run dev` terminal, not just inspecting
      // already-stored data after the fact.
      // eslint-disable-next-line no-console
      console.log(
        `[enablebanking] account=${accountUid} page: ${page.transactions.length} transaction(s)` +
          (page.continuation_key ? ' (more pages follow)' : ''),
      )
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(page, null, 2))

      for (const tx of page.transactions) {
        await ingestEnableBankingTransaction(org._id, accountUid, tx)
      }
      continuationKey = page.continuation_key
    } while (continuationKey)
  }

  return { rateLimited: false }
}
