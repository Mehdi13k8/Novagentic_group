import { Schema, Types } from 'mongoose'
import { rentSyncDb } from '../utils/db'

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'lost'

export interface PaymentDoc {
  orgId: Types.ObjectId
  rentilaId: number // Rentila's Payment.Id
  propertyId: Types.ObjectId
  // Expenses (ENGIE, syndic, taxes...) don't carry a real lease/tenant in
  // Rentila's data — only rent does. Optional rather than a placeholder
  // ObjectId, so "no tenant" is representable instead of faked.
  leaseId?: Types.ObjectId
  tenantId?: Types.ObjectId
  kind: 'rent' | 'expense'
  amount: number
  amountPaid: number
  amountLeft: number
  status: PaymentStatus
  dueDate: Date
  personLabel: string // Rentila's PaymentPerson — the free-text name/keyword to match against bank descriptions
  // Set ONLY by the reconciliation engine's atomic claim (see server/utils/reconcile.ts).
  // Unique + partial (only enforced when actually set) — this is what makes
  // double-matching structurally impossible, not just unlikely.
  matchedTransactionId?: Types.ObjectId
  raw: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const paymentSchema = new Schema<PaymentDoc>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    rentilaId: { type: Number, required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    leaseId: { type: Schema.Types.ObjectId, ref: 'Lease' },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    kind: { type: String, enum: ['rent', 'expense'], required: true },
    amount: { type: Number, required: true },
    amountPaid: { type: Number, required: true, default: 0 },
    amountLeft: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['pending', 'paid', 'partial', 'lost'], required: true },
    dueDate: { type: Date, required: true },
    personLabel: { type: String, required: true },
    matchedTransactionId: { type: Schema.Types.ObjectId, ref: 'BankTransaction' },
    raw: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

paymentSchema.index({ orgId: 1, rentilaId: 1 }, { unique: true })

// The hard safety constraint from the plan: a bank transaction can claim at
// most one payment. Partial index (only when the field is actually set) so
// the many unmatched payments — where the field is absent — don't collide
// on a shared "null".
paymentSchema.index(
  { matchedTransactionId: 1 },
  { unique: true, partialFilterExpression: { matchedTransactionId: { $exists: true } } },
)

export const Payment = rentSyncDb.models.Payment || rentSyncDb.model<PaymentDoc>('Payment', paymentSchema)
