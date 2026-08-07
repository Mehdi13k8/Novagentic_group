import { Schema, Types } from 'mongoose'
import { rentSyncDb } from '../utils/db'

export interface PropertyDoc {
  orgId: Types.ObjectId
  rentilaId: number // Rentila's Property.Id — stable external key for this org
  title: string
  city?: string
  rent?: number
  raw: Record<string, unknown> // full Rentila payload, for fields not modeled explicitly
  createdAt: Date
  updatedAt: Date
}

const propertySchema = new Schema<PropertyDoc>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    rentilaId: { type: Number, required: true },
    title: { type: String, required: true },
    city: { type: String },
    rent: { type: Number },
    raw: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

// One cached property per (org, Rentila id) — a re-sync updates, never duplicates.
propertySchema.index({ orgId: 1, rentilaId: 1 }, { unique: true })

export const Property = rentSyncDb.models.Property || rentSyncDb.model<PropertyDoc>('Property', propertySchema)
