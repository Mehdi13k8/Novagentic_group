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
  // Fast, no-KYB alternative to Bridge (Restricted Production — self-linked
  // accounts only, see server/utils/enablebanking.ts). Separate provider,
  // separate state; BankTransaction.provider tells them apart downstream.
  enablebanking: {
    pendingState?: string // set on /connect, checked+cleared on /callback — loose CSRF/replay guard
    sessionId?: string // Enable Banking's session id after a successful consent exchange
    aspspName?: string
    aspspCountry?: string
    accountUids?: string[] // the linked account(s) this session grants access to
    validUntil?: Date // consent expiry — bank-set, may be shorter than requested
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
    enablebanking: {
      pendingState: { type: String },
      sessionId: { type: String },
      aspspName: { type: String },
      aspspCountry: { type: String },
      accountUids: [{ type: String }],
      validUntil: { type: Date },
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
