#!/usr/bin/env node
// Dumps the transactions Enable Banking currently exposes for an org's
// linked account(s), straight from the provider — no Nuxt, no Mongo writes,
// nothing ingested. Read-only counterpart to the /api/enablebanking/sync
// route: use this to see what the bank ACTUALLY returns before/without
// letting server/utils/reconcile.ts normalise and store it.
//
// Run with: npm run virements [-- options]
//   --days N     how far back to look (default 30; banks usually cap ~90)
//   --org N      pick an org by index when several are connected
//   --credits    only money in (credit_debit_indicator === 'CRDT')
//   --json       raw provider JSON instead of the table
//
// The app-level JWT alone grants access to NO accounts — the account uids
// come from a consent the landlord already completed in the browser
// (server/api/enablebanking/callback.get.ts stores them on the org). So
// this script reads those uids from Mongo; it cannot bootstrap a
// connection, only use an existing one.

import { createSign } from 'node:crypto'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const mongoose = require('mongoose')

const BASE_URL = 'https://api.enablebanking.com'

const applicationId = process.env.NUXT_ENABLEBANKING_APPLICATION_ID
const privateKeyB64 = process.env.NUXT_ENABLEBANKING_PRIVATE_KEY_B64
const mongoUri = process.env.NUXT_MONGODB_URI
if (!applicationId || !privateKeyB64) {
  console.error('Set NUXT_ENABLEBANKING_APPLICATION_ID and NUXT_ENABLEBANKING_PRIVATE_KEY_B64 in .env first.')
  process.exit(1)
}
if (!mongoUri) {
  console.error('Set NUXT_MONGODB_URI in .env first — the account uids live on the org document.')
  process.exit(1)
}
const privateKeyPem = Buffer.from(privateKeyB64, 'base64').toString('utf8')

// --- args ---
const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const value = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback
}
const days = Number(value('days', 30))
const orgPick = value('org', null)
const creditsOnly = flag('credits')
const asJson = flag('json')

function signJwt() {
  const now = Math.floor(Date.now() / 1000)
  const header = { typ: 'JWT', alg: 'RS256', kid: applicationId }
  const payload = { iss: 'enablebanking.com', aud: 'api.enablebanking.com', iat: now, exp: now + 3600 }
  const signingInput = `${Buffer.from(JSON.stringify(header)).toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}`
  return `${signingInput}.${createSign('RSA-SHA256').update(signingInput).sign(privateKeyPem).toString('base64url')}`
}

const token = signJwt()

// --- find the connected org ---
await mongoose.connect(mongoUri, { dbName: 'core' })
const orgs = await mongoose.connection
  .collection('organizations')
  .find({ 'enablebanking.sessionId': { $exists: true, $ne: null } })
  .sort({ updatedAt: -1 })
  .toArray()
await mongoose.disconnect()

if (orgs.length === 0) {
  console.error('No org has a completed Enable Banking consent yet — connect a bank in the app first.')
  process.exit(1)
}

let org = orgs[0]
if (orgPick !== null) {
  const i = Number(orgPick)
  if (!orgs[i]) {
    console.error(`--org ${orgPick} is out of range (0..${orgs.length - 1}).`)
    process.exit(1)
  }
  org = orgs[i]
} else if (orgs.length > 1) {
  console.log(`${orgs.length} connected orgs — using [0]. Override with --org N:`)
  orgs.forEach((o, i) => console.log(`  [${i}] ${o.name} — ${o.enablebanking.aspspName}`))
  console.log('')
}

const { accountUids = [], aspspName, validUntil } = org.enablebanking
console.log(`Org:     ${org.name}`)
console.log(`Bank:    ${aspspName}`)
console.log(`Consent: valid until ${validUntil ? new Date(validUntil).toISOString().slice(0, 10) : 'unknown'}`)
console.log(`Window:  last ${days} days\n`)

const dateFrom = new Date(Date.now() - 1000 * 60 * 60 * 24 * days).toISOString().slice(0, 10)

const all = []
for (const accountUid of accountUids) {
  let continuationKey
  do {
    const qs = new URLSearchParams({ date_from: dateFrom })
    if (continuationKey) qs.set('continuation_key', continuationKey)

    const res = await fetch(`${BASE_URL}/accounts/${accountUid}/transactions?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 429) {
      console.error(
        'FAILED: 429 — the bank is rate-limiting transaction polling. This is a PSD2-mandated cap, not a bug;\n' +
          'wait and retry (the app hits the same wall, see the 429 branch in server/utils/reconcile.ts).',
      )
      process.exit(1)
    }
    if (!res.ok) {
      console.error(`FAILED: ${res.status} ${res.statusText}`)
      console.error(await res.text())
      process.exit(1)
    }

    const page = await res.json()
    all.push(...(page.transactions ?? []))
    continuationKey = page.continuation_key
  } while (continuationKey)
}

const rows = creditsOnly ? all.filter((t) => t.credit_debit_indicator === 'CRDT') : all

if (asJson) {
  console.log(JSON.stringify(rows, null, 2))
  process.exit(0)
}

if (rows.length === 0) {
  console.log(`No transactions returned since ${dateFrom}.`)
  process.exit(0)
}

// amount is UNSIGNED — credit_debit_indicator carries the direction.
for (const t of rows.sort((a, b) => (a.booking_date < b.booking_date ? 1 : -1))) {
  const credit = t.credit_debit_indicator === 'CRDT'
  const sign = credit ? '+' : '-'
  const who = (credit ? t.debtor?.name : t.creditor?.name) ?? '—'
  const label = (t.remittance_information ?? []).join(' ').trim()
  console.log(
    `${t.booking_date}  ${sign}${t.transaction_amount.amount.padStart(10)} ${t.transaction_amount.currency}  ` +
      `${who.slice(0, 28).padEnd(28)}  ${t.status.padEnd(5)} ${label.slice(0, 50)}`,
  )
}

const totalIn = rows.filter((t) => t.credit_debit_indicator === 'CRDT').length
console.log(`\n${rows.length} transaction(s) since ${dateFrom} — ${totalIn} in, ${rows.length - totalIn} out.`)
