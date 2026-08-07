import { Schema, Types } from 'mongoose'
import { rentSyncDb } from '../utils/db'

export interface BankTransactionDoc {
  orgId: Types.ObjectId
  bridgeTransactionId: number // Bridge's own transaction id — the idempotency key for ingest
  bridgeAccountId: number
  amount: number
  currencyCode: string
  date: Date
  description: string // Bridge's clean_description — what we keyword-match against Payment.personLabel
  // Set ONLY by the reconciliation engine's atomic claim. Unique + partial,
  // mirrors Payment.matchedTransactionId — see server/utils/reconcile.ts.
  matchedPaymentId?: Types.ObjectId
  raw: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const bankTransactionSchema = new Schema<BankTransactionDoc>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    bridgeTransactionId: { type: Number, required: true },
    bridgeAccountId: { type: Number, required: true },
    amount: { type: Number, required: true },
    currencyCode: { type: String, required: true, default: 'EUR' },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    matchedPaymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    raw: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

// The idempotent-ingest key: a redelivered webhook or overlapping poll
// upserts the same document instead of creating a duplicate transaction.
bankTransactionSchema.index({ orgId: 1, bridgeTransactionId: 1 }, { unique: true })

bankTransactionSchema.index(
  { matchedPaymentId: 1 },
  { unique: true, partialFilterExpression: { matchedPaymentId: { $exists: true } } },
)

export const BankTransaction =
  rentSyncDb.models.BankTransaction || rentSyncDb.model<BankTransactionDoc>('BankTransaction', bankTransactionSchema)
