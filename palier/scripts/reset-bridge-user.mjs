#!/usr/bin/env node
// One-off fix for: switching an org's NUXT_BRIDGE_CLIENT_ID/SECRET between
// sandbox and production (or between two different Bridge apps) without
// clearing Organization.bridge.userUuid first. Bridge users are scoped
// per-app — a userUuid created under sandbox creds doesn't exist under
// production creds (or vice versa), so /aggregation/authorization/token
// 401s even though the credentials and code are both fine.
//
// Clears bridge.userUuid/itemId so the next "Connect a bank account" click
// creates a fresh Bridge user under whichever Client-Id/Secret is
// currently in .env.
//
// Run with: node --env-file=.env scripts/reset-bridge-user.mjs you@example.com
// (email required — deliberately not defaulting to "every org" to avoid
// wiping a working connection on a different org by accident.)

import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI ?? process.env.NUXT_MONGODB_URI
if (!uri) {
  console.error('Set NUXT_MONGODB_URI in .env first.')
  process.exit(1)
}

const email = process.argv[2]
if (!email) {
  console.error('Usage: node --env-file=.env scripts/reset-bridge-user.mjs you@example.com')
  process.exit(1)
}

await mongoose.connect(uri)
const coreDb = mongoose.connection.useDb('core', { useCache: true })

// Minimal schemas, deliberately not importing server/models/* — those go
// through server/utils/db.ts's connectMongo(), which calls Nuxt's
// useRuntimeConfig() and only works inside a Nitro request context, not a
// standalone script (same reason probe-rentila.mjs doesn't reuse
// server/utils/rentila.ts either).
const User = coreDb.models.User || coreDb.model('User', new mongoose.Schema({ email: String }))
const Organization =
  coreDb.models.Organization ||
  coreDb.model(
    'Organization',
    new mongoose.Schema({
      ownerUserId: mongoose.Schema.Types.ObjectId,
      bridge: { userUuid: String, itemId: Number },
    }),
  )

const user = await User.findOne({ email: email.toLowerCase() })
if (!user) {
  console.error(`No user found for ${email}`)
  process.exit(1)
}

const before = await Organization.findOne({ ownerUserId: user._id })
if (!before) {
  console.error(`No organization found for ${email}`)
  process.exit(1)
}

if (!before.bridge?.userUuid && before.bridge?.itemId == null) {
  console.log('bridge.userUuid/itemId already unset — nothing to do.')
  process.exit(0)
}

console.log(`Clearing bridge.userUuid (was set) for ${email}'s org...`)
await Organization.updateOne({ _id: before._id }, { $unset: { 'bridge.userUuid': '', 'bridge.itemId': '' } })
console.log('Done. Next "Connect a bank account" click will create a fresh Bridge user under the current .env credentials.')
process.exit(0)
