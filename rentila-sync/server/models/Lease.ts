import { Schema, Types } from 'mongoose'
import { rentSyncDb } from '../utils/db'

export interface LeaseDoc {
  orgId: Types.ObjectId
  rentilaId: number // Rentila's Lease.Id
  propertyId: Types.ObjectId
  // A lease's `Tenants` field from Rentila is an array (co-tenants) — don't
  // assume one tenant per lease, confirmed on a live response.
  tenantIds: Types.ObjectId[]
  startDate: Date
  endDate?: Date
  monthlyAmount: number
  raw: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const leaseSchema = new Schema<LeaseDoc>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    rentilaId: { type: Number, required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    tenantIds: [{ type: Schema.Types.ObjectId, ref: 'Tenant', required: true }],
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    monthlyAmount: { type: Number, required: true },
    raw: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

leaseSchema.index({ orgId: 1, rentilaId: 1 }, { unique: true })

export const Lease = rentSyncDb.models.Lease || rentSyncDb.model<LeaseDoc>('Lease', leaseSchema)
