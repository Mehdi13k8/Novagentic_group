import { Schema, Types } from 'mongoose'
import { rentSyncDb } from '../utils/db'

export interface TenantDoc {
  orgId: Types.ObjectId
  rentilaId: number // Rentila's Tenant.Id
  firstName?: string
  lastName?: string
  fullName: string // used for keyword matching against bank transaction descriptions
  raw: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const tenantSchema = new Schema<TenantDoc>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    rentilaId: { type: Number, required: true },
    firstName: { type: String },
    lastName: { type: String },
    fullName: { type: String, required: true },
    raw: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

tenantSchema.index({ orgId: 1, rentilaId: 1 }, { unique: true })

export const Tenant = rentSyncDb.models.Tenant || rentSyncDb.model<TenantDoc>('Tenant', tenantSchema)
