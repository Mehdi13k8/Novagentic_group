import { Schema, Types } from 'mongoose'
import { rentSyncDb } from '../utils/db'

// 'manual' = a landlord-picked link (server/api/transactions/[id]/link.post.ts)
// — the automated matcher (reconcile.ts's tryMatch) never assigns this itself,
// it's how a human override is told apart from the automated confidence
// levels in the audit trail.
export type MatchConfidence = 'exact' | 'partial' | 'manual'
export type WriteBackStatus = 'notified' | 'written' | 'failed'

/**
 * Audit trail of every successful claim — kept separate from the
 * matchedTransactionId/matchedPaymentId fields on Payment/BankTransaction
 * (which are what actually enforce the one-to-one constraint). This
 * collection is for history/debugging, not the safety mechanism itself;
 * its own unique indexes below are defense-in-depth, not the primary guard.
 */
export interface MatchDoc {
  orgId: Types.ObjectId
  paymentId: Types.ObjectId
  bankTransactionId: Types.ObjectId
  confidence: MatchConfidence
  writeBackStatus: WriteBackStatus
  // Rentila's REST API is confirmed read-only for this app's credentials
  // (see README / plan doc, Phase 0 findings) — so `written` isn't reachable
  // yet via that path. Left modeled for if the Rentila MCP connector proves
  // to expose a write action later.
  note?: string
  createdAt: Date
  updatedAt: Date
}

const matchSchema = new Schema<MatchDoc>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    bankTransactionId: { type: Schema.Types.ObjectId, ref: 'BankTransaction', required: true },
    confidence: { type: String, enum: ['exact', 'partial', 'manual'], required: true },
    writeBackStatus: { type: String, enum: ['notified', 'written', 'failed'], required: true },
    note: { type: String },
  },
  { timestamps: true },
)

matchSchema.index({ paymentId: 1 }, { unique: true })
matchSchema.index({ bankTransactionId: 1 }, { unique: true })

export const Match = rentSyncDb.models.Match || rentSyncDb.model<MatchDoc>('Match', matchSchema)
