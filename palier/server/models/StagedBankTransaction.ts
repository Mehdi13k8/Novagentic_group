import { Schema, Types } from 'mongoose'
import { rentSyncDb } from '../utils/db'

/**
 * Raw landing zone for everything a bank aggregator hands us, for every
 * customer, before any of this product's business logic touches it.
 *
 * Why this exists as its own collection rather than just `BankTransaction`:
 *
 * 1. REPLAY. Normalisation is the part most likely to be wrong (the
 *    amount-sign question was exactly that). Fixing it used to mean
 *    re-polling the bank — but PSD2 caps AIS polling to a handful of pulls
 *    per account per day, so a bug fix competed with the product's normal
 *    operation for the same scarce quota. With the payload kept here,
 *    reprocessing is a local operation: see
 *    server/api/enablebanking/replay.post.ts.
 *
 * 2. ROWS WE USED TO DROP. `ingestEnableBankingTransaction` refuses any
 *    transaction with no `transaction_id`/`entry_reference`, because
 *    without a stable id it cannot dedupe. That refusal was silent — the
 *    transaction simply vanished. Here it is retained regardless (see
 *    `fingerprint` below), so a bank that doesn't populate those fields is
 *    a visible, diagnosable problem rather than missing money.
 *
 * `orgId` is set at write time, NOT resolved later: an Enable Banking poll
 * runs against one org's own consented account uids, so the owner is known
 * the moment the payload arrives. Deferring it would re-derive something we
 * already had and leave rows temporarily unattributed.
 */
export interface StagedBankTransactionDoc {
  provider: 'bridge' | 'enablebanking'
  orgId: Types.ObjectId
  accountRef: string // account uid (Enable Banking) or account id (Bridge), as a string
  // The provider's own id when it gave us one. Absent is legitimate and is
  // precisely the case this collection exists to stop losing.
  externalId?: string
  /**
   * The dedupe key, always present. Equal to `externalId` when the provider
   * supplied one; otherwise a content hash of the payload's identifying
   * fields, suffixed with an occurrence number.
   *
   * The suffix matters: two genuinely distinct transactions can be identical
   * in every visible field (same day, same amount, same label — two coffees
   * on one card). A bare content hash would silently collapse them into one
   * row, which is the same data loss this collection is meant to prevent.
   * Occurrence is assigned by position within the fetch batch, so a repeated
   * poll over the same window reproduces the same numbering and stays
   * idempotent. It is NOT stable if the window shifts such that one of a pair
   * falls out of range — an accepted trade for rows that are currently
   * discarded outright.
   */
  fingerprint: string
  raw: Record<string, unknown>
  fetchedAt: Date
  // Null until normalisation has turned this into a BankTransaction. Cleared
  // by a replay to force reprocessing.
  processedAt?: Date
  // Set when normalisation threw for this row, so one malformed payload is
  // visible instead of silently stalling a batch.
  processedError?: string
  createdAt: Date
  updatedAt: Date
}

const stagedBankTransactionSchema = new Schema<StagedBankTransactionDoc>(
  {
    provider: { type: String, enum: ['bridge', 'enablebanking'], required: true },
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    accountRef: { type: String, required: true },
    externalId: { type: String },
    fingerprint: { type: String, required: true },
    raw: { type: Schema.Types.Mixed, required: true },
    fetchedAt: { type: Date, required: true },
    processedAt: { type: Date },
    processedError: { type: String },
  },
  { timestamps: true },
)

// Landing is idempotent: re-polling an overlapping window upserts the same
// documents rather than growing the collection every 30 minutes.
stagedBankTransactionSchema.index(
  { provider: 1, orgId: 1, fingerprint: 1 },
  { unique: true },
)

// The processing queue's access pattern: "what has this org not yet turned
// into a BankTransaction?"
stagedBankTransactionSchema.index({ orgId: 1, provider: 1, processedAt: 1 })

export const StagedBankTransaction =
  rentSyncDb.models.StagedBankTransaction ||
  rentSyncDb.model<StagedBankTransactionDoc>('StagedBankTransaction', stagedBankTransactionSchema)
