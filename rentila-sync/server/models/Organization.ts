import { Schema, Types } from 'mongoose'
import { coreDb } from '../utils/db'

export interface OrganizationDoc {
  name: string
  ownerUserId: Types.ObjectId
  plan: 'trial' | 'active' | 'canceled'
  rentila: {
    clientId?: string
    encryptedClientSecret?: string // see server/utils/crypto.ts — never store plaintext
    landlordId?: number // Rentila's own LandlordID, filled in after first successful call
  }
  bridge: {
    userUuid?: string // Bridge aggregation user for this org (one Bridge app, many users)
    itemId?: number // the bank connection created via Connect
  }
  stripe: {
    customerId?: string
    subscriptionId?: string
    // Mirrors Stripe's own subscription.status ('active' | 'past_due' |
    // 'canceled' | 'incomplete' | ...) — kept separate from `plan` above,
    // which is this app's coarser trial/active/canceled gate. Synced by
    // server/api/webhooks/stripe.post.ts, never set by hand.
    subscriptionStatus?: string
  }
  createdAt: Date
  updatedAt: Date
}

const organizationSchema = new Schema<OrganizationDoc>(
  {
    name: { type: String, required: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['trial', 'active', 'canceled'], default: 'trial' },
    rentila: {
      clientId: { type: String },
      encryptedClientSecret: { type: String },
      landlordId: { type: Number },
    },
    bridge: {
      userUuid: { type: String },
      itemId: { type: Number },
    },
    stripe: {
      customerId: { type: String },
      subscriptionId: { type: String },
      subscriptionStatus: { type: String },
    },
  },
  { timestamps: true },
)

export const Organization =
  coreDb.models.Organization || coreDb.model<OrganizationDoc>('Organization', organizationSchema)
