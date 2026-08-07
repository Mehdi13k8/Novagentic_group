import mongoose from 'mongoose'

let connecting: Promise<typeof mongoose> | null = null

/**
 * Call once from server/plugins/mongo.ts at boot. Safe to call again
 * (idempotent) — later calls just await the same in-flight/completed
 * connection.
 */
export function connectMongo() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose)
  if (!connecting) {
    const { mongodbUri } = useRuntimeConfig()
    if (!mongodbUri) throw new Error('MONGODB_URI is not set')
    connecting = mongoose.connect(mongodbUri)
  }
  return connecting
}

/**
 * One Atlas cluster, split into two logical databases so future products
 * (e.g. an investments/SCPI tracker mentioned during planning) can share
 * the cluster later without their collections mixing into this product's:
 *
 * - `core`      — platform-wide: users, organizations, billing status.
 * - `rent_sync` — this product's own data: properties, leases, payments,
 *                 bank transactions, matches.
 *
 * Models are defined against these synchronously at import time — Mongoose
 * buffers operations until connectMongo() resolves, so it's fine that model
 * files get imported before the plugin has actually connected.
 */
export const coreDb = mongoose.connection.useDb('core', { useCache: true })
export const rentSyncDb = mongoose.connection.useDb('rent_sync', { useCache: true })
