import { Schema, Types } from 'mongoose'
import { rentSyncDb } from '../utils/db'

export interface BankTransactionDoc {
  orgId: Types.ObjectId
  provider: 'bridge' | 'enablebanking'
  // Only one of each pair is set, per `provider` — kept as two optional
  // field-sets rather than one generic `externalId` so the already-working
  // Bridge ingest path (server/utils/reconcile.ts) didn't need touching
  // when Enable Banking was added alongside it.
  bridgeTransactionId?: number // Bridge's own transaction id — the idempotency key for Bridge ingest
  bridgeAccountId?: number
  enablebankingTransactionId?: string // Enable Banking's transaction_id/entry_reference — idempotency key for that ingest
  enablebankingAccountUid?: string
  amount: number
  currencyCode: string
  date: Date
  description: string // what we keyword-match against Payment.personLabel
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
    provider: { type: String, enum: ['bridge', 'enablebanking'], required: true, default: 'bridge' },
    bridgeTransactionId: { type: Number },
    bridgeAccountId: { type: Number },
    enablebankingTransactionId: { type: String },
    enablebankingAccountUid: { type: String },
    amount: { type: Number, required: true },
    currencyCode: { type: String, required: true, default: 'EUR' },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    matchedPaymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    raw: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

// The idempotent-ingest key per provider: a redelivered webhook or
// overlapping poll upserts the same document instead of creating a
// duplicate transaction. Partial so the two providers' id spaces never
// collide and neither field has to be `required` on the other's docs.
bankTransactionSchema.index(
  { orgId: 1, bridgeTransactionId: 1 },
  { unique: true, partialFilterExpression: { provider: 'bridge' } },
)
bankTransactionSchema.index(
  { orgId: 1, enablebankingTransactionId: 1 },
  { unique: true, partialFilterExpression: { provider: 'enablebanking' } },
)

bankTransactionSchema.index(
  { matchedPaymentId: 1 },
  { unique: true, partialFilterExpression: { matchedPaymentId: { $exists: true } } },
)

export const BankTransaction =
  rentSyncDb.models.BankTransaction || rentSyncDb.model<BankTransactionDoc>('BankTransaction', bankTransactionSchema)
